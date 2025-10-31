Backend - Caballeros del Zodiaco

Servidor backend en Node.js + Express + MongoDB que gestiona la información de los Caballeros Dorados.
Proporciona endpoints para consultar los datos desde el frontend desarrollado con React Native / Expo.

------------------------------------------
TECNOLOGÍAS UTILIZADAS
------------------------------------------
- Node.js
- Express
- MongoDB (base de datos local)
- Mongoose (ODM para MongoDB)
- CORS (para permitir acceso desde el frontend)

------------------------------------------
INSTALACIÓN PASO A PASO
------------------------------------------
1. Clonar o copiar la carpeta backend.
2. Abrir una terminal dentro del backend.
3. Instalar dependencias:
   npm install
4. Asegurarse de que MongoDB esté ejecutándose:
   mongod
5. Crear base de datos y colección:
   use caballeros
   db.createCollection('zodiaco')
6. Insertar datos de ejemplo:
   {
     "nombre": "Mu",
     "constelacion": "Aries",
     "altura": "182 cm",
     "peso": "75 kg",
     "edad": "20 años",
     "tecnica": "Muro de Cristal",
     "entrenamiento": "Jamir",
     "imagen": "https://static.wikia.nocookie.net/doblaje/images/a/a2/Aries_muu23.png/revision/latest?cb=20190807181108&path-prefix=es"
   }

------------------------------------------
EJECUCIÓN DEL SERVIDOR
------------------------------------------
Para iniciar el backend:
   node server.js

Si se tiene nodemon instalado:
   npx nodemon server.js

El servidor quedará disponible en:
   http://localhost:4000

------------------------------------------
ENDPOINTS DISPONIBLES
------------------------------------------
1. Obtener todos los caballeros:
   GET /caballeros

2. Buscar un caballero por nombre:
   GET /caballero/:nombre
   Ejemplo: http://localhost:4000/caballero/Mu

------------------------------------------
ERRORES COMUNES
------------------------------------------
- Caballero no encontrado → Revisar nombre exacto.
- Error al conectar a MongoDB → Asegurar que el servicio esté activo en el puerto 27017.
- Error CORS → Confirmar que app.use(cors()) esté habilitado en el backend.

------------------------------------------
ESTRUCTURA DE CARPETAS
------------------------------------------
backend/
├── server.js
├── package.json
└── README_backend.txt

