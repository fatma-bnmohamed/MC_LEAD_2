const db = require('../config/db');

const ImportBatch = {

    // 🔥 créer batch
    createBatch: async ({ campagne_id, filename, total_leads }) => {
        const result = await db.query(
            `INSERT INTO import_batches (campagne_id, filename, total_leads)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [campagne_id, filename, total_leads]
        );

        return result.rows[0].id;
    },

    // 🔥 update nombre leads
    updateTotalLeads: async (batchId, total) => {
        await db.query(
            `UPDATE import_batches 
             SET total_leads = $1 
             WHERE id = $2`,
            [total, batchId]
        );
    },

    // 🔥 récupérer batches
    getBatches: async ({ campagne_id, date }) => {
        let query = `SELECT * FROM import_batches WHERE 1=1`;
        let params = [];
        let index = 1;

        if (campagne_id) {
            query += ` AND campagne_id = $${index}`;
            params.push(campagne_id);
            index++;
        }

        if (date) {
            query += ` AND DATE(created_at) = $${index}`;
            params.push(date);
            index++;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await db.query(query, params);
        return result.rows;
    }

};

module.exports = ImportBatch;