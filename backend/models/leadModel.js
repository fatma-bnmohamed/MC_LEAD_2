const db = require('../config/db');

const Lead = {

    // 🔥 CREATE SIMPLE
    createLead: async (leadData) => {
        const sql = `
            INSERT INTO leads 
            (source, email, phone, firstname, lastname, company_name, segment, 
             address, zip_code, city, siret, naf, employees, comment, campagne_id) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
            RETURNING *
        `;

        const values = [
            leadData.source || 'manual',
            leadData.email,
            leadData.phone || null,
            leadData.firstname || null,
            leadData.lastname || null,
            leadData.company_name || null,
            leadData.segment || null,
            leadData.address || null,
            leadData.zip_code || null,
            leadData.city || null,
            leadData.siret || null,
            leadData.naf || null,
            leadData.employees || 0,
            leadData.comment || null,
            leadData.campagne_id || null
        ];

        const result = await db.query(sql, values);
        return result.rows[0];
    },

    // 🔥 GET ALL
    getAll: async ({ page = 1, limit = 10, search = '', segment = '' } = {}) => {
        const offset = (page - 1) * limit;

        let sql = "SELECT * FROM leads WHERE 1=1";
        const params = [];

        if (search) {
            sql += ` AND (firstname ILIKE $${params.length+1} OR lastname ILIKE $${params.length+2} OR email ILIKE $${params.length+3})`;
            const pattern = `%${search}%`;
            params.push(pattern, pattern, pattern);
        }

        if (segment) {
            sql += ` AND source = $${params.length+1}`;
            params.push(segment);
        }

        sql += ` ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`;
        params.push(limit, offset);

        const result = await db.query(sql, params);

        const countResult = await db.query("SELECT COUNT(*) FROM leads");

        return {
            data: result.rows,
            meta: {
                total: parseInt(countResult.rows[0].count),
                page,
                limit,
                total_pages: Math.ceil(countResult.rows[0].count / limit)
            }
        };
    },

    // 🔥 GET BY ID
    getById: async (id) => {
        const result = await db.query(
            "SELECT * FROM leads WHERE id = $1",
            [id]
        );
        return result.rows[0];
    },

    // 🔥 FIND BY EMAIL
    findByEmail: async (email) => {
        const result = await db.query(
            "SELECT * FROM leads WHERE email = $1",
            [email]
        );
        return result.rows[0];
    },

    // 🔥 UPDATE
    updateLead: async (id, leadData) => {
        const sql = `
            UPDATE leads SET 
            email=$1, phone=$2, firstname=$3, lastname=$4,
            company_name=$5, segment=$6, address=$7, zip_code=$8,
            city=$9, siret=$10, naf=$11, employees=$12, comment=$13, campagne_id=$14
            WHERE id=$15
            RETURNING *
        `;

        const values = [
            leadData.email,
            leadData.phone,
            leadData.firstname,
            leadData.lastname,
            leadData.company_name,
            leadData.segment,
            leadData.address,
            leadData.zip_code,
            leadData.city,
            leadData.siret,
            leadData.naf,
            leadData.employees,
            leadData.comment,
            leadData.campagne_id,
            id
        ];

        const result = await db.query(sql, values);
        return result.rows[0];
    },

    // 🔥 DUPLICATION (FIX POSTGRES)
    duplicateToCampagne: async (leadId, sourceTableName, targetTableName, targetCampagneId) => {
        try {
            const source = await db.query(
                `SELECT * FROM ${sourceTableName} WHERE id = $1`,
                [leadId]
            );

            const originalLead = source.rows[0];
            if (!originalLead) throw new Error("Lead introuvable");

            // 🔥 récupérer colonnes PostgreSQL
            const colsResult = await db.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [targetTableName]);

            const targetColumns = colsResult.rows.map(c => c.column_name);

            let dataToInsert = {};

            Object.keys(originalLead).forEach(key => {
                if (
                    !['id','created_at','updated_at','campagne_id','submission_status'].includes(key) &&
                    targetColumns.includes(key) &&
                    originalLead[key] !== null
                ) {
                    dataToInsert[key] = originalLead[key];
                }
            });

            dataToInsert.campagne_id = targetCampagneId;
            dataToInsert.submission_status = 'not_submitted';

            const cols = Object.keys(dataToInsert);
            const values = Object.values(dataToInsert);

            const placeholders = cols.map((_, i) => `$${i+1}`).join(',');

            const result = await db.query(
                `INSERT INTO ${targetTableName} (${cols.join(',')}) VALUES (${placeholders}) RETURNING id`,
                values
            );

            return { newId: result.rows[0].id };

        } catch (err) {
            console.error(err);
            throw err;
        }
    }
};

module.exports = Lead;