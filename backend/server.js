const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const fs = require("fs");

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// --- CONFIGURATION CORS MISE À JOUR ---
const allowedOrigins = [
  "https://lamarana-vmq9.onrender.com", // Ton URL Frontend Render
  "http://localhost:5173"              // Développement local
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- CONFIGURATION SESSION SÉCURISÉE ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me_in_production",
    resave: false,
    saveUninitialized: false,
    proxy: true, // Nécessaire pour Render (Reverse Proxy)
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production", // Active HTTPS en prod
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    },
  })
);

// --- API ROUTES ---
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

// --- GESTION DU FRONTEND ---
const frontendDistDir = path.resolve(__dirname, "..", "frontend", "dist");

if (fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(frontendDistDir, "index.html"));
    } else {
      res.status(404).json({ ok: false, message: "API route not found" });
    }
  });
} else {
  app.get("/", (req, res) => {
    res.json({ 
        message: "Backend is running. API available at /api", 
        frontend_status: "Not linked in this service" 
    });
  });
  
  app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
      return notFoundHandler(req, res);
    }
    res.status(404).json({ error: "Route non trouvée sur le backend" });
  });
}

app.use(errorHandler);

// --- DÉMARRAGE DU SERVEUR ---
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`✅ Backend listening on port ${port}`);
});

// Clean shutdown
const gracefulShutdown = () => {
  server.close(() => {
    console.log('HTTP server closed');
    const { closePool } = require('./db');
    closePool().then(() => process.exit(0));
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);