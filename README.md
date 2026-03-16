# 📋 Habits Tracker – Backend

API REST para la gestión de hábitos personales, construida con **Node.js**, **Express** y **MongoDB**. Permite crear, consultar y eliminar hábitos de forma sencilla a través de endpoints HTTP.

---

## 📌 Descripción general

**Habits Tracker – Backend** es una API RESTful que sirve como capa de servidor para una aplicación de seguimiento de hábitos. Expone endpoints para listar y registrar hábitos, almacenando la información de forma persistente en una base de datos MongoDB.

El proyecto fue generado con `express-generator` y sigue su estructura de carpetas estándar, ampliada con una capa de configuración para la base de datos y un modelo de datos con Mongoose.

---

## ✅ Requisitos previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu máquina:

- **Node.js** v18 LTS o v20 LTS — [Descargar](https://nodejs.org)
- **npm** (incluido con Node.js)
- **MongoDB** — puedes usar cualquiera de estas opciones:
  - [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud, gratuito en el tier M0)
  - MongoDB local instalado en tu máquina — [Guía de instalación](https://www.mongodb.com/docs/manual/installation/)

---

## 📥 Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/habits-tracker-backend.git
cd habits-tracker-backend
```

---

## 📦 Instalación de dependencias

Una vez dentro de la carpeta del proyecto, instala todas las dependencias con:

```bash
npm install
```

Esto leerá el archivo `package.json` e instalará Express, Mongoose y el resto de paquetes necesarios en la carpeta `node_modules/`.

---

## ⚙️ Configuración de variables de entorno

El proyecto utiliza un archivo `.env` en la raíz para gestionar la configuración sensible. Este archivo **no se sube al repositorio** (está en `.gitignore`), por lo que debes crearlo manualmente.

### 1. Crear el archivo `.env`

```bash
touch .env
```

### 2. Agregar las variables necesarias

```env
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@cluster0.xxxxx.mongodb.net/habitsApp
PORT=3000
```

| Variable    | Descripción                                                        | Valor por defecto            |
|-------------|--------------------------------------------------------------------|------------------------------|
| `MONGO_URI` | Cadena de conexión a MongoDB (Atlas o local)                       | —                            |
| `PORT`      | Puerto en el que escucha el servidor                               | `3000`                       |

### 3. Cómo obtener el connection string de MongoDB Atlas

1. Inicia sesión en [MongoDB Atlas](https://cloud.mongodb.com)
2. Ve a tu proyecto y haz clic en **Database**
3. Haz clic en el botón **Connect** del clúster que deseas usar
4. Selecciona **Connect your application**
5. Elige el driver **Node.js** y la versión correspondiente
6. Copia la cadena de conexión y reemplaza `<password>` por tu contraseña real

La cadena tendrá un formato similar a este:

```
mongodb+srv://miUsuario:miPassword@cluster0.abc12.mongodb.net/habitsApp
```

### 4. Conexión local (alternativa)

Si prefieres usar MongoDB instalado localmente, el valor de `MONGO_URI` sería:

```env
MONGO_URI=mongodb://localhost:27017/habitsApp
```

> ⚠️ **Importante:** No añadas parámetros como `useNewUrlParser` o `useUnifiedTopology` en la cadena de conexión. Estos parámetros están obsoletos en versiones recientes del driver de MongoDB y causarán errores. Consulta la sección de [errores comunes](#-errores-comunes) para más detalles.

---

## 🗂️ Estructura del proyecto

```
habits-tracker-backend/
│
├── bin/
│   └── www                  # Punto de entrada: crea y arranca el servidor HTTP
│
├── config/
│   └── database.js          # Configuración y conexión a MongoDB con Mongoose
│
├── models/
│   └── habit.js             # Modelo Mongoose del hábito (title, description, createdAt)
│
├── public/                  # Archivos estáticos (generado por express-generator)
│
├── routes/
│   ├── index.js             # Rutas principales: GET / y rutas de /habits
│   └── users.js             # Archivo de ejemplo generado por express-generator
│
├── views/                   # Vistas Jade/Pug (generado por express-generator)
│
├── app.js                   # Configuración principal de Express (middlewares, rutas)
├── .env                     # Variables de entorno (NO subir al repo)
├── .gitignore
└── package.json
```

### Descripción de los archivos clave

**`app.js`** — configura Express: registra middlewares (body-parser, morgan, etc.) y monta las rutas.

**`bin/www`** — importa `app.js`, crea el servidor HTTP con `http.createServer()` y lo pone a escuchar en el puerto definido por `PORT`.

**`config/database.js`** — contiene la lógica de conexión a MongoDB usando `mongoose.connect()` con la URI proveniente de las variables de entorno.

**`models/habit.js`** — define el esquema Mongoose para un hábito:

```js
const habitSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  createdAt:   { type: Date,   default: Date.now }
});
```

**`routes/index.js`** — registra los endpoints `GET /` y los relacionados con `/habits`.

---

## 🚀 Ejecutar el proyecto

### Modo producción

```bash
npm start
```

Este comando ejecuta `node ./bin/www`. El servidor quedará disponible en:

```
http://localhost:3000
```

Si la conexión a MongoDB fue exitosa, verás en la consola un mensaje como:

```
Database connect
```

### Modo desarrollo con nodemon (opcional)

`nodemon` reinicia el servidor automáticamente cuando detecta cambios en los archivos fuente.

**Instalar nodemon:**

```bash
npm install --save-dev nodemon
```

**Agregar el script `dev` en `package.json`:**

```json
"scripts": {
  "start": "node ./bin/www",
  "dev":   "nodemon ./bin/www"
}
```

**Ejecutar en modo desarrollo:**

```bash
npm run dev
```

---

## 📡 Endpoints de la API

**Base URL:** `http://localhost:3000`

---

### `GET /`

Devuelve la página de bienvenida generada por Express (vista Jade/Pug).

| Campo       | Valor                  |
|-------------|------------------------|
| Método      | `GET`                  |
| URL         | `/`                    |
| Respuesta   | HTML de bienvenida     |

---

### `GET /habits`

Devuelve la lista de todos los hábitos registrados en la base de datos.

| Campo     | Valor            |
|-----------|------------------|
| Método    | `GET`            |
| URL       | `/habits`        |
| Respuesta | Array JSON       |

**Ejemplo de respuesta exitosa (`200 OK`):**

```json
[
  {
    "_id": "664f1c2b3a8e4d001c8b4567",
    "title": "Leer 30 minutos",
    "description": "Leer cada noche antes de dormir",
    "createdAt": "2024-05-23T10:30:00.000Z"
  },
  {
    "_id": "664f1c2b3a8e4d001c8b4568",
    "title": "Ejercicio matutino",
    "description": "Salir a correr 20 minutos cada mañana",
    "createdAt": "2024-05-23T11:00:00.000Z"
  }
]
```

---

### `POST /habits`

Crea un nuevo hábito y lo guarda en la base de datos.

| Campo        | Valor                                          |
|--------------|------------------------------------------------|
| Método       | `POST`                                         |
| URL          | `/habits`                                      |
| Content-Type | `application/json`                             |

**Body requerido:**

```json
{
  "title": "Meditar",
  "description": "Meditar 10 minutos cada mañana"
}
```

**Ejemplo de respuesta exitosa (`201 Created`):**

```json
{
  "_id": "664f1c2b3a8e4d001c8b4569",
  "title": "Meditar",
  "description": "Meditar 10 minutos cada mañana",
  "createdAt": "2024-05-23T12:00:00.000Z"
}
```

---

### `DELETE /habits/:id`

Elimina un hábito específico según su `_id` de MongoDB.

| Campo     | Valor              |
|-----------|--------------------|
| Método    | `DELETE`           |
| URL       | `/habits/:id`      |
| Parámetro | `id` — ID del hábito |

**Posibles respuestas:**

| Código | Descripción                                         |
|--------|-----------------------------------------------------|
| `200`  | Hábito eliminado correctamente                      |
| `404`  | No se encontró ningún hábito con el ID proporcionado |
| `500`  | Error interno del servidor                          |

**Ejemplo de respuesta `200`:**

```json
{
  "message": "Hábito eliminado correctamente"
}
```

**Ejemplo de respuesta `404`:**

```json
{
  "message": "Hábito no encontrado"
}
```

---

## 🧪 Ejemplos de uso con Postman

Puedes probar la API con [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/) o `curl`.

### Crear un hábito (`POST /habits`)

1. Abre Postman y crea una nueva request
2. Selecciona el método **POST**
3. Ingresa la URL: `http://localhost:3000/habits`
4. Ve a la pestaña **Body** → selecciona **raw** → cambia el formato a **JSON**
5. Pega el siguiente body:

```json
{
  "title": "Beber agua",
  "description": "Tomar 8 vasos de agua al día"
}
```

6. Haz clic en **Send**. Deberías recibir el objeto creado con su `_id` y `createdAt`.

---

### Obtener todos los hábitos (`GET /habits`)

1. Crea una nueva request en Postman
2. Selecciona el método **GET**
3. Ingresa la URL: `http://localhost:3000/habits`
4. Haz clic en **Send**. Recibirás un array con todos los hábitos guardados.

---

### Eliminar un hábito (`DELETE /habits/:id`)

1. Crea una nueva request con el método **DELETE**
2. Ingresa la URL con el ID del hábito: `http://localhost:3000/habits/664f1c2b3a8e4d001c8b4567`
3. Haz clic en **Send**

---

## 🐛 Errores comunes

### `MongoParseError: option usecreateindexes is not supported`

**Causa:** Estás usando parámetros obsoletos como `useNewUrlParser`, `useUnifiedTopology` o `useCreateIndex` en la cadena de conexión o en las opciones de `mongoose.connect()`.

**Solución:** Elimina esos parámetros. En versiones modernas del driver de MongoDB (v4+), estas opciones ya no existen y su presencia genera un error de parseo.

```js
// ❌ Incorrecto
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ✅ Correcto
mongoose.connect(process.env.MONGO_URI);
```

---

### `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Causa:** Intentas conectar a MongoDB local pero el servicio no está corriendo.

**Solución:** Inicia el servicio de MongoDB en tu máquina:

```bash
# macOS (con Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod
```

---

### `MongoServerError: Authentication failed`

**Causa:** Las credenciales en tu `MONGO_URI` son incorrectas (usuario o contraseña equivocados).

**Solución:** Verifica el usuario y contraseña en MongoDB Atlas y asegúrate de que el usuario tenga los permisos adecuados sobre la base de datos.

---

### El servidor arranca pero no muestra "Database connect"

**Causa:** La variable `MONGO_URI` no está definida o el archivo `.env` no se está cargando correctamente.

**Solución:** Verifica que el archivo `.env` esté en la raíz del proyecto y que el paquete `dotenv` se esté importando y configurando al inicio de `app.js` o `bin/www`:

```js
require('dotenv').config();
```

---

## 💡 Buenas prácticas

**No subas el archivo `.env` al repositorio.** Contiene información sensible como contraseñas y URIs de bases de datos. Asegúrate de que `.gitignore` incluya esta línea:

```
.env
```

**Revisa el estado de tus dependencias** periódicamente para mantenerlas actualizadas:

```bash
npm outdated
```

Para actualizar una dependencia específica:

```bash
npm install <paquete>@latest
```

**Usa variables de entorno para toda configuración sensible** — nunca escribas credenciales directamente en el código fuente.

**Valida los datos de entrada** en tus rutas `POST` antes de guardarlos en la base de datos, para evitar documentos incompletos o malformados.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT** (o la que corresponda a tu proyecto).

```
MIT License — © 2024 Tu Nombre o Empresa
```

> Puedes reemplazar esta sección con la licencia que aplique a tu proyecto.