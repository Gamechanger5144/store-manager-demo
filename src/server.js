const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const net = require('net');
const path = require('path');
const initializeDB = require('./db/init');

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database and create tables
initializeDB().catch(err => {
	console.error('Database initialization failed:', err);
	process.exit(1);
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const eventRoutes = require('./routes/eventRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/events', eventRoutes);

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
		const portDisplay = port === 80 ? '' : `:${port}`;
		console.log(`🚀 Server running at http://localhost${portDisplay}`);
		console.log(`📂 Serving static files from: ${path.join(__dirname, '../public')}`);
	});
});
