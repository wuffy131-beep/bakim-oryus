// api/login.js

const { query } = require('./db');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    // CORS ve Metot Kontrolü
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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'E-posta ve şifre zorunludur.' });
        }

        // 1. Kullanıcıyı E-posta ile Bul
        const userResult = await query(
            'SELECT user_id, password_hash, username FROM users WHERE email = $1',
            [email]
        );

        const user = userResult.rows[0];

        if (!user) {
            // Kullanıcı yoksa, güvenlik için 'Şifre yanlış' gibi net bir hata vermeyiz.
            return res.status(401).json({ message: 'Giriş bilgileri hatalı.' });
        }

        // 2. Şifreleri Karşılaştır (Hash kontrolü)
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Giriş bilgileri hatalı.' });
        }

        // 3. Başarılı Giriş
        // Gerçek bir uygulamada, burada JWT (JSON Web Token) veya session oluşturulur.
        // Basitleştirilmiş örnek: Kullanıcı ID'sini ve adını döndürür.
        res.status(200).json({
            message: 'Giriş başarılı.',
            user: {
                userId: user.user_id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası: Giriş başarısız.' });
    }
};
