/**
 * AI Mock Responses
 * 
 * Respuestas pre-escritas del asistente de IA organizadas por emoción.
 * Se utilizan en AIService como mockup hasta integrar una IA real.
 */

import { AIResponse, EmotionType } from '@/types';

/**
 * Respuestas organizadas por tipo de emoción
 */
export const aiResponsesByEmotion: Record<EmotionType, AIResponse[]> = {
  // ========================================================================
  // CALM - Respuestas para estados tranquilos/positivos
  // ========================================================================
  calm: [
    {
      message: '¡Me alegra mucho escuchar eso! Los momentos de calma y bienestar son muy valiosos, especialmente en tu rol como cuidadora. Es importante reconocer y celebrar estos momentos positivos.\n\n¿Qué crees que ha contribuido a que hoy te sientas así?',
      emotion: 'calm',
      suggestions: [
        'Escribe en tu diario sobre este momento positivo',
        'Toma nota de qué factores contribuyeron a sentirte bien',
        'Comparte este momento con alguien cercano'
      ]
    },
    {
      message: 'Qué hermoso que estés experimentando esta sensación de tranquilidad. Estos momentos son tesoros que te dan fuerza para los días más desafiantes.\n\nRecuerda que mereces sentirte bien y que cuidar de ti misma es fundamental.',
      emotion: 'calm',
      suggestions: [
        'Practica gratitud escribiendo 3 cosas por las que estás agradecida',
        'Dedica tiempo a una actividad que disfrutes',
        'Respira profundamente y saborea este momento'
      ]
    },
    {
      message: 'Es maravilloso escucharte así de positiva. Tu capacidad para encontrar paz en medio de las responsabilidades del cuidado es admirable.\n\n¿Hay algo específico que te haya ayudado a alcanzar este estado de calma?',
      emotion: 'calm',
      suggestions: [
        'Identifica qué te ayudó a sentirte tranquila',
        'Intenta repetir esas estrategias cuando lo necesites',
        'Celebra tus logros, por pequeños que sean'
      ]
    }
  ],

  // ========================================================================
  // OKAY - Respuestas para estados estables/neutros
  // ========================================================================
  okay: [
    {
      message: 'Entiendo que te encuentres en un punto estable. No todos los días tienen que ser extraordinarios o especialmente difíciles. La estabilidad también tiene su valor.\n\n¿Hay algo en particular en tu mente hoy?',
      emotion: 'okay',
      suggestions: [
        'Mantén tu rutina de autocuidado',
        'Aprovecha este momento para planificar la semana',
        'Haz algo pequeño que te haga sentir bien'
      ]
    },
    {
      message: 'Está bien sentirse "normal" o en un punto medio. No siempre necesitamos estar en un extremo u otro. Este equilibrio puede ser justo lo que necesitas hoy.\n\n¿Cómo va tu día a día como cuidadora?',
      emotion: 'okay',
      suggestions: [
        'Revisa tu calendario emocional para ver patrones',
        'Asegúrate de mantener tus hábitos saludables',
        'Considera conectar con tu red de apoyo'
      ]
    },
    {
      message: 'Me parece que estás transitando el día con serenidad. Eso es valioso. A veces, la estabilidad es exactamente lo que necesitamos.\n\n¿Hay algo que te gustaría mejorar o cambiar?',
      emotion: 'okay',
      suggestions: [
        'Reflexiona sobre qué necesitas para sentirte mejor',
        'Identifica una pequeña meta para hoy',
        'Mantén tus rutinas de bienestar'
      ]
    }
  ],

  // ========================================================================
  // CHALLENGING - Respuestas para estados difíciles
  // ========================================================================
  challenging: [
    {
      message: 'Lamento que estés pasando por un momento difícil. Tu honestidad al compartir cómo te sientes es muy importante. Recuerda que estos sentimientos son completamente válidos y comprensibles.\n\nNo estás sola en esto. ¿Qué es lo que más te está pesando en este momento?',
      emotion: 'challenging',
      suggestions: [
        'Respira profundamente durante 5 minutos',
        'Tómate un descanso aunque sea breve',
        'Contacta a alguien de confianza para hablar',
        'Recuerda que pedir ayuda es fortaleza, no debilidad'
      ]
    },
    {
      message: 'Entiendo que te sientas abrumada. El cuidado de una persona con enfermedad mental es emocional y físicamente demandante. Tu cansancio es completamente legítimo.\n\nEs crucial que te permitas sentir sin culpa. ¿Has podido descansar algo hoy?',
      emotion: 'challenging',
      suggestions: [
        'Prioriza tu descanso - es esencial',
        'Considera delegar algunas tareas si es posible',
        'Practica técnicas de relajación (respiración, meditación)',
        'Escribe tus sentimientos en tu diario'
      ]
    },
    {
      message: 'Reconozco lo difícil que debe ser esto para ti. Cuidar de alguien que amas mientras gestionas tus propias emociones requiere una fuerza inmensa, y es normal sentirse agotada.\n\nTu bienestar importa tanto como el de la persona que cuidas. ¿Qué necesitas en este momento?',
      emotion: 'challenging',
      suggestions: [
        'Identifica qué necesitas ahora mismo (descanso, ayuda, espacio)',
        'Busca apoyo en grupo de cuidadores',
        'No dudes en pedir ayuda profesional si la necesitas',
        'Sé compasiva contigo misma'
      ]
    },
    {
      message: 'Tu situación es realmente desafiante, y quiero que sepas que tus sentimientos son completamente válidos. No tienes que ser fuerte todo el tiempo.\n\nEs importante que encuentres espacios para ti. ¿Tienes a alguien con quien puedas hablar o que pueda apoyarte?',
      emotion: 'challenging',
      suggestions: [
        'Busca tiempo para ti, aunque sea 15 minutos',
        'Practica el autocuidado sin culpa',
        'Considera hablar con un profesional',
        'Recuerda que no puedes cuidar bien de otros si no te cuidas a ti'
      ]
    }
  ],

  // ========================================================================
  // MIXED - Respuestas para estados mixtos/complejos
  // ========================================================================
  mixed: [
    {
      message: 'Parece que estás experimentando sentimientos encontrados, y eso es completamente natural. Muchas veces como cuidadores vivimos en esta montaña rusa emocional donde coexisten diferentes emociones.\n\nNo tienes que forzarte a sentir solo una cosa. ¿Quieres compartir más sobre lo que estás sintiendo?',
      emotion: 'mixed',
      suggestions: [
        'Escribe sobre tus emociones contradictorias',
        'Acepta que puedes sentir varias cosas a la vez',
        'Identifica qué te genera cada emoción',
        'Practica la autocompasión'
      ]
    },
    {
      message: 'Entiendo que tus emociones sean complejas en este momento. El rol de cuidador a menudo nos pone en situaciones donde sentimos alegría y tristeza, gratitud y agotamiento, amor y frustración, todo al mismo tiempo.\n\nEstas emociones mixtas son parte de tu experiencia humana. ¿Hay algo específico que quieras explorar?',
      emotion: 'mixed',
      suggestions: [
        'Explora cada emoción por separado en tu diario',
        'No juzgues tus sentimientos - solo obsérvalos',
        'Busca momentos de claridad cuando puedas',
        'Recuerda que sentir emociones complejas no está mal'
      ]
    },
    {
      message: 'Las emociones no siempre son blanco o negro, y está bien sentir una mezcla de cosas. Tu capacidad para reconocer esta complejidad muestra tu autoconocimiento.\n\n¿Qué emoción predomina más en este momento, o todas tienen la misma intensidad?',
      emotion: 'mixed',
      suggestions: [
        'Identifica la emoción predominante si hay una',
        'Date permiso para sentir sin necesidad de "resolverlo"',
        'Habla con alguien sobre cómo te sientes',
        'Mantén tu rutina de autocuidado'
      ]
    }
  ]
};

/**
 * Respuestas generales para cuando no se detecta una emoción específica
 */
export const generalResponses: AIResponse[] = [
  {
    message: 'Gracias por compartir conmigo. Estoy aquí para escucharte y apoyarte. Como cuidadora, tu bienestar emocional es fundamental.\n\n¿Hay algo en particular que te gustaría hablar o explorar hoy?',
    suggestions: [
      'Escribe en tu diario sobre cómo te sientes',
      'Revisa tu calendario emocional para identificar patrones',
      'Practica técnicas de respiración o relajación',
      'Busca un momento para ti misma'
    ]
  },
  {
    message: 'Te escucho. Tu experiencia como cuidadora es única y valiosa. No hay respuestas correctas o incorrectas sobre cómo deberías sentirte.\n\n¿Cómo ha sido tu semana? ¿Hay algo que quieras compartir?',
    suggestions: [
      'Reflexiona sobre los momentos positivos de la semana',
      'Identifica qué desafíos enfrentaste',
      'Piensa en qué necesitas para la próxima semana',
      'Celebra tus pequeños logros'
    ]
  },
  {
    message: 'Me alegra que estés aquí. Cuidar de alguien con una enfermedad mental es una labor de amor que también puede ser muy desafiante. Tu dedicación es admirable.\n\n¿Cómo puedo ayudarte hoy?',
    suggestions: [
      'Identifica qué necesitas en este momento',
      'Considera qué te haría sentir mejor',
      'Piensa en tu red de apoyo y cómo pueden ayudarte',
      'Recuerda que pedir ayuda es acto de valentía'
    ]
  },
  {
    message: 'Estoy aquí contigo. El camino del cuidador tiene altibajos, y cada día es diferente. Lo importante es que te permitas sentir y que cuides de ti misma también.\n\n¿Qué es lo más importante para ti hoy?',
    suggestions: [
      'Define una prioridad para hoy',
      'Asegúrate de incluir algo de autocuidado',
      'Mantén expectativas realistas',
      'Recuerda que no tienes que hacerlo todo perfectamente'
    ]
  }
];
