const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/checkPermission");

// 🔍 GET USERS
router.get(
 "/users",
 auth,
 checkPermission("users", "view"), // ✅
 userController.getUsers
);

// ➕ CREATE
router.post("/users/create",
 auth,
 checkPermission("users", "create"),
 userController.createUser
);

// ✏️ UPDATE
router.put("/users/update/:id",
 auth,
 checkPermission("users", "update"),
 userController.updateUser
);

// ❌ DELETE
router.delete("/users/delete/:id",
 auth,
 checkPermission("users", "delete"),
 userController.deleteUser
);

// 🔐 RESET PASSWORD
router.put(
 "/users/reset-password/:id",
 auth,
 checkPermission("users", "update"),
 userController.resetPassword
);

// 🔄 STATUS
router.put(
 "/users/toggle-status/:id",
 auth,
 checkPermission("users", "update"),
 userController.toggleStatus
);

// 🧹 DELETE MANY
router.delete(
 "/users/delete-many",
 auth,
 checkPermission("users", "delete"),
 userController.deleteManyUsers
);

// 🔄 STATUS MANY
router.put(
 "/users/status-many",
 auth,
 checkPermission("users", "update"),
 userController.toggleManyStatus
);

// 📦 ARCHIVE
router.put(
 "/users/archive/:id",
 auth,
 checkPermission("users", "update"),
 userController.archiveUser
);

router.put(
 "/users/archive-many",
 auth,
 checkPermission("users", "update"),
 userController.archiveManyUsers
);

module.exports = router;