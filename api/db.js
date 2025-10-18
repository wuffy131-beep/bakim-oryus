// api/db.js
const { Pool } = require('pg');

// VERCEL ORTAM DEĞİŞKENİNİ KULLANMA
// process.env.NEON_DB_URL, Vercel ayarlarında belirlediğiniz isim olmalıdır.
const connectionString = process.env.NEON_DB_URL; 

if (!connectionString) {
    throw new Error('NEON_DB_URL ortam değişkeni ayarlanmadı.');
}

const pool = new Pool({
    connectionString,
    // Sunucusuz Ortamlar İçin Ek Ayarlar Gerekebilir:
    ssl: { rejectUnauthorized: false } 
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
