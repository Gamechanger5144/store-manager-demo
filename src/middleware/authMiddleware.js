const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me-in-production';

const authMiddleware = (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(' ')[1];

		if (!token) {
			return res.status(401).json({ error: 'Token required' });
		}

		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		console.error('Auth error:', err.message);
		res.status(401).json({ error: 'Invalid or expired token' });
	}
};

module.exports = authMiddleware;
