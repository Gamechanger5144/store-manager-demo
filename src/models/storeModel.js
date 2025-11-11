const db = require('../db/connection');

const StoreModel = {
	getAll: (cb) => {
		db.query("SELECT * FROM stores ORDER BY code", cb);
	},
	getByCode: (code, cb) => {
		db.query("SELECT * FROM stores WHERE code = ?", [code], cb);
	},
	add: (data, cb) => {
		const { code, designation, manager, email, mobile, storeType } = data;
		db.query(
			"INSERT INTO stores (code, designation, manager, email, mobile, store_type) VALUES (?, ?, ?, ?, ?, ?)",
			[code, designation, manager, email, mobile, storeType],
			cb
		);
	},
	update: (code, data, cb) => {
		const { designation, manager, email, mobile, storeType } = data;
		db.query(
			"UPDATE stores SET designation = ?, manager = ?, email = ?, mobile = ?, store_type = ? WHERE code = ?",
			[designation, manager, email, mobile, storeType, code],
			cb
		);
	},
	delete: (code, cb) => {
		db.query("DELETE FROM stores WHERE code = ?", [code], cb);
	},
};

module.exports = StoreModel;
