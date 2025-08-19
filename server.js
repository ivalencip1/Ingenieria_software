import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

// Definir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos del build de React
app.use(express.static(path.join(__dirname, "frontend", "build")));

// Ruta "Hola Mundo" en formato json
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hola Mundo desde el Backend MERN 🚀" });
});


// Servir index.html solo en rutas que no empiezan por /api
app.get(/^((?!\/api).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});