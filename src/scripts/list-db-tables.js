require('dotenv').config();
const { sequelize } = require('../config/db');

async function main(){
  try{
    await sequelize.authenticate();
    console.log('Authenticated to DB');

    const [results] = await sequelize.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public';");
    if(Array.isArray(results)){
      console.log('Tables in public schema:');
      results.forEach(r => console.log('-', r.tablename));
    } else {
      console.log('Query result:', results);
    }

    await sequelize.close();
    process.exit(0);
  } catch (err){
    console.error('DB check failed:', err.message || err);
    process.exit(1);
  }
}

main();
