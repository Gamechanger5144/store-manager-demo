const StoreModel = require('../models/storeModel');
const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse');

const storeController = {
	// Bulk import stores from CSV
	bulkImport: (req, res) => {
		if (!req.file) {
			return res.status(400).json({ success: false, message: 'No file uploaded' });
		}
		const filePath = req.file.path;
		const results = [];
		const errors = [];
		fs.createReadStream(filePath)
			.pipe(csvParse({ columns: true, trim: true }))
			.on('data', (row) => {
				// Expected columns: code, designation, manager, email, mobile, storeType
				const { code, designation, manager, email, mobile, storeType } = row;
				if (!code || !designation || !manager || !email || !mobile || !storeType) {
					errors.push({ code, error: 'Missing required fields' });
					return;
				}
				StoreModel.getByCode(code, (err, stores) => {
					if (err) {
						errors.push({ code, error: err.message });
						return;
					}
					if (stores.length > 0) {
						// Update existing
						StoreModel.update(code, { designation, manager, email, mobile, storeType }, (err) => {
							if (err) errors.push({ code, error: err.message });
							else results.push({ code, action: 'updated' });
						});
					} else {
						// Add new
						StoreModel.add({ code, designation, manager, email, mobile, storeType }, (err) => {
							if (err) errors.push({ code, error: err.message });
							else results.push({ code, action: 'created' });
						});
					}
				});
			})
			.on('end', () => {
				fs.unlink(filePath, () => {}); // cleanup
				setTimeout(() => {
					res.json({ success: true, results, errors });
				}, 500); // allow async DB ops to finish
			})
			.on('error', (err) => {
				fs.unlink(filePath, () => {});
				res.status(500).json({ success: false, message: 'CSV parse error: ' + err.message });
			});
	},
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
