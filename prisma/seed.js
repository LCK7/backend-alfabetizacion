const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  console.log('Seeding database...');

  // create an admin user if none exists
  const adminEmail = 'admin@example.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if(!existing){
    await prisma.user.create({ data: { name: 'Admin', email: adminEmail, password: 'changeme', role: 'admin' } });
    console.log('Created admin user:', adminEmail);
  }

  // create a sample course
  const course = await prisma.course.create({ data: { title: 'Introducción a WhatsApp', description: 'Curso básico sobre uso de WhatsApp', level: 'Básico' } });
  await prisma.lesson.createMany({ data: [
    { courseId: course.id, title: 'Instalar WhatsApp', content: 'Paso a paso para instalar', order: 1 },
    { courseId: course.id, title: 'Crear cuenta', content: 'Crear cuenta con número', order: 2 }
  ]});

  console.log('Seed completed');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
