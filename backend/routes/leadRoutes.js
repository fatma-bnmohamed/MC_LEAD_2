const express = require('express');
const router = express.Router();
const multer = require('multer');
const leadController = require('../controllers/leadController');

const upload = multer({ dest: 'uploads/' });

// BATCH & IMPORT
router.get('/batches', leadController.getImportBatches);
router.post('/batches/delete', leadController.deleteBatches);
router.get('/batches/:id/leads', leadController.getBatchLeads);

router.post('/check-duplicates', leadController.checkDuplicates);
router.post('/import', leadController.importLeads);

//DUPLICATION (optionnel)
router.post('/:id/duplicate', leadController.duplicateLead);

//  LEADS CRUD
router.get('/', leadController.getAllLeads);
router.post('/', leadController.createLead);
router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);
router.post('/:id/validate', leadController.validateLead);
router.post('/bulk-update', leadController.bulkUpdateStatus);

module.exports = router;