import React from 'react';

export function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            {icon}
            <h2 className="text-lg font-semibold text-[#1A1A1A]">{title}</h2>
            <span className="rounded-full bg-[#F5F3EF] px-2.5 py-0.5 text-xs font-medium text-[#6B7280]">{count}</span>
        </div>
    );
}

export function EmptySection({ message }: { message: string }) {
    return (
        <div className="rounded-xl border-2 border-dashed border-[#E5E7EB] bg-white/50 px-6 py-8 text-center">
            <p className="text-sm text-[#6B7280]">{message}</p>
        </div>
    );
}
