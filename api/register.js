// api/register.js

const { query } = require('./db'); // db.js dosyasını kullandık
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    // CORS Başlıkları
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
        }

        // 1. Şifreyi Hash'le (Güvenlik)
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 2. Kullanıcıyı NeonDB'ye Kaydet
        const result = await query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id',
            [username, email, password_hash]
        );

        res.status(201).json({ 
            message: 'Kayıt başarılı.', 
            userId: result.rows[0].user_id 
        });

    } catch (error) {
        console.error('Kayıt hatası:', error.detail);
        if (error.code === '23505') { // Benzersizlik (Unique) hatası kodu
            return res.status(409).json({ message: 'Kullanıcı adı veya e-posta zaten kullanımda.' });
        }
        res.status(500).json({ message: 'Sunucu hatası: Kayıt başarısız.', error: error.message });
    }
};
