const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, EventController.listEvents);
router.get('/export', authMiddleware, EventController.exportCSV);

module.exports = router;
