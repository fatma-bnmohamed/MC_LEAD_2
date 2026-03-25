const db = require("../config/db");

// 🔹 GET ALL
exports.getFields = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM custom_fields ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 CREATE
exports.createField = async (req, res) => {
  try {
    const { name, field_type, is_required, options } = req.body;

    const result = await db.query(
      `INSERT INTO custom_fields (name, field_type, is_required, options)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ name, field_type, is_required, options ? JSON.stringify(options) : null ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 UPDATE
exports.updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, field_type, is_required, options } = req.body;

    const result = await db.query(
      `UPDATE custom_fields
       SET name=$1, field_type=$2, is_required=$3, options=$4
       WHERE id=$5
       RETURNING *`,
      [name, field_type, is_required, options || null, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 DELETE
exports.deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM custom_fields WHERE id=$1", [id]);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteManyFields = async (req, res) => {
  try {
    const { ids } = req.body;

    console.log("IDS:", ids); // 🔥 DEBUG

    await db.query(
      "DELETE FROM custom_fields WHERE id = ANY($1::int[])",
      [ids]
    );

    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};