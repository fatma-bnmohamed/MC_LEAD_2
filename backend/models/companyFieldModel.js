const db = require('../config/db');

const CompanyField = {

    // 🔥 CREATE
    create: async (companyId, fieldData) => {

    // 🔥 1. CHECK EXISTENCE
    const existing = await db.query(`
        SELECT * FROM campagne_fields
        WHERE campagne_id = $1 AND field_key = $2
    `, [companyId, fieldData.field_key]);

    // 🔥 2. SI EXISTE
    if (existing.rows.length > 0) {
        const field = existing.rows[0];

        // 👉 CAS 1 : champ supprimé → REACTIVER
        if (field.is_active === false) {
            const updated = await db.query(`
                UPDATE campagne_fields
                SET 
                    field_label = $1,
                    field_type = $2,
                    is_required = $3,
                    is_active = true
                WHERE id = $4
                RETURNING *
            `, [
                fieldData.field_label,
                fieldData.field_type,
                fieldData.is_required,
                field.id
            ]);

            return updated.rows[0];
        }

        // 👉 CAS 2 : existe déjà actif
        throw new Error("Ce champ existe déjà");
    }

    // 🔥 3. INSERT NORMAL
    const sql = `
        INSERT INTO campagne_fields 
        (campagne_id, field_label, field_key, field_type, is_required, options, sort_order, is_active) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        RETURNING *
    `;

    const optionsStr = Array.isArray(fieldData.options)
        ? JSON.stringify(fieldData.options)
        : null;

    const values = [
        companyId,
        fieldData.field_label,
        fieldData.field_key,
        fieldData.field_type,
        fieldData.is_required ? true : false,
        optionsStr,
        fieldData.sort_order || 0
    ];

    const result = await db.query(sql, values);
    return result.rows[0];
},

    // 🔥 GET BY COMPANY
    getByCompanyId: async (companyId) => {
        const sql = `
            SELECT * 
            FROM campagne_fields 
            WHERE campagne_id = $1 
            AND is_active = true
            ORDER BY sort_order ASC
        `;

        const result = await db.query(sql, [companyId]);

        return result.rows.map(r => ({
            ...r,
            is_required: !!r.is_required,
            options: r.options
                ? (typeof r.options === 'string'
                    ? JSON.parse(r.options)
                    : r.options)
                : null
        }));
    },

    // 🔥 UPDATE
    update: async (fieldId, fieldData) => {
        const sql = `
            UPDATE campagne_fields 
            SET field_label = $1, field_key = $2, field_type = $3, 
                is_required = $4, options = $5, sort_order = $6
            WHERE id = $7
            RETURNING *
        `;

        const optionsStr = Array.isArray(fieldData.options)
            ? JSON.stringify(fieldData.options)
            : null;

        const values = [
            fieldData.field_label,
            fieldData.field_key,
            fieldData.field_type,
            fieldData.is_required ? true : false,
            optionsStr,
            fieldData.sort_order || 0,
            fieldId
        ];

        const result = await db.query(sql, values);
        return result.rows[0];
    },

    // 🔥 DELETE
    delete: async (fieldId) => {
        const sql = "DELETE FROM campagne_fields WHERE id = $1";
        const result = await db.query(sql, [fieldId]);
        return result;
    }
};

module.exports = CompanyField;