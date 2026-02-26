import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/database.types';

const N8N_URL = process.env.N8N_URL_TEST;

function withAuthCookies(
  response: NextResponse,
  cookiesToSet: { name: string; value: string; options: CookieOptions }[]
): NextResponse {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export async function POST(request: Request) {
  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookiesToSet.push({ name, value, options });
        },
        remove(name: string, options: CookieOptions) {
          cookiesToSet.push({ name, value: '', options });
        },
      },
    }
  );

  if (!N8N_URL?.trim()) {
    return withAuthCookies(
      NextResponse.json(
        { error: 'N8N webhook not configured (N8N_URL_TEST)' },
        { status: 500 }
      ),
      cookiesToSet
    );
  }

  let body: { userId?: string; message?: string; currentEmotion?: string | null };
  try {
    body = await request.json();
  } catch {
    return withAuthCookies(
      NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      ),
      cookiesToSet
    );
  }

  const { userId, message, currentEmotion } = body;
  if (!userId || typeof message !== 'string') {
    return withAuthCookies(
      NextResponse.json(
        { error: 'Missing userId or message' },
        { status: 400 }
      ),
      cookiesToSet
    );
  }


  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return withAuthCookies(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      cookiesToSet
    );
  }
  if (user.id !== userId) {
    return withAuthCookies(
      NextResponse.json({ error: 'userId does not match session' }, { status: 403 }),
      cookiesToSet
    );
  }

  try {
    const res = await fetch(N8N_URL.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        message: message.trim(),
        currentEmotion: currentEmotion ?? null,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[api/chat] n8n responded with', res.status, text?.slice(0, 500));
      return withAuthCookies(
        NextResponse.json(
          {
            error: 'Error in n8n workflow',
            details: text?.slice(0, 500) || res.statusText,
            status: res.status,
          },
          { status: 502 }
        ),
        cookiesToSet
      );
    }

    const rawText = await res.text();
    const data = rawText ? (() => { try { return JSON.parse(rawText); } catch { return {}; } })() : {};
    return withAuthCookies(NextResponse.json(data), cookiesToSet);
  } catch (err) {
    console.error('API /api/chat:', err);
    return withAuthCookies(
      NextResponse.json(
        { error: 'Error calling n8n webhook' },
        { status: 502 }
      ),
      cookiesToSet
    );
  }
}
