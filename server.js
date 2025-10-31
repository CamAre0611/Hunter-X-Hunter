import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Conexión con tu base de datos real
const mongoURI = 'mongodb+srv://CamilaAre0611:Ca950624@cluster0.kb5dcbj.mongodb.net/zodiaco';

// ✅ Definimos un esquema simple para caballeros
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

// ✅ Creamos el modelo
const Caballero = mongoose.model('Caballero', caballeroSchema, 'caballeros');

mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log('✅ Conectado correctamente a MongoDB en la base zodiaco');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Colecciones disponibles:', collections.map(c => c.name));
  })
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err.message));

// 🔍 Buscar un caballero por nombre
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

// 📋 Listar todos los caballeros
app.get('/caballeros', async (req, res) => {
  try {
    const caballeros = await Caballero.find();
    res.json(caballeros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🚀 Iniciar servidor
const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
