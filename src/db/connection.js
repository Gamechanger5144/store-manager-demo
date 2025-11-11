const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "store_manager_demo",
});

connection.connect(err => {
	if (err) {
		console.error("❌ MySQL Connection Failed:", err && err.message ? err.message : err);
		if (err && err.code === 'ER_ACCESS_DENIED_ERROR') {
			console.error('\nTip: MySQL denied access for the configured user.');
			console.error(' - If you are using a password, create a .env file in the project root with correct credentials.');
			console.error('   Example .env (copy from .env.example):');
			console.error('     DB_HOST=localhost');
			console.error('     DB_USER=root');
			console.error('     DB_PASSWORD=your_mysql_password');
			console.error('     DB_NAME=store_manager_demo');
			console.error('\n - Or create/grant a MySQL user that matches these credentials:');
			console.error("     CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'strongpassword';");
			console.error("     GRANT ALL PRIVILEGES ON store_manager_demo.* TO 'appuser'@'localhost';");
			console.error('\nAfter updating credentials, restart the server (npm start).');
		}
	} else {
		console.log("✅ MySQL Connected!");
	}
});

module.exports = connection;
