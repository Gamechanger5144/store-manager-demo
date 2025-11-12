const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const EventModel = require('../models/eventModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me-in-production';

class AuthController {
	// Login user
	static async login(req, res) {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(400).json({ error: 'Email and password are required' });
			}

			// Get user by email
			const user = await UserModel.getUserByEmail(email);
			if (!user) {
 				// Log failed login attempt
 				try { const EventModel = require('../models/eventModel'); EventModel.logEvent(email, 'failed_login'); } catch(e){console.error('Event log error:', e)}
 				return res.status(401).json({ error: 'Invalid email or password' });
			}

			// Verify password
			const isPasswordValid = UserModel.verifyPassword(password, user.password);
			if (!isPasswordValid) {
				// Log failed login attempt
				try { const EventModel = require('../models/eventModel'); EventModel.logEvent(email, 'failed_login'); } catch(e){console.error('Event log error:', e)}
				return res.status(401).json({ error: 'Invalid email or password' });
			}

			// Generate JWT token (include user_type)
			// Derive is_admin from user_type if not explicitly set
			const isAdminFlag = !!(user.is_admin || (user.user_type && user.user_type >= 1));

			const token = jwt.sign(
				{ id: user.id, email: user.email, name: user.name, is_admin: isAdminFlag, user_type: user.user_type },
				JWT_SECRET,
				{ expiresIn: '24h' }
			);

			// Log login event
			try { EventModel.logEvent(user.email, 'login'); } catch (e) { console.error('Event log error:', e); }

			res.json({
				success: true,
				token,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					is_admin: isAdminFlag,
					user_type: user.user_type || 0,
				},
			});
		} catch (err) {
			console.error('Login error:', err);
			res.status(500).json({ error: 'Server error' });
		}
	}

	// Register user (for creating new users)
	static async register(req, res) {
		try {
			const { name, email, password } = req.body;

			if (!name || !email || !password) {
				return res.status(400).json({ error: 'Name, email, and password are required' });
			}

			// Create user
			const user = await UserModel.createUser({
				name,
				email,
				password,
				is_admin: false,
			});

			// Log register event
			try { EventModel.logEvent(email, 'register'); } catch (e) { console.error('Event log error:', e); }

			res.status(201).json({
				success: true,
				message: 'User created successfully',
				user,
			});
		} catch (err) {
			console.error('Register error:', err);
			if (err.message === 'Email already exists') {
				res.status(409).json({ error: 'Email already exists' });
			} else {
				res.status(500).json({ error: 'Server error' });
			}
		}
	}

	// Get current user from token
	static async getCurrentUser(req, res) {
		try {
			const user = await UserModel.getUserById(req.user.id);
			res.json({ success: true, user });
		} catch (err) {
			console.error('Get user error:', err);
			res.status(500).json({ error: 'Server error' });
		}
	}
}

module.exports = AuthController;
