const connection = require('../db/connection');
const bcrypt = require('bcryptjs');

class UserModel {
	// Create a new user
	static createUser(userData) {
		return new Promise((resolve, reject) => {
			const hashedPassword = bcrypt.hashSync(userData.password, 10);
			const sql = `INSERT INTO users (name, email, password, is_admin, user_type) VALUES (?, ?, ?, ?, ?)`;
			connection.query(
				sql,
				[userData.name, userData.email, hashedPassword, userData.is_admin || false, userData.user_type || 0],
				(err, result) => {
					if (err) {
						if (err.code === 'ER_DUP_ENTRY') {
							reject(new Error('Email already exists'));
						} else {
							reject(err);
						}
					} else {
						resolve({ id: result.insertId, ...userData, password: undefined });
					}
				}
			);
		});
	}

	// Get user by ID
	static getUserById(userId) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT id, name, email, is_admin, user_type, created_at FROM users WHERE id = ?`;
			connection.query(sql, [userId], (err, results) => {
				if (err) reject(err);
				else resolve(results[0] || null);
			});
		});
	}

	// Get user by email
	static getUserByEmail(email) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT id, name, email, password, is_admin, user_type, created_at FROM users WHERE email = ?`;
			connection.query(sql, [email], (err, results) => {
				if (err) reject(err);
				else resolve(results[0] || null);
			});
		});
	}

	// Get all users
	static getAllUsers() {
		return new Promise((resolve, reject) => {
			const sql = `SELECT id, name, email, is_admin, user_type, created_at FROM users ORDER BY created_at DESC`;
			connection.query(sql, (err, results) => {
				if (err) reject(err);
				else resolve(results || []);
			});
		});
	}

	// Get user by user_type (returns first match)
	static getUserByType(user_type) {
		return new Promise((resolve, reject) => {
			const sql = `SELECT id, name, email, is_admin, user_type, created_at FROM users WHERE user_type = ? LIMIT 1`;
			connection.query(sql, [user_type], (err, results) => {
				if (err) reject(err);
				else resolve(results[0] || null);
			});
		});
	}

	// Update user
	static updateUser(userId, userData) {
		return new Promise((resolve, reject) => {
			let sql = `UPDATE users SET `;
			const values = [];
			const fields = [];

			if (userData.name) {
				fields.push('name = ?');
				values.push(userData.name);
			}
			if (userData.email) {
				fields.push('email = ?');
				values.push(userData.email);
			}
			if (userData.password) {
				const hashedPassword = bcrypt.hashSync(userData.password, 10);
				fields.push('password = ?');
				values.push(hashedPassword);
			}

			if (typeof userData.user_type !== 'undefined') {
				fields.push('user_type = ?');
				values.push(userData.user_type);
				// keep is_admin consistent with user_type >= 1
				fields.push('is_admin = ?');
				values.push(userData.user_type >= 1 ? true : false);
			}

			if (fields.length === 0) {
				return resolve({ id: userId });
			}

			sql += fields.join(', ') + ' WHERE id = ?';
			values.push(userId);

			connection.query(sql, values, (err, result) => {
				if (err) {
					if (err.code === 'ER_DUP_ENTRY') {
						reject(new Error('Email already exists'));
					} else {
						reject(err);
					}
				} else {
					resolve({ id: userId, ...userData, password: undefined });
				}
			});
		});
	}

	// Delete user
	static deleteUser(userId) {
		return new Promise((resolve, reject) => {
			const sql = `DELETE FROM users WHERE id = ?`;
			connection.query(sql, [userId], (err, result) => {
				if (err) reject(err);
				else resolve({ deleted: result.affectedRows > 0 });
			});
		});
	}

	// Verify password
	static verifyPassword(password, hash) {
		return bcrypt.compareSync(password, hash);
	}
}

module.exports = UserModel;
