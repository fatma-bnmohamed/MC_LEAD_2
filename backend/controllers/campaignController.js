const db = require("../config/db");

// 🔹 GET ALL (non archivées)
exports.getCampaigns = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM campaigns WHERE is_archived = false ORDER BY id ASC"
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// 🔹 CREATE
exports.createCampaign = async (req, res) => {
  try {
    const { name } = req.body;

    await db.query(
      "INSERT INTO campaigns (name) VALUES ($1)",
      [name]
    );

    res.json({ message: "Campaign created" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// 🔹 ARCHIVE ONE
exports.archiveCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE campaigns SET is_archived = true WHERE id=$1",
      [id]
    );

    res.json({ message: "Campaign archived" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// 🔹 ARCHIVE MANY
exports.archiveManyCampaigns = async (req, res) => {
  try {
    const { ids } = req.body;

    await db.query(
      "UPDATE campaigns SET is_archived = true WHERE id = ANY($1::int[])",
      [ids]
    );

    res.json({ message: "Campaigns archived" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// 🔹 TOGGLE STATUS
exports.toggleStatusCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE campaigns SET status = NOT status WHERE id=$1",
      [id]
    );

    res.json({ message: "Status updated" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// 🔹 ASSIGN FIELDS 🔥
exports.assignFieldsToCampaign = async (req, res) => {
  try {
    const { campaign_id, fields } = req.body;

    // supprimer anciens
    await db.query(
      "DELETE FROM campaign_fields WHERE campaign_id=$1",
      [campaign_id]
    );

    // ajouter nouveaux
    for (let f of fields) {
      await db.query(
        `INSERT INTO campaign_fields (campaign_id, field_id, step)
         VALUES ($1,$2,$3)`,
        [campaign_id, f.field_id, f.step || 1]
      );
    }

    res.json({ message: "Fields assigned" });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// 🔹 GET FIELDS BY CAMPAIGN 🔥
exports.getFieldsByCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT cf.*, c.name, c.field_type, c.options, c.is_required
      FROM campaign_fields cf
      JOIN custom_fields c ON c.id = cf.field_id
      WHERE cf.campaign_id = $1
      ORDER BY cf.step
    `, [id]);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json(err.message);
  }
};