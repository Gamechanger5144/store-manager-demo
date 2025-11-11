const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.get('/', storeController.getAll);
router.get('/:code', storeController.getByCode);
router.post('/', storeController.add);
router.put('/:code', storeController.update);
router.delete('/:code', storeController.delete);

module.exports = router;
