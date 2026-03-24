const db = require("../config/db");

// Voir tous les rôles
exports.getUserGroups = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM user_groups WHERE is_archived = false ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// Créer rôle
exports.createUserGroups = async (req, res) => {
  const { name, description, role } = req.body;

  if (!name || !description || !role) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const result = await db.query(
    `INSERT INTO user_groups (name, description, role)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [name, description, role]
  );

  res.json({
    message: "Role created successfully",
    role: result.rows[0]
  });
};

// Modifier rôle
exports.updateUserGroups = async (req, res) => {
  const { id } = req.params;
  const { name, description, role } = req.body;

  try {
    const group = await db.query(
      "SELECT role FROM user_groups WHERE id=$1",
      [id]
    );

    if (!group.rows[0]) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    if (group.rows[0].role === "admin") {
      return res.status(403).json({
        message: "Cannot edit admin group"
      });
    }

    const result = await db.query(
      "UPDATE user_groups SET name=$1, description=$2, role=$3 WHERE id=$4 RETURNING *",
      [name, description, role, id]
    );

    res.json({
      message: "Role updated successfully",
      role: result.rows[0]
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// Supprimer rôle
exports.deleteUserGroups = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await db.query(
      "SELECT role FROM user_groups WHERE id=$1",
      [id]
    );

    if (!group.rows[0]) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    if (group.rows[0].role === "admin") {
      return res.status(403).json({
        message: "Cannot delete admin group"
      });
    }

    const deletedRole = await db.query(
      "DELETE FROM user_groups WHERE id=$1 RETURNING *",
      [id]
    );

    res.json({
      message: "Role deleted successfully",
      deleted_role: deletedRole.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle multiple status
exports.toggleManyStatusUserGroups = async (req, res) => {
  const { ids } = req.body;

  try {
    const filteredIds = ids.filter(id => id != 1);

    if (filteredIds.length === 0) {
      return res.status(403).json({
        message: "Admin group cannot be modified"
      });
    }

    const groups = await db.query(`
      SELECT id, status FROM user_groups
      WHERE id = ANY($1::int[])
    `, [filteredIds]);

    await db.query(`
      UPDATE user_groups
      SET status = NOT status
      WHERE id = ANY($1::int[])
    `, [filteredIds]);

    const toDisable = groups.rows
      .filter(g => g.status === true)
      .map(g => g.id);

    if (toDisable.length > 0) {
      await db.query(`
        UPDATE users
        SET status = false,
            is_disabled_by_group = true
        WHERE group_id = ANY($1::int[])
      `, [toDisable]);
    }

    const toEnable = groups.rows
      .filter(g => g.status === false)
      .map(g => g.id);

    if (toEnable.length > 0) {
      await db.query(`
        UPDATE users
        SET status = true,
            is_disabled_by_group = false
        WHERE group_id = ANY($1::int[])
        AND is_disabled_by_group = true
      `, [toEnable]);
    }

    res.json({
      message: "Groups and users updated",
      updated_count: filteredIds.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// Delete many
exports.deleteManyUserGroups = async (req, res) => {
  const { ids } = req.body;

  try {
    const filteredIds = ids.filter(id => id != 1);

    if (filteredIds.length === 0) {
      return res.status(403).json({
        message: "Cannot delete admin group"
      });
    }

    await db.query(`
      DELETE FROM user_groups
      WHERE id = ANY($1::int[])
    `, [filteredIds]);

    res.json({
      message: "Groups deleted successfully",
      deleted_count: filteredIds.length
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// Archive group
exports.archiveGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await db.query(
      "SELECT role FROM user_groups WHERE id=$1",
      [id]
    );

    if (!group.rows[0]) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    if (group.rows[0].role === "admin") {
      return res.status(403).json({
        message: "Cannot archive admin group"
      });
    }

    const users = await db.query(`
      SELECT username FROM users WHERE group_id=$1
    `, [id]);

    await db.query(`
      UPDATE user_groups
      SET is_archived = true
      WHERE id=$1
    `, [id]);

    await db.query(`
      UPDATE users
      SET is_archived = true
      WHERE group_id=$1
    `, [id]);

    res.json({
      message: "Group archived successfully",
      users: users.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// Archive many
exports.archiveManyGroups = async (req, res) => {
  const { ids } = req.body;

  try {
    const filteredIds = ids.filter(id => id != 1);

    if (filteredIds.length === 0) {
      return res.status(403).json({
        message: "Admin group cannot be archived"
      });
    }

    await db.query(`
      UPDATE user_groups
      SET is_archived = true
      WHERE id = ANY($1::int[])
    `, [filteredIds]);

    await db.query(`
      UPDATE users
      SET is_archived = true
      WHERE group_id = ANY($1::int[])
    `, [filteredIds]);

    res.json({
      message: "Groups and their users archived successfully",
      count: filteredIds.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// Toggle status single
exports.toggleStatusUserGroups = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await db.query(
      "SELECT role, status FROM user_groups WHERE id=$1",
      [id]
    );

    if (!group.rows[0]) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    if (group.rows[0].role === "admin") {
      return res.status(403).json({
        message: "Cannot modify admin group"
      });
    }

    const currentStatus = group.rows[0].status;

    await db.query(`
      UPDATE user_groups
      SET status = NOT status
      WHERE id=$1
    `, [id]);

    if (currentStatus === true) {
      await db.query(`
        UPDATE users
        SET status = false,
            is_disabled_by_group = true
        WHERE group_id=$1
      `, [id]);
    } else {
      await db.query(`
        UPDATE users
        SET status = true,
            is_disabled_by_group = false
        WHERE group_id=$1
        AND is_disabled_by_group = true
      `, [id]);
    }

    res.json({
      message: "Group and users updated"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// Update permissions
exports.updatePermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  try {
    const group = await db.query(
      "SELECT role FROM user_groups WHERE id=$1",
      [id]
    );

    if (!group.rows[0]) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    if (group.rows[0].role === "admin") {
      return res.status(403).json({
        message: "Admin group cannot be modified"
      });
    }

    if (typeof permissions !== "object") {
      return res.status(400).json({
        message: "Permissions are required"
      });
    }

    const result = await db.query(
      `UPDATE user_groups
       SET permissions = $1
       WHERE id = $2
       RETURNING id, name, permissions`,
      [JSON.stringify(permissions), id]
    );

    res.json({
      message: "Permissions updated",
      group: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
};