const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// campagnes
router.get('/', companyController.getCompanies);
router.post('/', companyController.createCompany);
router.put('/:id', companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);
router.get('/:id', companyController.getCompanyById);
// sync (IMPORTANT)
router.post('/:id/sync', companyController.syncCompanyTable);

// champs dynamiques
router.post('/:id/fields', companyController.addField);
router.put('/:id/fields/:fieldId', companyController.updateField);
router.delete('/:id/fields/:fieldId', companyController.deleteField);

module.exports = router;
