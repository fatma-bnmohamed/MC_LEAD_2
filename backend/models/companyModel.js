const db = require('../config/db');

const Company = {

    // 🔥 CREATE
    create: async ({ name, description, type }) => {
        const sql = `
            INSERT INTO campagnes (name, description, type ) 
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const result = await db.query(sql, [name, description, type]);

        return result.rows[0]; 
    },

    // 🔥 GET ALL
    getAll: async () => {
    const sql = `
        SELECT c.*, COUNT(cf.id) as fields_count 
        FROM campagnes c
        LEFT JOIN campagne_fields cf ON c.id = cf.campagne_id
        WHERE c.is_archived = false   -- 🔥 ICI
        GROUP BY c.id
        ORDER BY c.created_at DESC
    `;

    const result = await db.query(sql);
    return result.rows;
},

    // 🔥 GET BY ID
   getById: async (id) => {
    const result = await db.query(
        "SELECT * FROM campagnes WHERE id = $1 AND is_archived = false",
        [id]
    );
    return result.rows[0];

    },

    // 🔥 UPDATE
    update: async (id, { name, description }) => {
    const sql = `
        UPDATE campagnes 
        SET name = $1, 
            description = $2,
            updated_at = NOW()   -- 🔥 IMPORTANT
        WHERE id = $3 AND is_archived = false
    `;

    const result = await db.query(sql, [name, description, id]);
    return result;
},

    // 🔥 DELETE
    // ✅ BON (SOFT DELETE)
delete: async (id) => {
    const result = await db.query(
        "UPDATE campagnes SET is_archived = true WHERE id = $1",
        [id]
    );
    return result;
}
};

module.exports = Company;