// api/db.js
// PostgreSQL bağlantısı için 'pg' kütüphanesini kullanıyoruz
const { Pool } = require('pg');

// Vercel ortam değişkeni olan NEON_DB_URL'yi buradan çekiyoruz
const connectionString = process.env.NEON_DB_URL; 

// Ortam değişkeninin varlığını kontrol et
if (!connectionString) {
    // Bu hata Vercel loglarında kolayca görünür olmalıdır
    throw new Error('NEON_DB_URL ortam değişkeni Vercel Ayarlarında ayarlanmadı!');
}

// PostgreSQL bağlantı havuzunu (Pool) oluştur
const pool = new Pool({
    connectionString,
    
    // !!! VERCEL VE NEONDB İÇİN KRİTİK SSL AYARI !!!
    // Sunucusuz (Serverless) ortamlar için gereklidir.
    ssl: { 
        rejectUnauthorized: false 
    } 
});

// Veritabanı sorgularını daha kolay yapabilmek için bir fonksiyon dışa aktar
module.exports = {
    query: (text, params) => pool.query(text, params),
};

// Ek kontrol: Bağlantı kurulup kurulmadığını kontrol eden basit bir sorgu
pool.connect()
    .then(client => {
        console.log('PostgreSQL (NeonDB) bağlantısı başarılı.');
        client.release(); // Bağlantıyı havuza geri bırak
    })
    .catch(err => {
        console.error('PostgreSQL (NeonDB) bağlantı hatası:', err.message);
        // Hata durumunda uygulama çökmesin ama loglarda uyarı olsun
    });
