const express = require("express");
const router = express.Router();
const userGroupController = require("../controllers/userGroupController");
const auth = require("../middleware/authMiddleware");
const userGroup = require("../middleware/userGroupMiddleware");
const checkPermission = require("../middleware/checkPermission");

router.get("/userGroup",
  auth,
  checkPermission("users_groups", "view"), 
  userGroupController.getUserGroups
);

router.post("/userGroup/create",auth,
 userGroup(["admin"]), userGroupController.createUserGroups);

router.put("/userGroup/update/:id",auth,
 userGroup(["admin"]), userGroupController.updateUserGroups);

router.delete("/userGroup/delete/:id",auth,
 userGroup(["admin"]), userGroupController.deleteUserGroups);

 // toggle status (un seul groupe)
router.put(
"/userGroup/toggle-status/:id",
auth,
userGroup(["admin"]),
userGroupController.toggleStatusUserGroups
);

router.put(
  "/userGroup/archive/:id",
  auth,
  userGroup(["admin"]),
  userGroupController.archiveGroup
);

router.put(
  "/userGroup/archive-many",
  auth,
  userGroup(["admin"]),
  userGroupController.archiveManyGroups
);
// toggle status bulk
router.put(
"/userGroup/status-many",
auth,
userGroup(["admin"]),
userGroupController.toggleManyStatusUserGroups
);


// supprimer plusieurs groupes
router.delete(
  "/userGroup/delete-many",
  auth,
  userGroup(["admin"]),
  userGroupController.deleteManyUserGroups
);

router.put(
  "/userGroup/permissions/:id",
  auth,
  userGroup(["admin"]),
  userGroupController.updatePermissions
);

module.exports = router;