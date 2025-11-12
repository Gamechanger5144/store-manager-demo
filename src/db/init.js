const connection = require('./connection');
const bcrypt = require('bcryptjs');

async function initializeDB() {
	return new Promise((resolve, reject) => {
		// Create users table (added user_type: 0=user,1=admin,2=main)
		const createTableSQL = `
			CREATE TABLE IF NOT EXISTS users (
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(100) NOT NULL,
				email VARCHAR(255) UNIQUE NOT NULL,
				password VARCHAR(255) NOT NULL,
				is_admin BOOLEAN DEFAULT FALSE,
				user_type INT DEFAULT 0,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
			)
		`;

		connection.query(createTableSQL, (err) => {
			if (err) {
				console.error('Failed to create users table:', err);
				return reject(err);
			}

			console.log('✅ Users table ready');

			// Ensure `user_type` column exists (in case the table was created earlier without it)
			const showColSQL = `SHOW COLUMNS FROM users LIKE 'user_type'`;
			connection.query(showColSQL, (err, colResults) => {
				if (err) {
					console.error('Failed to check user_type column:', err);
					return reject(err);
				}

				function proceedCheckMain() {
					// If a "main" user (user_type = 2) exists, skip creating the hardcoded main user
					const checkMainSQL = `SELECT * FROM users WHERE user_type = 2 LIMIT 1`;
					connection.query(checkMainSQL, (err, mainResults) => {
						if (err) {
							console.error('Failed to check for main user:', err);
							return reject(err);
						}

						if (mainResults && mainResults.length > 0) {
							console.log('✅ Main user found in database — skipping hardcoded main creation');
							// Ensure super admin exists as well
							return ensureSuperAdmin();
						}

						// Create or promote the main user with provided credentials
						const mainEmail = 'shubham.dhyani@singleinterface.com';
						const checkByEmailSQL = `SELECT * FROM users WHERE email = ? LIMIT 1`;
						connection.query(checkByEmailSQL, [mainEmail], (err, emailResults) => {
							if (err) {
								console.error('Failed to check for existing main email:', err);
								return reject(err);
							}

							if (emailResults && emailResults.length > 0) {
								// Promote existing user to main (user_type=2)
								const updateSQL = `UPDATE users SET user_type = 2, is_admin = TRUE WHERE id = ?`;
								connection.query(updateSQL, [emailResults[0].id], (err) => {
									if (err) {
										console.error('Failed to promote existing user to main:', err);
										return reject(err);
									}
									console.log('✅ Existing user promoted to main');
									// After promoting, ensure super admin exists
									return ensureSuperAdmin();
								});
							} else {
								const hashedPassword = bcrypt.hashSync('resonance@123', 10);
								const insertMainSQL = `INSERT INTO users (name, email, password, is_admin, user_type) VALUES (?, ?, ?, ?, ?)`;
								connection.query(insertMainSQL, ['Shubham', mainEmail, hashedPassword, true, 2], (err) => {
									if (err) {
										console.error('Failed to insert main user:', err);
										return reject(err);
									}
									console.log('✅ Main user created');
									// After creating main, ensure super admin exists
									return ensureSuperAdmin();
								});
							}
						});
					});
				}

				// Ensure Super Admin exists (name: 'super admin', email: 'Superadmin@singleinterface.com')
				function ensureSuperAdmin() {
					const superEmail = 'Superadmin@singleinterface.com';
					const checkSuperSQL = `SELECT * FROM users WHERE email = ? LIMIT 1`;
					connection.query(checkSuperSQL, [superEmail], (err, results) => {
						if (err) {
							console.error('Failed to check super admin user:', err);
							return reject(err);
						}

						if (results && results.length > 0) {
							console.log('✅ Super admin user already exists');
							return resolve();
						}

						// Insert super admin with initial password (can be changed later via app)
						const hashedSuper = bcrypt.hashSync('Resonance@123', 10);
						const insertSuperSQL = `INSERT INTO users (name, email, password, is_admin, user_type) VALUES (?, ?, ?, ?, ?)`;
						connection.query(insertSuperSQL, ['super admin', superEmail, hashedSuper, true, 1], (err) => {
							if (err) {
								console.error('Failed to insert super admin user:', err);
								return reject(err);
							}
							console.log('✅ Super admin user created');
							return resolve();
						});
					});
				}

				if (colResults && colResults.length === 0) {
					// Add the user_type column
					const alterSQL = `ALTER TABLE users ADD COLUMN user_type INT DEFAULT 0`;
					connection.query(alterSQL, (err) => {
						if (err) {
							console.error('Failed to add user_type column:', err);
							return reject(err);
						}
						console.log('✅ Added user_type column to users table');
						proceedCheckMain();
					});
				} else {
					// Column exists already
					proceedCheckMain();
				}

				// Ensure events table exists
				const createEventsSQL = `
					CREATE TABLE IF NOT EXISTS events (
						id INT AUTO_INCREMENT PRIMARY KEY,
						email VARCHAR(255) NOT NULL,
						event VARCHAR(255) NOT NULL,
						event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					)
				`;
				connection.query(createEventsSQL, (err) => {
					if (err) {
						console.error('Failed to create events table:', err);
						return reject(err);
					}
					console.log('✅ Events table ready');
				});
			});
		});
	});
}

// Run if this file is executed directly
if (require.main === module) {
	initializeDB()
		.then(() => {
			console.log('Database initialized successfully');
			process.exit(0);
		})
		.catch((err) => {
			console.error('Database initialization failed:', err);
			process.exit(1);
		});
}

module.exports = initializeDB;
