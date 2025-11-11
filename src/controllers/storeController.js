const StoreModel = require('../models/storeModel');

const storeController = {
	getAll: (req, res) => {
		StoreModel.getAll((err, results) => {
			if (err) return res.status(500).json({ success: false, error: err.message });
			res.json(results);
		});
	},
	getByCode: (req, res) => {
		StoreModel.getByCode(req.params.code, (err, results) => {
			if (err) return res.json({ success: false, error: err.message });
			if (results.length === 0) return res.json({ success: false, message: "Store not found" });
			res.json({ success: true, store: results[0] });
		});
	},
	add: (req, res) => {
		const { code, designation, manager, email, mobile, storeType } = req.body;
		if (!code || !designation || !manager || !email || !mobile || !storeType) {
			return res.json({ success: false, message: "All fields are required" });
		}
		StoreModel.add(req.body, (err, result) => {
			if (err) {
				if (err.code === 'ER_DUP_ENTRY') {
					return res.json({ success: false, message: "Store code already exists" });
				}
				return res.json({ success: false, message: "Error adding store: " + err.message });
			}
			res.json({ success: true, message: "Store added successfully!", id: result.insertId });
		});
	},
	update: (req, res) => {
		const { designation, manager, email, mobile, storeType } = req.body;
		if (!designation || !manager || !email || !mobile || !storeType) {
			return res.json({ success: false, message: "All fields are required" });
		}
		StoreModel.update(req.params.code, req.body, (err, result) => {
			if (err) return res.json({ success: false, message: "Error updating store: " + err.message });
			if (result.affectedRows === 0) return res.json({ success: false, message: "Store not found" });
			res.json({ success: true, message: "Store updated successfully!" });
		});
	},
	delete: (req, res) => {
		StoreModel.delete(req.params.code, (err, result) => {
			if (err) return res.json({ success: false, message: "Error deleting store: " + err.message });
			if (result.affectedRows === 0) return res.json({ success: false, message: "Store not found" });
			res.json({ success: true, message: "Store deleted successfully!" });
		});
	},
};

module.exports = storeController;
