const express = require("express");
const router = express.Router();

const customFieldController = require("../controllers/customFieldController");
const auth = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/checkPermission");

// 🔐 permissions custom_fields

router.get(
  "/custom-fields",
  auth,
  checkPermission("custom_fields", "view"),
  customFieldController.getFields
);

router.post(
  "/custom-fields",
  auth,
  checkPermission("custom_fields", "create"),
  customFieldController.createField
);

router.put(
  "/custom-fields/:id",
  auth,
  checkPermission("custom_fields", "update"),
  customFieldController.updateField
);

router.delete(
  "/custom-fields/delete-many",
  auth,
  checkPermission("custom_fields", "delete"),
  customFieldController.deleteManyFields
);

router.delete(
  "/custom-fields/:id",
  auth,
  checkPermission("custom_fields", "delete"),
  customFieldController.deleteField
);



module.exports = router;