import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { DataTypes, Sequelize } from 'sequelize';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint simple de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Endpoint para mostrar el estado de las bases de datos
app.get('/debug', async (req, res) => {
  try {
    // Estado de MongoDB
    const mongoState = {
      connectionState: mongoose.connection.readyState,
      isConnected: mongoose.connection.readyState === 1
    };

    // Estado de MySQL
    let mysqlState = { isConnected: false };
    try {
      await sequelize.authenticate();
      mysqlState.isConnected = true;
    } catch (e) {
      mysqlState.error = e.message;
    }

    res.json({
      mongodb: mongoState,
      mysql: mysqlState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de diagnóstico
app.get('/debug/databases', async (req, res) => {
  try {
    console.log('🔍 Iniciando diagnóstico de bases de datos...');
    
    // MongoDB
    const mongoRecords = await HunterMongo.find();
    const mongoStatus = {
      connection: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
      connectionState: mongoose.connection.readyState,
      recordCount: mongoRecords.length,
      records: mongoRecords
    };
    console.log('📊 MongoDB status:', {
      connection: mongoStatus.connection,
      recordCount: mongoStatus.recordCount,
      recordIds: mongoRecords.map(r => ({ _id: r._id, nombre: r.nombre }))
    });

    // MySQL
    const mysqlRecords = await HunterSQL.findAll();
    const mysqlStatus = {
      connection: await sequelize.authenticate().then(() => 'conectado').catch(() => 'desconectado'),
      recordCount: mysqlRecords.length,
      records: mysqlRecords.map(r => r.toJSON())
    };
    console.log('📊 MySQL status:', {
      connection: mysqlStatus.connection,
      recordCount: mysqlStatus.recordCount,
      recordIds: mysqlRecords.map(r => ({ id: r.id, nombre: r.nombre }))
    });

    res.json({
      mongodb: mongoStatus,
      mysql: mysqlStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Endpoint de prueba de eliminación
app.get('/debug/delete-test/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('🧪 Iniciando prueba de eliminación para ID:', id);
    
    // Verificar si es un ID de MongoDB
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log('📍 ID válido para MongoDB');
      const hunter = await HunterMongo.findById(id);
      console.log('🔍 Resultado búsqueda MongoDB:', hunter);
      
      if (!hunter) {
        return res.status(404).json({
          error: 'No encontrado en MongoDB',
          id: id
        });
      }
      
      return res.json({
        message: 'Cazador encontrado en MongoDB',
        hunter: hunter,
        deleteUrl: `/hunter/${id}`
      });
    }
    
    // Probar como ID de MySQL
    const numericId = parseInt(id);
    if (!isNaN(numericId)) {
      console.log('📍 ID válido para MySQL');
      const hunter = await HunterSQL.findByPk(numericId);
      console.log('🔍 Resultado búsqueda MySQL:', hunter ? hunter.toJSON() : null);
      
      if (!hunter) {
        return res.status(404).json({
          error: 'No encontrado en MySQL',
          id: numericId
        });
      }
      
      return res.json({
        message: 'Cazador encontrado en MySQL',
        hunter: hunter.toJSON(),
        deleteUrl: `/hunter/${numericId}`
      });
    }
    
    return res.status(400).json({
      error: 'ID no válido para ninguna base de datos',
      id: id
    });
  } catch (error) {
    console.error('❌ Error en prueba de eliminación:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// =========================
// 🔹 Configuración Swagger
// =========================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hunter x Hunter API",
      version: "1.0.0",
      description: "API de microservicios de Hunter x Hunter con base de datos SQL y MongoDB",
    },
    servers: [
      {
        url: "https://hunter-backend.onrender.com",
      },
    ],
  },
  apis: ["./server.js"],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// =========================
// 🔹 Conexión a MongoDB
// =========================
// MongoDB Configuration
const mongoURI = 'mongodb+srv://camilaarevalo1106:Ca950624@cluster0.sxclux4.mongodb.net/hunterdb?appName=Cluster0';

const hunterMongoSchema = new mongoose.Schema({
  nombre: String,
  edad: String,
  altura: String,
  peso: String,
  imagen: String
});

const HunterMongo = mongoose.model('Hunter', hunterMongoSchema, 'personajes');

// SQL Configuration
const sequelize = new Sequelize(
  "bwyv890eodahdqfddm0m", // Database
  "uemsvhk1wsxt9jo8",     // User
  "VA7R7z7fpBcSWwyHDuTY", // Password
  {
    host: "bwyv890eodahdqfddm0m-mysql.services.clever-cloud.com",
    port: 3306,
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;

// Test de conexión MySQL
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL conectado exitosamente');
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err);
  });

const HunterSQL = sequelize.define('Hunter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  edad: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  altura: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  peso: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING(1000),
    allowNull: false
  }
}, {
  tableName: 'characters_rel',
  timestamps: false,
  freezeTableName: true,
  hooks: {
    beforeDestroy: (instance, options) => {
      console.log('🔄 Antes de eliminar en MySQL:', {
        id: instance.id,
        nombre: instance.nombre
      });
    },
    afterDestroy: (instance, options) => {
      console.log('✅ Después de eliminar en MySQL:', {
        id: instance.id,
        nombre: instance.nombre
      });
    }
  }
});

// Configuración de mongoose para mejor debugging
mongoose.set('debug', true);

// Manejar eventos de conexión de MongoDB
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB conectado exitosamente');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('❗ MongoDB desconectado');
});

// Connect to both databases
async function connectDatabases() {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('🔄 Intentando conectar a MySQL...');
    await sequelize.sync({ alter: true });
    
    console.log('✅ Conectado correctamente a MongoDB y SQL');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Colecciones MongoDB:', collections.map(c => c.name));
  } catch (err) {
    console.error('❌ Error al conectar a las bases de datos:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

// Iniciar conexiones
connectDatabases();

// =========================
// 🔹 Rutas
// =========================

// Endpoint para verificar un cazador específico
app.get('/debug/hunter/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('🔍 Verificando cazador con ID:', id);

    let result = {
      id: id,
      mongoCheck: null,
      mysqlCheck: null
    };

    // Verificar en MongoDB
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log('Buscando en MongoDB...');
      const mongoHunter = await HunterMongo.findById(id);
      result.mongoCheck = {
        isValid: true,
        found: !!mongoHunter,
        data: mongoHunter
      };
    } else {
      result.mongoCheck = {
        isValid: false,
        reason: 'ID no válido para MongoDB'
      };
    }

    // Verificar en MySQL
    const numericId = parseInt(id);
    if (!isNaN(numericId)) {
      console.log('Buscando en MySQL...');
      const sqlHunter = await HunterSQL.findByPk(numericId);
      result.mysqlCheck = {
        isValid: true,
        found: !!sqlHunter,
        data: sqlHunter ? sqlHunter.toJSON() : null
      };
    } else {
      result.mysqlCheck = {
        isValid: false,
        reason: 'ID no válido para MySQL'
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Error al verificar cazador:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Estado del servidor
 *     responses:
 *       200:
 *         description: Servidor activo
 */
app.get('/', (req, res) => {
  res.send('🚀 Servidor Hunter x Hunter activo y conectado a MongoDB Atlas');
});


/**
 * @swagger
 * /hunters:
 *   get:
 *     summary: Lista todos los personajes de Hunter x Hunter
 *     responses:
 *       200:
 *         description: Lista de personajes de ambas bases de datos
 */
app.get('/hunters', async (req, res) => {
  try {
    const [mongoHunters, sqlHunters] = await Promise.all([
      HunterMongo.find(),
      HunterSQL.findAll()
    ]);
    res.json([...mongoHunters, ...sqlHunters]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos combinados: ' + error.message });
  }
});


/**
 * @swagger
 * /hunter/{id}:
 *   get:
 *     summary: Busca un personaje por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del personaje a buscar
 *     responses:
 *       200:
 *         description: Personaje encontrado
 */
app.get('/hunter/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let hunter;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      hunter = await HunterMongo.findById(id);
    } else {
      hunter = await HunterSQL.findByPk(id);
    }

    if (!hunter) {
      return res.status(404).json({ mensaje: 'Personaje no encontrado' });
    }

    res.json(hunter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * @swagger
 * /hunter:
 *   post:
 *     summary: Crear nuevo personaje
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               edad:
 *                 type: string
 *               altura:
 *                 type: string
 *               peso:
 *                 type: string
 *               tipo:
 *                 type: string
 *               habilidad:
 *                 type: string
 *               imagen:
 *                 type: string
 *               database:
 *                 type: string
 *                 enum: [mongo, sql]
 *     responses:
 *       201:
 *         description: Personaje creado con éxito
 */
app.post('/hunter', async (req, res) => {
  try {
    const { database, ...hunterData } = req.body;
    
    // Validar campos requeridos
    const requiredFields = ['nombre', 'edad', 'altura', 'peso', 'imagen'];
    const missingFields = requiredFields.filter(field => !hunterData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Faltan campos requeridos: ${missingFields.join(', ')}` 
      });
    }

    if (!database || !['mongo', 'sql'].includes(database)) {
      return res.status(400).json({ 
        error: 'Debe especificar una base de datos válida (mongo o sql)' 
      });
    }

    let hunter;
    try {
      if (database === 'mongo') {
        hunter = await HunterMongo.create(hunterData);
      } else {
        hunter = await HunterSQL.create(hunterData);
      }
    } catch (dbError) {
      console.error('Error al crear el personaje:', dbError);
      throw new Error('Error al crear el personaje en la base de datos');
    }

    res.status(201).json({
      mensaje: 'Personaje creado exitosamente',
      data: hunter
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /hunter/{id}:
 *   put:
 *     summary: Actualizar personaje existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del personaje a actualizar
 *     responses:
 *       200:
 *         description: Personaje actualizado con éxito
 */
app.put('/hunter/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    // Validar que al menos hay un campo para actualizar
    const allowedFields = ['nombre', 'edad', 'altura', 'peso', 'imagen'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'Debe proporcionar al menos un campo válido para actualizar' 
      });
    }

    let updated;
    if (mongoose.Types.ObjectId.isValid(id)) {
      // MongoDB
      const result = await HunterMongo.findByIdAndUpdate(id, updates, { new: true });
      if (!result) {
        return res.status(404).json({ error: 'Personaje no encontrado en MongoDB' });
      }
      updated = result;
    } else {
      // SQL
      const [updatedRows] = await HunterSQL.update(updates, { 
        where: { id },
        returning: true
      });
      
      if (updatedRows === 0) {
        return res.status(404).json({ error: 'Personaje no encontrado en SQL' });
      }
      
      updated = await HunterSQL.findByPk(id);
    }

    res.json({
      mensaje: 'Personaje actualizado exitosamente',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /hunter/byname/{nombre}:
 *   delete:
 *     summary: Eliminar personaje por nombre
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del personaje a eliminar
 *     responses:
 *       200:
 *         description: Personaje eliminado con éxito
 */
app.delete('/hunter/byname/:nombre', async (req, res) => {
  try {
    const nombre = req.params.nombre;
    console.log('🔍 Buscando cazador por nombre:', nombre);

    // Buscar en ambas bases de datos
    const [mongoResult, mysqlResult] = await Promise.all([
      HunterMongo.findOne({ nombre: { $regex: new RegExp('^' + nombre + '$', 'i') } }),
      HunterSQL.findOne({ where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nombre')),
        sequelize.fn('LOWER', nombre)
      )})
    ]);

    console.log('Resultados de búsqueda:', {
      mongodb: mongoResult,
      mysql: mysqlResult ? mysqlResult.toJSON() : null
    });

    // Si se encuentra en MongoDB
    if (mongoResult) {
      console.log('📍 Encontrado en MongoDB, procediendo a eliminar...');
      await HunterMongo.findByIdAndDelete(mongoResult._id);
      return res.status(200).json({
        mensaje: 'Personaje eliminado exitosamente de MongoDB',
        database: 'mongodb',
        deletedHunter: mongoResult
      });
    }

    // Si se encuentra en MySQL
    if (mysqlResult) {
      console.log('📍 Encontrado en MySQL, procediendo a eliminar...');
      const transaction = await sequelize.transaction();
      try {
        await HunterSQL.destroy({
          where: { id: mysqlResult.id },
          transaction
        });
        await transaction.commit();
        return res.status(200).json({
          mensaje: 'Personaje eliminado exitosamente de MySQL',
          database: 'mysql',
          deletedHunter: mysqlResult.toJSON()
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    // Si no se encuentra en ninguna base de datos
    return res.status(404).json({
      error: 'Personaje no encontrado en ninguna base de datos',
      nombre: nombre
    });

  } catch (error) {
    console.error('❌ Error al eliminar:', error);
    res.status(500).json({
      error: 'Error al eliminar el personaje',
      message: error.message,
      nombre: req.params.nombre
    });
  }
});

/**
 * @swagger
 * /hunter/{id}:
 *   delete:
 *     summary: Eliminar personaje por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del personaje a eliminar
 *     responses:
 *       200:
 *         description: Personaje eliminado con éxito
 */
app.delete('/hunter/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('🗑️ Intento de eliminación con ID:', id);
    
    // Para MongoDB
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log('📍 Intentando eliminar de MongoDB');
      
      const deletedHunter = await HunterMongo.findById(id);
      console.log('🔍 Búsqueda en MongoDB:', {
        id: id,
        encontrado: !!deletedHunter,
        datos: deletedHunter
      });
      
      if (!deletedHunter) {
        console.log('❌ Cazador no encontrado en MongoDB');
        return res.status(404).json({ 
          error: 'Personaje no encontrado en MongoDB',
          id: id,
          database: 'mongodb'
        });
      }
      
      const result = await HunterMongo.findByIdAndDelete(id);
      console.log('✅ Eliminación MongoDB exitosa:', result);
      
      return res.status(200).json({
        mensaje: 'Personaje eliminado exitosamente de MongoDB',
        id: id,
        database: 'mongodb',
        deletedHunter: result
      });
    } 
    // Para MySQL
    else {
      console.log('📍 Intentando eliminar de MySQL');
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        console.log('❌ ID inválido para MySQL:', id);
        return res.status(400).json({ 
          error: 'ID inválido para MySQL',
          id: id,
          database: 'mysql'
        });
      }

      // Verificar si existe el registro antes de la transacción
      const existingHunter = await HunterSQL.findByPk(numericId);
      console.log('🔍 Búsqueda en MySQL:', {
        id: numericId,
        encontrado: !!existingHunter,
        datos: existingHunter ? existingHunter.toJSON() : null
      });

      if (!existingHunter) {
        console.log('❌ Cazador no encontrado en MySQL');
        return res.status(404).json({ 
          error: 'Personaje no encontrado en MySQL',
          id: numericId,
          database: 'mysql'
        });
      }

      // Iniciar transacción
      console.log('🔄 Iniciando transacción MySQL');
      const transaction = await sequelize.transaction();
      
      try {
        // Guardar datos antes de eliminar
        const hunterData = existingHunter.toJSON();
        
        // Eliminar usando transacción
        const deleteResult = await HunterSQL.destroy({ 
          where: { id: numericId },
          transaction 
        });
        
        console.log('📊 Resultado eliminación MySQL:', {
          registrosEliminados: deleteResult,
          id: numericId
        });

        // Confirmar transacción
        await transaction.commit();
        console.log('✅ Transacción MySQL confirmada');

        // Verificar eliminación
        const verifyDeleted = await HunterSQL.findByPk(numericId);
        if (verifyDeleted) {
          console.log('⚠️ Advertencia: El registro aún existe después de eliminar');
          throw new Error('No se pudo eliminar el personaje');
        }

        console.log('✅ Verificación exitosa: Registro eliminado correctamente');
        return res.status(200).json({
          mensaje: 'Personaje eliminado exitosamente de MySQL',
          id: numericId,
          database: 'mysql',
          deletedHunter: hunterData
        });
      } catch (sqlError) {
        console.error('❌ Error en transacción MySQL:', sqlError);
        await transaction.rollback();
        console.log('↩️ Transacción revertida');
        throw sqlError;
      }
    }
  } catch (error) {
    console.error('❌ Error al eliminar:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al eliminar el personaje',
      message: error.message,
      id: req.params.id
    });
  }
});

// =========================
// 🔹 Iniciar servidor
// =========================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));