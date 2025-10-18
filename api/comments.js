// api/comments.js
const { query } = require('./db');

// Vercel'in Serverless Function Yapısı
module.exports = async (req, res) => {
    // CORS Başlıkları (Frontend'den gelen isteklere izin vermek için)
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS isteği (Ön kontrol) varsa, başarılı cevap döndür
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // --- YORUMLARI ÇEKME (GET İSTEĞİ) ---
    if (req.method === 'GET') {
        try {
            const result = await query(`
                SELECT 
                    c.content, 
                    c.created_at, 
                    u.username 
                FROM comments c
                JOIN users u ON c.user_id = u.user_id
                ORDER BY c.created_at DESC
            `);
            return res.status(200).json(result.rows);

        } catch (error) {
            console.error('Yorumları çekme hatası:', error);
            return res.status(500).json({ message: 'Sunucu hatası: Yorumlar yüklenemedi.', error: error.message });
        }
    }

    // --- YORUM EKLEME (POST İSTEĞİ) ---
    if (req.method === 'POST') {
        // Body'yi almak için Vercel'in req.body'si kullanılır
        const { user_id, content } = req.body; 

        if (!user_id || !content) {
            return res.status(400).json({ message: 'Kullanıcı ID\'si ve yorum içeriği zorunludur.' });
        }

        try {
            // Güvenlik Uyarısı: user_id'yi frontend'den almak GÜVENSİZDİR. 
            // Giriş sisteminden gelen bir session/token ile değiştirilmelidir.
            await query(
                'INSERT INTO comments (user_id, content) VALUES ($1, $2)',
                [user_id, content]
            );
            return res.status(201).json({ message: 'Yorum başarıyla eklendi.' });
            
        } catch (error) {
            console.error('Yorum ekleme hatası:', error);
            return res.status(500).json({ message: 'Sunucu hatası: Yorum eklenemedi.', error: error.message });
        }
    }

    // Desteklenmeyen metotlar için
    res.status(405).json({ message: 'Method Not Allowed' });
};
