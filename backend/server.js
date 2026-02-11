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

// --- CONFIGURATION DE BASE ---
app.disable("x-powered-by");
app.use(morgan("dev"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// --- CONFIGURATION CORS BLINDÉE ---
const allowedOrigins = [
  "https://lamarana-vmq9.onrender.com",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Autorise les requêtes sans origine (Postman) ou présentes dans la liste
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // Réponse propre pour les navigateurs anciens
};

app.use(cors(corsOptions));
// Gérer explicitement les requêtes OPTIONS (Preflight) avant les routes
app.options('*', cors(corsOptions));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- CONFIGURATION SESSION (OPTIMISÉE RENDER) ---
const isProduction = process.env.NODE_ENV === "production";

// Indispensable sur Render pour que les cookies 'secure' soient transmis via le proxy
app.set("trust proxy", 1); 

app.use(
  session({
    name: "lamarana_sid", 
    secret: process.env.SESSION_SECRET || "une_cle_tres_secrete_12345",
    resave: false,
    saveUninitialized: false,
    proxy: true, 
    cookie: {
      httpOnly: true,
      // 'none' est obligatoire pour le cross-site (frontend et backend sur domaines différents)
      sameSite: isProduction ? "none" : "lax", 
      secure: isProduction, // HTTPS obligatoire en production
      maxAge: 24 * 60 * 60 * 1000 // 1 jour
    },
  })
);

// --- API ROUTES ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV, service: "backend" });
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
    res.json({ message: "Backend is running. API at /api" });
  });
}

app.use(errorHandler);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`✅ Server ready on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Arrêt propre
const gracefulShutdown = () => {
  server.close(() => {
    console.log('Server terminated');
    const { closePool } = require('./db');
    closePool().then(() => process.exit(0));
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);