const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generarPreguntas(lessonTitle) {
  const base = Date.now().toString() + Math.floor(Math.random() * 10000);

  const banco = {
    "Instalar WhatsApp": [
      {
        question: "¿Desde dónde es seguro instalar WhatsApp?",
        options: [
          { id: base+"1", text: "Play Store o App Store", isCorrect: true },
          { id: base+"2", text: "Un enlace desconocido", isCorrect: false },
          { id: base+"3", text: "Un mensaje reenviado", isCorrect: false }
        ],
        correctAnswer: base+"1",
        explanation: "Siempre usa tiendas oficiales."
      },
      {
        question: "¿Qué necesitas para instalar WhatsApp?",
        options: [
          { id: base+"4", text: "Conexión a internet", isCorrect: true },
          { id: base+"5", text: "Cable USB", isCorrect: false },
          { id: base+"6", text: "Antivirus especial", isCorrect: false }
        ],
        correctAnswer: base+"4",
        explanation: "Se requiere conexión a internet."
      }
    ],
    "Enviar mensajes": [
      {
        question: "¿Cómo se envía un mensaje?",
        options: [
          { id: base+"7", text: "Escribiendo y presionando enviar", isCorrect: true },
          { id: base+"8", text: "Apagando el celular", isCorrect: false },
          { id: base+"9", text: "Cerrando el chat", isCorrect: false }
        ],
        correctAnswer: base+"7",
        explanation: "Debes escribir y presionar el botón enviar."
      }
    ],
    "Contraseñas seguras": [
      {
        question: "¿Cuál es una contraseña segura?",
        options: [
          { id: base+"10", text: "123456", isCorrect: false },
          { id: base+"11", text: "A9#kLp!72", isCorrect: true },
          { id: base+"12", text: "abcdef", isCorrect: false }
        ],
        correctAnswer: base+"11",
        explanation: "Debe combinar letras, números y símbolos."
      },
      {
        question: "¿Cada cuánto debes cambiar tu contraseña?",
        options: [
          { id: base+"13", text: "Periódicamente", isCorrect: true },
          { id: base+"14", text: "Nunca", isCorrect: false },
          { id: base+"15", text: "Solo si la olvidas", isCorrect: false }
        ],
        correctAnswer: base+"13",
        explanation: "Es recomendable actualizar contraseñas."
      }
    ],
    "Buscar información": [
      {
        question: "¿Qué herramienta usas para buscar información?",
        options: [
          { id: base+"16", text: "Un navegador web", isCorrect: true },
          { id: base+"17", text: "Calculadora", isCorrect: false },
          { id: base+"18", text: "Bloc de notas", isCorrect: false }
        ],
        correctAnswer: base+"16",
        explanation: "Necesitas un navegador como Chrome o Firefox."
      }
    ]
  };

  return banco[lessonTitle] || [
    {
      question: `¿Qué aprendiste en "${lessonTitle}"?`,
      options: [
        { id: base+"19", text: "Concepto principal correcto", isCorrect: true },
        { id: base+"20", text: "Concepto incorrecto 1", isCorrect: false },
        { id: base+"21", text: "Concepto incorrecto 2", isCorrect: false }
      ],
      correctAnswer: base+"19",
      explanation: "La respuesta correcta corresponde al contenido principal."
    }
  ];
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: "changeme",
      role: "admin"
    }
  });

  const cursos = [
    {
      title: "Uso Básico de WhatsApp",
      description: "Aprende a instalar y utilizar WhatsApp.",
      lessons: [
        "Instalar WhatsApp",
        "Crear cuenta",
        "Enviar mensajes",
        "Enviar fotos y videos"
      ]
    },
    {
      title: "Navegación por Internet",
      description: "Aprende a usar internet correctamente.",
      lessons: [
        "Usar un navegador",
        "Buscar información",
        "Abrir pestañas",
        "Seguridad en internet"
      ]
    },
    {
      title: "Seguridad Digital",
      description: "Protege tu información en línea.",
      lessons: [
        "Contraseñas seguras",
        "Evitar fraudes",
        "Correos sospechosos",
        "Protección de dispositivos"
      ]
    },
    {
      title: "Email para Principiantes",
      description: "Aprende a usar tu correo electrónico.",
      lessons: [
        "Crear correo",
        "Enviar y recibir mensajes",
        "Adjuntar archivos",
        "Organizar correos"
      ]
    }
  ];

  for (const curso of cursos) {
    const createdCourse = await prisma.course.create({
      data: {
        title: curso.title,
        description: curso.description,
        lessons: {
          create: curso.lessons.map((title, index) => ({
            title,
            content: `Contenido detallado sobre ${title}`,
            order: index + 1
          }))
        }
      },
      include: { lessons: true }
    });

    for (const lesson of createdCourse.lessons) {
      const preguntas = generarPreguntas(lesson.title);

      for (let i = 0; i < preguntas.length; i++) {
        const p = preguntas[i];

        await prisma.exam.create({
          data: {
            question: p.question,
            options: p.options,
            correctAnswer: p.correctAnswer,
            explanation: p.explanation,
            difficulty: "media",
            order: i + 1,
            courseId: createdCourse.id,
            lessonId: lesson.id,
            createdBy: admin.id
          }
        });
      }
    }
  }

  console.log("Seed completo ejecutado correctamente");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });