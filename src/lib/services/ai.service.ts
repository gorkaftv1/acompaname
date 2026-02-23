/**
 * AI Service - Mockup Implementation
 * 
 * Genera respuestas empáticas simuladas del asistente de IA.
 * En producción, esto se reemplazaría con llamadas a OpenAI/Anthropic.
 * 
 * Features:
 * - Respuestas contextuales basadas en la emoción del usuario
 * - Variedad de respuestas para evitar repetición
 * - Tono empático y de apoyo
 */

import type { EmotionType } from '@/types';

interface AIResponse {
  message: string;
  emotion?: EmotionType;
  suggestions?: string[];
}

/**
 * Respuestas empáticas categorizadas por emoción
 */
const EMPATHETIC_RESPONSES: Record<EmotionType, string[]> = {
  calm: [
    'Me alegro mucho de que te sientas tranquila hoy. Estos momentos de calma son importantes para recargarte. ¿Hay algo específico que haya contribuido a este estado de paz?',
    'Qué bien que estés experimentando tranquilidad. Es valioso reconocer y disfrutar estos momentos. ¿Qué actividad o momento del día te ha ayudado más a sentirte así?',
    '¡Excelente que te sientas en calma! Aprovecha este estado para cuidarte. ¿Has pensado en qué te gustaría hacer con esta energía positiva?',
    'Me encanta escuchar que estás tranquila. La calma es un estado valioso que mereces. ¿Hay algo que te gustaría compartir sobre tu día?',
  ],
  okay: [
    'Entiendo que es un día normal, manejando las cosas como van viniendo. Eso también está bien. A veces la estabilidad es una pequeña victoria. ¿Cómo puedo apoyarte hoy?',
    'Está bien ir "llevándola". No todos los días tienen que ser extraordinarios. Lo importante es que estás aquí y continúas cuidando. ¿Hay algo en particular en tu mente?',
    'Veo que estás manejando las cosas. Eso en sí mismo es admirable. El cuidado es un trabajo constante. ¿Necesitas hablar de algo específico?',
    'Navegar el día a día puede ser agotador, pero lo estás haciendo. ¿Hay algo que pueda hacer más llevadero hoy?',
  ],
  challenging: [
    'Lamento que estés pasando por un momento difícil. El cuidado puede ser muy desafiante y tus sentimientos son completamente válidos. ¿Quieres hablar de lo que está ocurriendo?',
    'Reconozco que hoy es un día complicado. No estás sola en esto. A veces solo expresar lo que sentimos puede ayudar. ¿Qué es lo que más te pesa en este momento?',
    'Los días difíciles son parte del proceso, pero eso no los hace más fáciles de sobrellevar. Está bien sentirte abrumada. ¿Hay algo específico que esté siendo especialmente desafiante?',
    'Entiendo que estás teniendo un día complicado. Tu cansancio y frustración son comprensibles. Recuerda que no tienes que ser perfecta. ¿Cómo puedo apoyarte ahora?',
  ],
  mixed: [
    'Los sentimientos encontrados son normales en el cuidado. Puedes sentir amor y frustración al mismo tiempo, y ambos son válidos. ¿Quieres explorar qué emociones estás experimentando?',
    'Entiendo que hoy es un día de emociones mixtas. El cuidado es complejo y pueden coexistir muchos sentimientos diferentes. ¿Qué es lo que más predomina en este momento?',
    'Es completamente normal tener sentimientos contradictorios. El cuidado trae consigo una gama amplia de emociones. ¿Te gustaría hablar sobre lo que estás sintiendo?',
    'Las emociones mixtas reflejan la complejidad de tu rol como cuidadora. No hay respuestas simples, y eso está bien. ¿Hay algo específico que te gustaría compartir?',
  ],
};

/**
 * Respuestas generales para cuando no hay emoción específica
 */
const GENERAL_RESPONSES = [
  'Gracias por compartir esto conmigo. Estoy aquí para escucharte y apoyarte en lo que necesites. ¿Hay algo más que te gustaría contarme?',
  'Te escucho. El cuidado es un camino con muchos altibajos. ¿Cómo puedo ayudarte mejor en este momento?',
  'Valoro mucho que compartas tu experiencia conmigo. Tu bienestar es importante. ¿Qué más está en tu mente?',
  'Estoy aquí para ti. Cada día trae sus propios desafíos y victorias. ¿Qué es lo más importante que estás enfrentando ahora?',
];

/**
 * Respuestas basadas en palabras clave en el mensaje del usuario
 */
const KEYWORD_RESPONSES: { keywords: string[]; responses: string[] }[] = [
  {
    keywords: ['cansada', 'cansancio', 'agotada', 'fatiga', 'sueño', 'dormir', 'insomnio'],
    responses: [
      'El cansancio acumulado es uno de los mayores desafíos del cuidado. Tu cuerpo y mente necesitan descanso. ¿Has podido descansar algo últimamente? Incluso pequeños momentos de respiro pueden ayudar.',
      'El agotamiento es real y válido. Cuidar requiere mucha energía física y emocional. ¿Hay alguien que pueda darte un respiro, aunque sea por unas horas?',
      'El cansancio que describes es comprensible. No puedes cuidar bien de otros si no cuidas de ti primero. ¿Qué pequeño paso podrías tomar hoy para descansar aunque sea un poco?',
    ],
  },
  {
    keywords: ['medicación', 'medicina', 'doctor', 'médico', 'hospital', 'cita'],
    responses: [
      'Las decisiones médicas pueden ser abrumadoras. Recuerda que puedes pedir segundas opiniones y hacer todas las preguntas que necesites. ¿Qué es lo que más te preocupa sobre esto?',
      'Es normal sentir incertidumbre con temas médicos. Estás haciendo lo mejor que puedes con la información que tienes. ¿Necesitas ayuda para organizar tus preguntas para el médico?',
      'Las citas médicas pueden ser estresantes. Es importante que te sientas cómoda con las decisiones. ¿Hay algo específico que te gustaría aclarar?',
    ],
  },
  {
    keywords: ['culpa', 'culpable', 'mal', 'debería', 'tendría'],
    responses: [
      'La culpa es una emoción común en los cuidadores, pero es importante reconocer que estás haciendo lo mejor que puedes. No eres perfecta y no tienes que serlo. ¿De dónde viene esta culpa?',
      'Sentir culpa no significa que hayas hecho algo mal. El cuidado es complejo y no hay respuestas perfectas. Estás haciendo un trabajo increíble. ¿Qué te hace sentir así?',
      'La culpa del cuidador es real, pero no es justa contigo misma. Mereces compasión y reconocimiento por todo lo que haces. ¿Qué necesitas para sentirte mejor contigo misma?',
    ],
  },
  {
    keywords: ['sola', 'solo', 'aislada', 'aislamiento', 'nadie entiende'],
    responses: [
      'El aislamiento es uno de los aspectos más difíciles del cuidado. No estás sola, aunque a veces lo parezca. Hay comunidades de apoyo que pueden ayudarte. ¿Te gustaría explorar opciones de conexión con otros cuidadores?',
      'Sentirse sola es comprensible cuando estás en una situación que otros no pueden entender completamente. Pero hay personas que sí entienden. ¿Has considerado unirte a un grupo de apoyo?',
      'El aislamiento puede ser abrumador. Tu experiencia es válida y hay otros que la comparten. ¿Qué tipo de apoyo sería más útil para ti?',
    ],
  },
  {
    keywords: ['ayuda', 'apoyo', 'necesito', 'sobrepa'],
    responses: [
      'Reconocer que necesitas ayuda es un signo de fortaleza, no de debilidad. Pedir apoyo es esencial para el cuidado sostenible. ¿Qué tipo de ayuda sería más útil para ti?',
      'Está bien necesitar ayuda. El cuidado no es un trabajo para una sola persona. ¿Hay recursos o personas que puedan apoyarte?',
      'Necesitar apoyo es humano y necesario. No tienes que hacerlo todo sola. ¿Qué sería lo más útil en este momento?',
    ],
  },
];

export class AIService {
  /**
   * Genera una respuesta empática basada en el contenido y la emoción
   */
  static async generateResponse(
    userMessage: string,
    emotion?: EmotionType
  ): Promise<AIResponse> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    console.log('💬 Generando respuesta IA:', {
      mensaje: userMessage.substring(0, 50),
      emocionRecibida: emotion
    });

    // Buscar respuestas basadas en palabras clave
    const lowerMessage = userMessage.toLowerCase();
    for (const { keywords, responses } of KEYWORD_RESPONSES) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        const response = {
          message: responses[Math.floor(Math.random() * responses.length)],
          emotion: emotion || 'okay',
        };
        console.log('🎯 Respuesta por keyword encontrada:', response.emotion);
        return response;
      }
    }

    // Si hay emoción específica, usar respuestas categorizadas
    if (emotion && EMPATHETIC_RESPONSES[emotion]) {
      const responses = EMPATHETIC_RESPONSES[emotion];
      const response = {
        message: responses[Math.floor(Math.random() * responses.length)],
        emotion,
      };
      console.log('🎭 Respuesta por emoción específica:', response.emotion);
      return response;
    }

    // Respuesta general
    const response = {
      message: GENERAL_RESPONSES[Math.floor(Math.random() * GENERAL_RESPONSES.length)],
      emotion: emotion || 'okay',
    };
    console.log('📝 Respuesta general:', response.emotion);
    return response;
  }

  /**
   * Genera sugerencias basadas en el contexto
   */
  static async generateSuggestions(context: {
    recentEmotions?: EmotionType[];
    recentMessages?: string[];
  }): Promise<string[]> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    const suggestions: string[] = [];

    // Analizar emociones recientes
    if (context.recentEmotions) {
      const challengingCount = context.recentEmotions.filter(
        e => e === 'challenging'
      ).length;

      if (challengingCount >= 3) {
        suggestions.push(
          'Considera buscar apoyo de un grupo de cuidadores',
          'Intenta establecer un momento diario solo para ti',
          'Habla con tu médico sobre recursos de apoyo'
        );
      }
    }

    // Sugerencias generales si no hay específicas
    if (suggestions.length === 0) {
      suggestions.push(
        '¿Cómo te sientes hoy?',
        'Cuéntame sobre un momento positivo reciente',
        '¿Hay algo que te esté preocupando?'
      );
    }

    return suggestions;
  }

  /**
   * Analiza el sentimiento de un mensaje (mockup simple)
   */
  static analyzeSentiment(message: string): EmotionType {
    const lowerMessage = message.toLowerCase();

    // Palabras asociadas con cada emoción
    const emotionKeywords = {
      calm: ['tranquila', 'bien', 'paz', 'relajada', 'contenta', 'feliz', 'mejor', 'genial', 'perfecta'],
      challenging: [
        'difícil',
        'mal',
        'terrible',
        'horrible',
        'agotada',
        'no puedo',
        'frustrada',
        'triste',
        'deprimida',
        'abrumada',
        'cansada',
        'agobiada',
        'estresada',
      ],
      mixed: ['pero', 'aunque', 'sin embargo', 'confundida', 'no sé', 'contradictorios'],
      okay: ['más o menos', 'normal', 'llevándola', 'manejando', 'regular'],
    };

    // Contar coincidencias para cada emoción
    const scores: Record<string, number> = {};
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      scores[emotion] = keywords.filter(keyword =>
        lowerMessage.includes(keyword)
      ).length;
    }

    console.log('🎭 Análisis de sentimiento:', {
      mensaje: message,
      scores,
      palabrasEncontradas: Object.entries(scores).filter(([_, v]) => v > 0)
    });

    // Encontrar la emoción con mayor score
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) {
      console.log('⚠️ No se detectaron palabras clave, usando "okay" por defecto');
      return 'okay'; // Default
    }

    const detectedEmotion = Object.keys(scores).find(
      key => scores[key] === maxScore
    );

    console.log('✅ Emoción detectada:', detectedEmotion);

    return (detectedEmotion as EmotionType) || 'okay';
  }
}
