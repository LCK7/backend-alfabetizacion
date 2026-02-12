require("dotenv").config();
const app = require("./app");
const prisma = require("./prisma");

const PORT = process.env.PORT || 5000;

async function start(){
  try{
    await prisma.$connect();
    console.log('Connected to database via Prisma');

    app.listen(PORT, () => {
      console.log("Servidor corriendo en puerto", PORT);
    });
  } catch(err){
    console.error('Failed to connect to DB:', err.message || err);
    process.exit(1);
  }
}

start();
