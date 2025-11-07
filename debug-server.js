import express from 'express';
import { Sequelize } from 'sequelize';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const sequelize = new Sequelize('hunterdb', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log
});

// Endpoint de diagnóstico
app.get('/debug/mysql', async (req, res) => {
  try {
    // Probar conexión
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    // Obtener lista de tablas
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('Tablas:', tables);

    // Obtener estructura de characters_rel
    const [structure] = await sequelize.query('DESCRIBE characters_rel');
    console.log('Estructura de la tabla:', structure);

    // Obtener registros
    const [records] = await sequelize.query('SELECT * FROM characters_rel');
    console.log('Registros:', records);

    res.json({
      status: 'success',
      tables,
      structure,
      records
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: error.stack
    });
  }
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Servidor de diagnóstico corriendo en puerto ${PORT}`);
});