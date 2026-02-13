const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Crear admin
  const adminEmail = 'admin@example.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: 'changeme',
        role: 'admin'
      }
    });
    console.log('Created admin user:', adminEmail);
  }

  // Lista de cursos con lecciones
  const cursos = [
    {
      title: "Uso Básico de WhatsApp",
      description: "Aprende a instalar y usar WhatsApp paso a paso.",
      level: "Básico",
      lessons: [
        "Instalar WhatsApp",
        "Crear cuenta",
        "Enviar mensajes",
        "Enviar fotos y videos",
        "Crear grupos y llamadas"
      ]
    },
    {
      title: "Email para principiantes",
      description: "Aprende a crear y usar tu correo electrónico.",
      level: "Básico",
      lessons: [
        "Crear correo",
        "Enviar y recibir mensajes",
        "Adjuntar archivos",
        "Organizar correos",
        "Seguridad y contraseñas"
      ]
    },
    {
      title: "Computadora básica",
      description: "Manejo de computadora y archivos para principiantes.",
      level: "Básico",
      lessons: [
        "Encender y apagar computadora",
        "Escritorio y programas",
        "Guardar y abrir archivos",
        "Copiar y pegar información",
        "Usar memoria USB"
      ]
    },
    {
      title: "Navegación por Internet",
      description: "Aprende a buscar información y usar servicios online.",
      level: "Básico",
      lessons: [
        "Usar un navegador",
        "Buscar información",
        "Abrir y cerrar pestañas",
        "Marcar favoritos",
        "Seguridad en internet"
      ]
    },
    {
      title: "Uso de YouTube",
      description: "Aprende a ver videos y crear tu lista de reproducción.",
      level: "Básico",
      lessons: [
        "Crear cuenta en YouTube",
        "Buscar videos",
        "Suscribirse a canales",
        "Crear lista de reproducción",
        "Comentar y dar 'Me gusta'"
      ]
    },
    {
      title: "Redes Sociales básicas",
      description: "Introducción a Facebook y otras redes sociales.",
      level: "Básico",
      lessons: [
        "Crear cuenta en Facebook",
        "Agregar amigos",
        "Publicar y comentar",
        "Privacidad y seguridad",
        "Usar grupos y eventos"
      ]
    },
    {
      title: "Videollamadas con Zoom",
      description: "Aprender a hacer videollamadas simples.",
      level: "Básico",
      lessons: [
        "Instalar Zoom",
        "Crear cuenta y perfil",
        "Unirse a una reunión",
        "Usar cámara y micrófono",
        "Compartir pantalla"
      ]
    },
    {
      title: "Banca en línea",
      description: "Aprender a manejar tu dinero por internet de forma segura.",
      level: "Básico",
      lessons: [
        "Acceder a banca en línea",
        "Consultar saldo",
        "Transferir dinero",
        "Pagar servicios",
        "Seguridad y contraseñas"
      ]
    },
    {
      title: "Compras por internet",
      description: "Aprende a comprar productos de forma segura en línea.",
      level: "Básico",
      lessons: [
        "Crear cuenta en tiendas online",
        "Buscar productos",
        "Agregar al carrito",
        "Métodos de pago",
        "Seguridad en compras"
      ]
    },
    {
      title: "Seguridad digital",
      description: "Protege tus datos y tu identidad en línea.",
      level: "Básico",
      lessons: [
        "Contraseñas seguras",
        "Evitar fraudes y estafas",
        "Detectar correos sospechosos",
        "Uso seguro de redes sociales",
        "Protección de dispositivos"
      ]
    }
  ];

  // Crear cursos, lecciones y exámenes
  for (const curso of cursos) {
    const createdCourse = await prisma.course.create({
      data: {
        title: curso.title,
        description: curso.description,
        level: curso.level,
        lessons: {
          create: curso.lessons.map((lessonTitle, index) => ({
            title: lessonTitle,
            content: `Contenido paso a paso para "${lessonTitle}"`,
            order: index + 1
          }))
        }
      },
      include: { lessons: true }
    });

    // Crear un examen simple por lección
    for (const lesson of createdCourse.lessons) {
      await prisma.exam.create({
        data: {
          question: `¿Qué aprendiste en la lección "${lesson.title}"?`,
          option_a: "Lo entendí perfectamente",
          option_b: "Me costó un poco",
          option_c: "No entendí nada",
          correct_option: "Lo entendí perfectamente",
          courseId: createdCourse.id,
          lessonId: lesson.id
        }
      });
    }
  }

  console.log('Seed completado correctamente!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
