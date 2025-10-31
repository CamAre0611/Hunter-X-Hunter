import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(express.json());
app.use(cors());

// =========================
// 🔹 Configuración Swagger
// =========================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Caballeros del Zodiaco API",
      version: "1.0.0",
      description: "API de microservicios de Caballeros del Zodiaco desplegada en Render",
    },
    servers: [
      {
        url: "https://caballeros-backend-yn8r.onrender.com", // tu URL de Render
      },
    ],
  },
  apis: ["./server.js"], // documentaremos las rutas aquí
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// =========================
// 🔹 Conexión a MongoDB
// =========================
const mongoURI = 'mongodb+srv://CamilaAre0611:Ca950624@cluster0.kb5dcbj.mongodb.net/zodiaco';

const caballeroSchema = new mongoose.Schema({
  nombre: String,
  constelacion: String,
  altura: String,
  peso: String,
  edad: String,
  tecnica: String,
  entrenamiento: String,
  imagen: String,
});

const Caballero = mongoose.model('Caballero', caballeroSchema, 'caballeros');

mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log('✅ Conectado correctamente a MongoDB en la base zodiaco');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Colecciones disponibles:', collections.map(c => c.name));
  })
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err.message));

// =========================
// 🔹 Rutas
// =========================

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
  res.send('🚀 Servidor Caballeros del Zodiaco activo y conectado a MongoDB Atlas');
});

/**
 * @swagger
 * /caballeros:
 *   get:
 *     summary: Lista todos los caballeros
 *     responses:
 *       200:
 *         description: Lista de caballeros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre: { type: string }
 *                   constelacion: { type: string }
 *                   altura: { type: string }
 *                   peso: { type: string }
 *                   edad: { type: string }
 *                   tecnica: { type: string }
 *                   entrenamiento: { type: string }
 *                   imagen: { type: string }
 */
app.get('/caballeros', async (req, res) => {
  try {
    const caballeros = await Caballero.find();
    res.json(caballeros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /caballero/{nombre}:
 *   get:
 *     summary: Busca un caballero por nombre
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del caballero a buscar
 *     responses:
 *       200:
 *         description: Caballero encontrado
 *       404:
 *         description: Caballero no encontrado
 */
app.get('/caballero/:nombre', async (req, res) => {
  try {
    const nombre = req.params.nombre.trim();
    console.log('🔍 Buscando:', nombre);

    const caballero = await Caballero.findOne({
      nombre: { $regex: `^${nombre}$`, $options: 'i' }
    });

    if (!caballero) {
      console.log('⚠️ No encontrado:', nombre);
      return res.status(404).json({ mensaje: 'Caballero no encontrado' });
    }

    console.log('✅ Encontrado:', caballero.nombre);
    res.json(caballero);
  } catch (error) {
    console.error('❌ Error al buscar caballero:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// =========================
// 🔹 Iniciar servidor
// =========================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
