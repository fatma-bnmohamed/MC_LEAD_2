const express = require("express");
const router = express.Router();

const campaignController = require("../controllers/campaignController");
const auth = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/checkPermission");

// 🔥 GET
router.get(
  "/campaigns",
  auth,
  checkPermission("campaigns", "view"),
  campaignController.getCampaigns
);

// 🔥 CREATE
router.post(
  "/campaigns",
  auth,
  checkPermission("campaigns", "create"),
  campaignController.createCampaign
);

// 🔥 ARCHIVE MANY (IMPORTANT ordre)
router.put(
  "/campaigns/archive-many",
  auth,
  checkPermission("campaigns", "delete"),
  campaignController.archiveManyCampaigns
);

// 🔥 ARCHIVE ONE
router.put(
  "/campaigns/archive/:id",
  auth,
  checkPermission("campaigns", "delete"),
  campaignController.archiveCampaign
);

// 🔥 TOGGLE STATUS
router.put(
  "/campaigns/toggle-status/:id",
  auth,
  checkPermission("campaigns", "update"),
  campaignController.toggleStatusCampaign
);

// 🔥 ASSIGN FIELDS
router.post(
  "/campaigns/fields",
  auth,
  checkPermission("campaigns", "update"),
  campaignController.assignFieldsToCampaign
);

// 🔥 GET FIELDS BY CAMPAIGN
router.get(
  "/campaigns/:id/fields",
  auth,
  campaignController.getFieldsByCampaign
);

module.exports = router;