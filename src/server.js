const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const net = require('net');
const path = require('path');

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

const storeRoutes = require('./routes/storeRoutes');
app.use('/api/stores', storeRoutes);

function findAvailablePort(startPort, callback) {
	const server = net.createServer();
	server.listen(startPort, () => {
		server.once('close', () => callback(startPort));
		server.close();
	});
	server.on('error', () => {
		findAvailablePort(startPort + 1, callback);
	});
}

const DEFAULT_PORT = parseInt(process.env.PORT) || 3000;
findAvailablePort(DEFAULT_PORT, (port) => {
	app.listen(port, () => {
		console.log(`🚀 Server running at http://localhost:${port}`);
		console.log(`📂 Serving static files from: ${path.join(__dirname, '../public')}`);
	});
});
