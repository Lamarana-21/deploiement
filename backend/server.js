const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const internshipsRoutes = require("./routes/internships");
const proposalsRoutes = require("./routes/proposals");
const offersRoutes = require("./routes/offers");
const statsRoutes = require("./routes/stats");
const favoritesRoutes = require("./routes/favorites");
const notificationsRoutes = require("./routes/notifications");
const uploadRoutes = require("./routes/upload");
const contactRoutes = require("./routes/contact");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(morgan("dev"));
app.use(express.json({ limit: '10mb' })); // Limite de taille pour éviter les attaques
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
// Allow cookies/sessions in dev (Vite runs on 5173). Using origin:true reflects the request Origin.
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Serve uploaded files from the project-level uploads/ directory
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me_in_production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// --- API (placeholder) ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/internships", internshipsRoutes);
app.use("/api/proposals", proposalsRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact", contactRoutes);

// --- Frontend static hosting ---
// In production, serve the built React app from frontend/dist
// In dev, React runs on Vite (port 5173) with proxy to backend (port 3000)
const frontendDistDir = path.resolve(__dirname, "..", "frontend", "dist");
const fs = require("fs");

if (fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));
  
  // SPA fallback: serve index.html for any non-API route
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(frontendDistDir, "index.html"));
    } else {
      res.status(404).json({ ok: false, message: "Not found" });
    }
  });
} else {
  console.warn("⚠️  Production build not found. Run 'npm run build' in frontend/ to generate it.");
  console.warn("⚠️  For development, run Vite on port 5173: cd frontend && npm run dev");
  
  // Dev fallback: just handle API 404s
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return notFoundHandler(req, res);
    }
    res.status(404).send("Frontend not built. Run 'npm run build' in frontend/ or use Vite dev server.");
  });
}

// Middleware de gestion globale des erreurs (doit être après toutes les routes)
app.use(errorHandler);

// Gestion des erreurs non attrapées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Arrêter proprement le serveur en cas d'erreur critique
  process.exit(1);
});

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`✅ Backend listening on http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion de l'arrêt propre du serveur
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    const { closePool } = require('./db');
    closePool().then(() => process.exit(0));
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    const { closePool } = require('./db');
    closePool().then(() => process.exit(0));
  });
});
