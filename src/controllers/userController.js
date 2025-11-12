const UserModel = require('../models/userModel');
const EventModel = require('../models/eventModel');

class UserController {
	// Get all users (admin only)
	static async getAllUsers(req, res) {
		try {
			// main (user_type=2) can view all users
			if (req.user.user_type === 2) {
				const users = await UserModel.getAllUsers();
				return res.json({ success: true, users });
			}

			// admins (user_type=1) can view only regular users
			if (req.user.user_type === 1) {
				const users = await UserModel.getAllUsers();
				const regular = users.filter(u => u.user_type === 0 || typeof u.user_type === 'undefined');
				return res.json({ success: true, users: regular });
			}

			return res.status(403).json({ error: 'Unauthorized' });
		} catch (err) {
			console.error('Get users error:', err);
			res.status(500).json({ error: 'Server error' });
		}
	}

	// Get single user (admin can view any, users can only view themselves)
	static async getUser(req, res) {
		try {
			const { userId } = req.params;

			const targetUser = await UserModel.getUserById(userId);
			if (!targetUser) {
				return res.status(404).json({ error: 'User not found' });
			}

			// Permission checks:
			// - main (2) can update anyone
			// - admin (1) can update regular users only (user_type === 0)
			// - regular users can update only themselves
			if (req.user.user_type === 2) {
				// allowed
			} else if (req.user.user_type === 1) {
				if (req.user.id !== parseInt(userId) && targetUser.user_type && targetUser.user_type >= 1) {
					return res.status(403).json({ error: 'Admins cannot update other admins or main users' });
				}
				// admins cannot change roles (user_type) — only main can
				if (typeof req.body.user_type !== 'undefined') {
					return res.status(403).json({ error: 'Only main users can change roles' });
				}
			} else {
				if (req.user.id !== parseInt(userId)) {
					return res.status(403).json({ error: 'Unauthorized' });
				}
				// regular user cannot change role
				if (typeof req.body.user_type !== 'undefined') {
					return res.status(403).json({ error: 'Unauthorized to change role' });
				}
			}

			const user = await UserModel.getUserById(userId);
			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			res.json({ success: true, user });
		} catch (err) {
			console.error('Get user error:', err);
			res.status(500).json({ error: 'Server error' });
		}
	}

	// Create user (admin only)
	static async createUser(req, res) {
		try {
			if (!req.user.is_admin) {
				return res.status(403).json({ error: 'Only admins can create users' });
			}

			const { name, email, password, user_type } = req.body;
			if (!name || !email || !password) {
				return res.status(400).json({ error: 'Name, email, and password are required' });
			}

			const desiredType = typeof user_type === 'number' ? user_type : parseInt(user_type) || 0;

			// If requester is not main, they cannot create admin/main users
			if (req.user.user_type !== 2 && desiredType >= 1) {
				return res.status(403).json({ error: 'Only main users can create admin or main accounts' });
			}

			// If trying to create a main user (2), ensure none exists
			if (desiredType === 2) {
				const existingMain = await UserModel.getUserByType(2);
				if (existingMain) {
					return res.status(400).json({ error: 'A main user already exists' });
				}
			}

			const user = await UserModel.createUser({
				name,
				email,
				password,
				is_admin: !!(desiredType >= 1),
				user_type: desiredType,
			});

			// Log create event
			try { EventModel.logEvent(req.user.email || req.user.id, `create_user:${email}`); } catch (e) { console.error('Event log error:', e); }

			res.status(201).json({
				success: true,
				message: 'User created successfully',
				user,
			});
		} catch (err) {
			console.error('Create user error:', err);
			if (err.message === 'Email already exists') {
				res.status(409).json({ error: 'Email already exists' });
			} else {
				res.status(500).json({ error: 'Server error' });
			}
		}
	}

	// Update user (admin can update any user, users can only update themselves)
	static async updateUser(req, res) {
		try {
			const { userId } = req.params;
			const { name, email, password } = req.body;

			if (!req.user.is_admin && req.user.id !== parseInt(userId)) {
				return res.status(403).json({ error: 'Unauthorized' });
			}

			if (!name && !email && !password) {
				return res.status(400).json({ error: 'At least one field (name, email, password) is required' });
			}

			const { user_type } = req.body;

			const updateFields = { name, email };
			if (password) updateFields.password = password;
			// Only main user can change user_type (role)
			if (typeof user_type !== 'undefined') {
				const desiredType = typeof user_type === 'number' ? user_type : parseInt(user_type);
				if (req.user.user_type !== 2) {
					// non-main cannot change roles
					return res.status(403).json({ error: 'Only main users can change roles' });
				}
				if (desiredType === 2) {
					const existingMain = await UserModel.getUserByType(2);
					if (existingMain && existingMain.id !== parseInt(userId)) {
						return res.status(400).json({ error: 'A main user already exists' });
					}
				}
				updateFields.user_type = desiredType;
			}

			const user = await UserModel.updateUser(userId, updateFields);

			// Log update event
			try { EventModel.logEvent(req.user.email || req.user.id, `update_user:${userId}`); } catch (e) { console.error('Event log error:', e); }

			// If password was changed, also log a password_change event for target user
			if (password) {
				try {
					// Get target user's email
					const target = await UserModel.getUserById(userId);
					if (target) EventModel.logEvent(target.email, `password_change`);
				} catch (e) { console.error('Event log error:', e); }
			}
			res.json({
				success: true,
				message: 'User updated successfully',
				user,
			});
		} catch (err) {
			console.error('Update user error:', err);
			if (err.message === 'Email already exists') {
				res.status(409).json({ error: 'Email already exists' });
			} else {
				res.status(500).json({ error: 'Server error' });
			}
		}
	}

	// Delete user (admin only, cannot delete own admin account)
	static async deleteUser(req, res) {
		try {
			const { userId } = req.params;
			const targetUser = await UserModel.getUserById(userId);
			if (!targetUser) {
				return res.status(404).json({ error: 'User not found' });
			}

			// Only main or admin can delete — main can delete anyone (except self), admin only regular users
			if (req.user.user_type === 2) {
				if (req.user.id === parseInt(userId)) {
					return res.status(400).json({ error: 'Cannot delete your own account' });
				}
			} else if (req.user.user_type === 1) {
				if (req.user.id === parseInt(userId)) {
					return res.status(400).json({ error: 'Cannot delete your own admin account' });
				}
				if (targetUser.user_type && targetUser.user_type >= 1) {
					return res.status(403).json({ error: 'Admins cannot delete other admins or main users' });
				}
			} else {
				return res.status(403).json({ error: 'Only admins can delete users' });
			}

			const result = await UserModel.deleteUser(userId);

			// Log delete event
			try { EventModel.logEvent(req.user.email || req.user.id, `delete_user:${userId}`); } catch (e) { console.error('Event log error:', e); }
			if (!result.deleted) {
				return res.status(404).json({ error: 'User not found' });
			}

			res.json({ success: true, message: 'User deleted successfully' });
		} catch (err) {
			console.error('Delete user error:', err);
			res.status(500).json({ error: 'Server error' });
		}
	}
}

module.exports = UserController;
