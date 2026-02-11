const mysql = require("mysql2/promise");

// Configuration du pool de connexions
const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "GestionOffreStage",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

const pool = mysql.createPool(poolConfig);

// Tester la connexion au démarrage
pool.getConnection()
  .then(connection => {
    console.log(`✅ Connexion à la base de données réussie: ${poolConfig.database}@${poolConfig.host}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    console.error('Vérifiez vos paramètres de connexion dans le fichier .env');
  });

/**
 * Exécute une requête SQL avec gestion d'erreurs améliorée
 * @param {string} sql - Requête SQL à exécuter
 * @param {object} params - Paramètres de la requête (objet pour namedPlaceholders)
 * @returns {Promise<Array>} Résultats de la requête
 */
async function query(sql, params = {}) {
  const startTime = Date.now();
  
  try {
    const [rows] = await pool.execute(sql, params);
    
    // Log des requêtes lentes (> 1 seconde)
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`[DB] Requête lente (${duration}ms):`, sql.substring(0, 100));
    }
    
    return rows;
  } catch (err) {
    // Log détaillé de l'erreur
    console.error("[DB] Erreur de requête:", {
      message: err.message,
      code: err.code,
      sqlState: err.sqlState,
      sql: sql.substring(0, 200),
      params: Object.keys(params).length > 0 ? Object.keys(params) : 'aucun',
    });
    
    // Relancer l'erreur pour qu'elle soit gérée par le middleware
    throw err;
  }
}

/**
 * Teste si la base de données est accessible
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    console.error('[DB] Test de connexion échoué:', err.message);
    return false;
  }
}

/**
 * Ferme proprement le pool de connexions
 */
async function closePool() {
  try {
    await pool.end();
    console.log('[DB] Pool de connexions fermé');
  } catch (err) {
    console.error('[DB] Erreur lors de la fermeture du pool:', err.message);
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  closePool,
};
