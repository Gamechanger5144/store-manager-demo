const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');


const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', storeController.getAll);
router.get('/:code', storeController.getByCode);
router.post('/', storeController.add);
router.put('/:code', storeController.update);
router.delete('/:code', storeController.delete);

// Bulk import endpoint
router.post('/import', upload.single('file'), storeController.bulkImport);

module.exports = router;
