const Lead = require('../models/leadModel');
const CompanyField = require('../models/companyFieldModel');
const ImportBatch = require('../models/importBatchModel');
//const xlsx = require('xlsx');
const fs = require('fs');

const db = require('../config/db');

// Helper function to sanitize names for dynamic table names
const getTableName = (name) => {
    return 'camp_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '');
};

exports.createLead = async (req, res) => {
    try {
        const { campagne_id, ...data } = req.body;

        if (req.user && req.user.id) {
            data.user_id = req.user.id;
        }

        if (!campagne_id) {
            return res.status(400).json({ error: "campagne_id requis" });
        }

        // 🔥 récupérer campagne
        const resultCamp = await db.query(
            "SELECT name FROM campagnes WHERE id = $1",
            [campagne_id]
        );

        if (resultCamp.rows.length === 0) {
            return res.status(404).json({ error: "Campagne introuvable" });
        }

        const tableName = getTableName(resultCamp.rows[0].name);

        // 🔥 VALIDATION AVANT INSERT (IMPORTANT)
        const fields = await CompanyField.getByCompanyId(campagne_id);

        for (const field of fields) {
            if (field.is_active === false) continue;

            const value = data[field.field_key];

            if (field.is_required && !value) {
                return res.status(400).json({
                    error: `${field.field_label} est obligatoire`
                });
            }

            if (value) {
                switch (field.field_type) {
                    case "number":
                        if (isNaN(value)) {
                            return res.status(400).json({
                                error: `${field.field_label} doit être un nombre`
                            });
                        }
                        break;

                    case "email":
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            return res.status(400).json({
                                error: `${field.field_label} invalide`
                            });
                        }
                        break;
                }
            }
        }

        // 🔥 récupérer colonnes PostgreSQL
        const colsResult = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [tableName]);

        const tableCols = colsResult.rows.map(c => c.column_name);

        // 🔥 filtrer champs valides
        const keys = Object.keys(data).filter(k => tableCols.includes(k));

        // 🔥 valeurs fixes
        const baseCols = ["campagne_id", "validation_status", "updated_at"];
        const baseValues = ["$1", "'pending'", "NOW()"];

        // 🔥 valeurs dynamiques
        const dynamicCols = keys;
        const dynamicValues = keys.map((_, i) => `$${i + 2}`);

        const params = [campagne_id, ...keys.map(k => data[k])];

        const query = `
            INSERT INTO ${tableName} 
            (${[...baseCols, ...dynamicCols].join(', ')})
            VALUES (${[...baseValues, ...dynamicValues].join(', ')})
            RETURNING *
        `;

        const insertResult = await db.query(query, params);

        res.status(201).json({
            success: true,
            data: insertResult.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllLeads = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const campagne_id = req.query.campagne_id || 'all';
        const status = req.query.status || '';
        const offset = (page - 1) * limit;

        // 🔥 campagnes
        let campagnes;
        if (campagne_id === 'all') {
            const result = await db.query(`
                SELECT id, name 
                FROM campagnes 
                WHERE is_archived = false
            `);
            campagnes = result.rows;
        } else {
            const result = await db.query(
                "SELECT id, name FROM campagnes WHERE id = $1 AND is_archived = false",
                [campagne_id]
            );
            campagnes = result.rows;
        }

        if (campagnes.length === 0) {
            return res.json({ success: true, data: [], pagination: { total: 0, page, limit } });
        }

        let unionQueries = [];
        let queryParams = [];
        let paramIndex = 1;

        for (const camp of campagnes) {
            const tableName = getTableName(camp.name);

            try {
                // 🔥 CHECK TABLE EXISTENCE
                const check = await db.query(
                    `SELECT to_regclass($1) as exists`,
                    [`public.${tableName}`]
                );

                if (!check.rows[0].exists) {
                    console.log(`⛔ skip table inexistante: ${tableName}`);
                    continue;
                }

                // 🔥 GET COLUMNS
                const colsRes = await db.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = $1 AND table_schema = 'public'
                `, [tableName]);

                const cols = colsRes.rows.map(c => c.column_name);

                const baseColumns = [
                    "id",
                    "firstname",
                    "lastname",
                    "validation_status",
                    "created_at",
                    "updated_at",
                    "phone",
                    "user_id",
                ];

                let selectParts = [];

               baseColumns.forEach(col => {
    if (cols.includes(col)) {
        selectParts.push(`t.${col}::text as ${col}`);
    } else {
        selectParts.push(`NULL::text as ${col}`);
    }
});

                // 🔥 INFOS CAMPAGNE
                selectParts.push(`'${camp.name}' as campagne_name`);
                selectParts.push(`${camp.id} as campagne_id`);
                selectParts.push(`c.type as type`);

                // 🔥 RAISON SOCIALE SAFE (IMPORTANT)
                let raisonSociale = "NULL";

                if (cols.includes("firstname") && cols.includes("lastname")) {
                    raisonSociale = "COALESCE(t.firstname,'') || ' ' || COALESCE(t.lastname,'')";
                } else if (cols.includes("firstname")) {
                    raisonSociale = "t.firstname";
                } else if (cols.includes("lastname")) {
                    raisonSociale = "t.lastname";
                } else if (cols.includes("email")) {
                    raisonSociale = "t.email";
                }

                selectParts.push(`${raisonSociale} as raison_sociale`);

                // 🔥 AGENT
                selectParts.push("u.full_name as agent");

                // 🔥 WHERE dynamique
                let whereParts = ["1=1"];

                // 🔥 SEARCH FULL DYNAMIQUE
                if (search) {
                    let searchConditions = [];

                    cols.forEach(col => {
                        searchConditions.push(`t.${col}::text ILIKE $${paramIndex}`);
                    });

                    if (searchConditions.length > 0) {
                        whereParts.push(`(${searchConditions.join(" OR ")})`);
                        queryParams.push(`%${search}%`);
                        paramIndex++;
                    }
                }

                // 🔥 STATUS
                if (status) {
                    whereParts.push(`t.validation_status = $${paramIndex}`);
                    queryParams.push(status);
                    paramIndex++;
                }

                const hasUserId = cols.includes("user_id");

                unionQueries.push(`
                    SELECT ${selectParts.join(', ')} 
                    FROM ${tableName} t
                    LEFT JOIN users u ON u.id = ${hasUserId ? "t.user_id" : "NULL"}
                    LEFT JOIN campagnes c ON c.id = t.campagne_id
                    WHERE ${whereParts.join(' AND ')}
                `);

            } catch (err) {
                console.log(`⛔ erreur ignorée pour ${tableName}`);
                continue;
            }
        }

        if (unionQueries.length === 0) {
            return res.json({
                success: true,
                data: [],
                pagination: {
                    total: 0,
                    page,
                    limit
                }
            });
        }

        const finalQuery = `
            SELECT * FROM (
                ${unionQueries.join(" UNION ALL ")}
            ) as all_leads
            ORDER BY created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        queryParams.push(limit, offset);

        const result = await db.query(finalQuery, queryParams);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: result.rows.length,
                page,
                limit
            }
        });

    } catch (err) {
        console.error("Erreur getAllLeads:", err);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};
exports.getLeadById = async (req, res) => {
    try {
        const { id } = req.params;
        const campagne_id = req.query.campagne_id;

        // 🔥 fallback (optionnel)
        if (!campagne_id) {
            return res.status(400).json({ error: "campagne_id requis" });
        }

        // 🔥 récupérer campagne
        const campResult = await db.query(
            "SELECT id, name FROM campagnes WHERE id = $1",
            [campagne_id]
        );

        if (campResult.rows.length === 0) {
            return res.status(404).json({ error: "Campagne introuvable" });
        }

        const campaignData = campResult.rows[0];
        const tableName = getTableName(campaignData.name);

        // 🔥 récupérer lead
        const leadResult = await db.query(
            `SELECT * FROM ${tableName} WHERE id = $1`,
            [id]
        );

        if (leadResult.rows.length === 0) {
            return res.status(404).json({ error: "Lead introuvable" });
        }

        const lead = leadResult.rows[0];

        // 🔥 enrichir
        lead.campagne_id = parseInt(campagne_id);
        lead.campagne_name = campaignData.name;

        // 🔥 récupérer champs dynamiques
        const fields = await CompanyField.getByCompanyId(campagne_id);

        res.json({
            success: true,
            data: lead,
            fields: fields
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: "Erreur serveur",
            details: err.message
        });
    }
};

exports.updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const { campagne_id, ...data } = req.body;

        if (!campagne_id) {
            return res.status(400).json({ error: "campagne_id requis" });
        }

        // 🔥 récupérer campagne
        const campResult = await db.query(
            "SELECT name FROM campagnes WHERE id = $1",
            [campagne_id]
        );

        if (campResult.rows.length === 0) {
            return res.status(404).json({ error: "Campagne introuvable" });
        }

        const tableName = getTableName(campResult.rows[0].name);

        // 🔥 vérifier lead
        const existing = await db.query(
            `SELECT * FROM ${tableName} WHERE id = $1`,
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: "Lead introuvable" });
        }

        // 🔥 récupérer colonnes PostgreSQL
        const colsResult = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [tableName]);

        const tableCols = colsResult.rows.map(c => c.column_name);

        // 🔥 filtrer champs valides
        const keys = Object.keys(data).filter(k =>
            tableCols.includes(k) &&
            !['id', 'created_at', 'updated_at'].includes(k)
        );

        if (keys.length === 0) {
            return res.json({ success: true, message: "Aucune modification" });
        }

        // 🔥 construire UPDATE dynamique
        const setParts = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const values = keys.map(k => data[k]);

        await db.query(
            `UPDATE ${tableName}
             SET ${setParts}, updated_at = NOW()
             WHERE id = $${keys.length + 1}`,
            [...values, id]
        );

        res.json({
            success: true,
            message: `Lead ${id} mis à jour`
        });

    } catch (err) {
        console.error(err);

        if (err.code === '23505') { // PostgreSQL duplicate
            return res.status(409).json({ error: "Valeur déjà utilisée" });
        }

        res.status(500).json({
            error: "Erreur serveur",
            details: err.message
        });
    }
};

exports.checkDuplicates = async (req, res) => {
    try {
        const { company_id, emails, phones } = req.body;

        if (!company_id) {
            return res.status(400).json({ error: "company_id requis" });
        }

        // 🔥 récupérer campagne
        const campResult = await db.query(
            "SELECT name FROM campagnes WHERE id = $1",
            [company_id]
        );

        if (campResult.rows.length === 0) {
            return res.status(404).json({ error: "Campagne introuvable" });
        }

        const tableName = getTableName(campResult.rows[0].name);

        // 🔥 récupérer colonnes
        const colsRes = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [tableName]);

        const cols = colsRes.rows.map(c => c.column_name);

        let duplicateEmails = [];
        let duplicatePhones = [];

        // 🔍 EMAILS
        if (Array.isArray(emails) && emails.length > 0 && cols.includes('email')) {
            const result = await db.query(
                `SELECT email FROM ${tableName} WHERE email = ANY($1)`,
                [emails]
            );
            duplicateEmails = result.rows.map(r => r.email);
        }

        // 🔍 PHONES
        if (Array.isArray(phones) && phones.length > 0 && cols.includes('phone')) {
            const result = await db.query(
                `SELECT phone FROM ${tableName} WHERE phone = ANY($1)`,
                [phones]
            );
            duplicatePhones = result.rows.map(r => r.phone);
        }

        res.json({
            success: true,
            duplicateEmails,
            duplicatePhones,
            hasDuplicates: duplicateEmails.length > 0 || duplicatePhones.length > 0
        });

    } catch (err) {
        console.error("Erreur checkDuplicates:", err);
        res.status(500).json({
            error: "Erreur serveur",
            details: err.message
        });
    }
};

exports.importLeads = async (req, res) => {
    try {
        const { company_id, leads, filename } = req.body;

        if (!company_id || !Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({ error: "company_id et leads requis" });
        }

        // 🔥 récupérer campagne
        const campResult = await db.query(
            "SELECT name FROM campagnes WHERE id = $1",
            [company_id]
        );

        if (campResult.rows.length === 0) {
            return res.status(404).json({ error: "Campagne introuvable" });
        }

        const tableName = getTableName(campResult.rows[0].name);

        // 🔥 récupérer colonnes PostgreSQL
        const colsRes = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [tableName]);

        const tableCols = colsRes.rows.map(c => c.column_name);

        // 🔥 batch
        const batchId = await ImportBatch.createBatch({
            campagne_id: company_id,
            filename: filename || null,
            total_leads: 0
        });

        const hasBatchIdCol = tableCols.includes('batch_id');

        let insertedCount = 0;
        let skippedCount = 0;

        const idCol = tableCols.includes('email') ? 'email' : null;

        for (const leadData of leads) {

            const emailValue = leadData.email || leadData.mail;

            if (!emailValue) {
                skippedCount++;
                continue;
            }

            const dynamicKeys = Object.keys(leadData).filter(k =>
                tableCols.includes(k) &&
                !['id', 'created_at', 'updated_at', 'validation_status', 'batch_id'].includes(k)
            );

            const dynamicValues = dynamicKeys.map(k => leadData[k]);

            try {
                let existingId = null;

                // 🔍 vérifier doublon
                if (idCol) {
                    const existing = await db.query(
                        `SELECT id FROM ${tableName} WHERE ${idCol} = $1`,
                        [emailValue]
                    );

                    if (existing.rows.length > 0) {
                        existingId = existing.rows[0].id;
                    }
                }

                if (existingId) {
                    // 🔄 UPDATE
                    if (dynamicKeys.length > 0) {
                        const setParts = dynamicKeys.map((k, i) => `${k} = $${i + 1}`).join(', ');

                        await db.query(
                            `UPDATE ${tableName}
                             SET ${setParts}, updated_at = NOW()
                             WHERE id = $${dynamicKeys.length + 1}`,
                            [...dynamicValues, existingId]
                        );
                    }

                    insertedCount++;

                } else {
                    // ➕ INSERT
                    if (dynamicKeys.length > 0) {

                        const baseCols = ['campagne_id', 'validation_status', 'updated_at'];
                        const baseValues = [`$1`, `'pending'`, `NOW()`];

                        const dynamicCols = dynamicKeys;
                        const dynamicPlaceholders = dynamicKeys.map((_, i) => `$${i + 2}`);

                        let finalCols = [...baseCols, ...dynamicCols];
                        let finalValues = [...baseValues, ...dynamicPlaceholders];

                        let params = [company_id, ...dynamicValues];

                        // 🔥 batch
                        if (hasBatchIdCol) {
                            finalCols.splice(1, 0, 'batch_id');
                            finalValues.splice(1, 0, `$${params.length + 1}`);
                            params.push(batchId);
                        }

                        await db.query(
                            `INSERT INTO ${tableName} (${finalCols.join(', ')})
                             VALUES (${finalValues.join(', ')})`,
                            params
                        );

                        insertedCount++;

                    } else {
                        skippedCount++;
                    }
                }

            } catch (err) {
                console.error("Erreur lead:", err.message);
                skippedCount++;
            }
        }

        await ImportBatch.updateTotalLeads(batchId, insertedCount);

        res.json({
            success: true,
            inserted: insertedCount,
            skipped: skippedCount,
            batch_id: batchId
        });

    } catch (err) {
        console.error("Erreur importLeads:", err);
        res.status(500).json({
            error: "Erreur import",
            details: err.message
        });
    }
};

exports.duplicateLeads = async (req, res) => {
    try {
        const { selections, targetCampagneId } = req.body;

        if (!selections || !Array.isArray(selections) || !targetCampagneId) {
            return res.status(400).json({
                error: "Paramètres manquants"
            });
        }

        // 🔥 campagne cible
        const targetRes = await db.query(
            "SELECT name FROM campagnes WHERE id = $1",
            [targetCampagneId]
        );

        if (targetRes.rows.length === 0) {
            return res.status(404).json({ error: "Campagne cible introuvable" });
        }

        const targetTable = getTableName(targetRes.rows[0].name);

        // 🔥 colonnes cible
        const colsRes = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [targetTable]);

        const targetCols = colsRes.rows.map(c => c.column_name);

        let totalCopied = 0;

        for (const selection of selections) {
            const { sourceCampagneId, leadIds } = selection;

            // 🔥 campagne source
            const sourceRes = await db.query(
                "SELECT name FROM campagnes WHERE id = $1",
                [sourceCampagneId]
            );

            if (sourceRes.rows.length === 0) continue;

            const sourceTable = getTableName(sourceRes.rows[0].name);

            // 🔥 récupérer leads
            const leadsRes = await db.query(
                `SELECT * FROM ${sourceTable} WHERE id = ANY($1)`,
                [leadIds]
            );

            const leadsToCopy = leadsRes.rows;

            for (const lead of leadsToCopy) {

                const copyData = {};

                Object.keys(lead).forEach(key => {
                    if (
                        key !== 'id' &&
                        targetCols.includes(key) &&
                        !['created_at', 'updated_at', 'validation_status'].includes(key)
                    ) {
                        copyData[key] = lead[key];
                    }
                });

                // 🔥 obligatoire
                copyData.campagne_id = targetCampagneId;
                copyData.validation_status = 'pending';

                const keys = Object.keys(copyData);

                if (keys.length > 0) {

                    const columns = keys.join(', ');
                    const values = keys.map((_, i) => `$${i + 1}`);
                    const params = keys.map(k => copyData[k]);

                    await db.query(
                        `INSERT INTO ${targetTable} (${columns}, updated_at)
                         VALUES (${values.join(', ')}, NOW())`,
                        params
                    );

                    totalCopied++;
                }
            }
        }

        res.json({
            success: true,
            message: `${totalCopied} leads dupliqués`
        });

    } catch (err) {
        console.error("Erreur duplicateLeads:", err);
        res.status(500).json({
            error: "Erreur serveur",
            details: err.message
        });
    }
};

// Per-lead duplication using API field mapping pivot (from main SHA 9fb7f05)
exports.duplicateLead = async (req, res) => {
    try {
        const leadId = req.params.id;
        const { sourceCampagneId, targetCampagneId, overrides } = req.body;

        if (!leadId || !sourceCampagneId || !targetCampagneId) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }

        // 🔥 récupérer campagnes
        const campsRes = await db.query(
            "SELECT id, name FROM campagnes WHERE id = ANY($1)",
            [[sourceCampagneId, targetCampagneId]]
        );

        const camps = campsRes.rows;

        const sourceCamp = camps.find(c => c.id == sourceCampagneId);
        const targetCamp = camps.find(c => c.id == targetCampagneId);

        if (!sourceCamp || !targetCamp) {
            return res.status(404).json({ error: "Campagne source ou cible introuvable" });
        }

        const sourceTable = getTableName(sourceCamp.name);
        const targetTable = getTableName(targetCamp.name);

        // 🔥 récupérer lead source
        const leadRes = await db.query(
            `SELECT * FROM ${sourceTable} WHERE id = $1`,
            [leadId]
        );

        if (leadRes.rows.length === 0) {
            return res.status(404).json({ error: "Lead introuvable" });
        }

        const lead = leadRes.rows[0];

        // 🔥 colonnes cible
        const colsRes = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [targetTable]);

        const targetCols = colsRes.rows.map(c => c.column_name);

        // 🔥 construire data
        const copyData = {};

        Object.keys(lead).forEach(key => {
            if (
                key !== 'id' &&
                targetCols.includes(key) &&
                !['created_at', 'updated_at', 'validation_status'].includes(key)
            ) {
                copyData[key] = lead[key];
            }
        });

        // 🔥 overrides (important 🔥)
        if (overrides && typeof overrides === 'object') {
            Object.assign(copyData, overrides);
        }

        // 🔥 champs obligatoires
        copyData.campagne_id = targetCampagneId;
        copyData.validation_status = 'pending';

        const keys = Object.keys(copyData);

        if (keys.length === 0) {
            return res.status(400).json({ error: "Aucune donnée à copier" });
        }

        const columns = keys.join(', ');
        const values = keys.map((_, i) => `$${i + 1}`);
        const params = keys.map(k => copyData[k]);

        const insertRes = await db.query(
            `INSERT INTO ${targetTable} (${columns}, updated_at)
             VALUES (${values.join(', ')}, NOW())
             RETURNING id`,
            params
        );

        res.json({
            success: true,
            message: `Lead dupliqué avec succès`,
            newLeadId: insertRes.rows[0].id
        });

    } catch (err) {
        console.error("Erreur duplicateLead:", err);
        res.status(500).json({
            error: "Erreur serveur",
            details: err.message
        });
    }
};

exports.validateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const { campagne_id, status } = req.body;

        if (!campagne_id || !status) {
            return res.status(400).json({
                error: "campagne_id et status requis"
            });
        }

        if (!['validated', 'rejected'].includes(status)) {
            return res.status(400).json({
                error: "status invalide"
            });
        }

        // 🔥 récupérer campagne
        const campResult = await db.query(
            "SELECT name FROM campagnes WHERE id = $1",
            [campagne_id]
        );

        if (campResult.rows.length === 0) {
            return res.status(404).json({
                error: "Campagne introuvable"
            });
        }

        const tableName = getTableName(campResult.rows[0].name);

        // 🔥 update status
        await db.query(
            `UPDATE ${tableName}
             SET validation_status = $1, updated_at = NOW()
             WHERE id = $2`,
            [status, id]
        );

        res.json({
            success: true,
            message: `Lead ${status}`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur serveur",
            details: err.message
        });
    }
};



// ─── Import Batch endpoints ─────────────────────────────────────────────────



exports.getImportBatches = async (req, res) => {
    try {
        const { campagne_id, date } = req.query;

        let query = `SELECT * FROM import_batches WHERE 1=1`;
        let params = [];
        let index = 1;

        // 🔥 filtre campagne
        if (campagne_id) {
            query += ` AND campagne_id = $${index}`;
            params.push(campagne_id);
            index++;
        }

        // 🔥 filtre date (optionnel)
        if (date) {
            query += ` AND DATE(created_at) = $${index}`;
            params.push(date);
            index++;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error("Erreur getImportBatches:", err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

exports.getBatchLeads = async (req, res) => {
    try {
        const { id: batchId } = req.params;
        const { campagne_id, page = 1, limit = 25, search = '', status = '' } = req.query;

        if (!campagne_id) {
            return res.status(400).json({ error: "campagne_id requis" });
        }

        const offset = (page - 1) * limit;

        // 🔥 récupérer campagne
        const campResult = await db.query(
            "SELECT name FROM campagnes WHERE id = $1",
            [campagne_id]
        );

        if (campResult.rows.length === 0) {
            return res.status(404).json({ error: "Campagne introuvable" });
        }

        const tableName = getTableName(campResult.rows[0].name);

        // 🔥 base query
        let query = `SELECT * FROM ${tableName} WHERE batch_id = $1`;
        let countQuery = `SELECT COUNT(*) FROM ${tableName} WHERE batch_id = $1`;

        let params = [batchId];
        let index = 2;

        // 🔍 search
        if (search) {
            query += ` AND (
                email ILIKE $${index} OR 
                firstname ILIKE $${index} OR 
                lastname ILIKE $${index}
            )`;
            countQuery += ` AND (
                email ILIKE $${index} OR 
                firstname ILIKE $${index} OR 
                lastname ILIKE $${index}
            )`;

            params.push(`%${search}%`);
            index++;
        }

        // 🔥 status
        if (status) {
            query += ` AND validation_status = $${index}`;
            countQuery += ` AND validation_status = $${index}`;

            params.push(status);
            index++;
        }

        // 🔥 pagination
        query += ` ORDER BY created_at DESC LIMIT $${index} OFFSET $${index + 1}`;
        params.push(limit, offset);

        const dataResult = await db.query(query, params);

        const countResult = await db.query(
            countQuery,
            params.slice(0, index - 1)
        );

        res.json({
            success: true,
            data: dataResult.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (err) {
        console.error("Erreur getBatchLeads:", err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};


exports.deleteBatches = async (req, res) => {
    try {
        const { batch_ids } = req.body;

        if (!batch_ids || !Array.isArray(batch_ids) || batch_ids.length === 0) {
            return res.status(400).json({ error: "Aucun lot sélectionné" });
        }

        // 🔥 récupérer les batches + campagnes
        const batchesResult = await db.query(
            `SELECT b.id, b.campagne_id, c.name AS campagne_name
             FROM import_batches b
             JOIN campagnes c ON b.campagne_id = c.id
             WHERE b.id = ANY($1)`,
            [batch_ids]
        );

        const batchesRows = batchesResult.rows;

        let totalLeadsDeleted = 0;

        // 🔥 supprimer les leads dans tables dynamiques
        for (const batch of batchesRows) {
            const tableName = getTableName(batch.campagne_name);

            try {
                const delResult = await db.query(
                    `DELETE FROM ${tableName} WHERE batch_id = $1`,
                    [batch.id]
                );

                totalLeadsDeleted += delResult.rowCount || 0;

            } catch (err) {
                console.warn(
                    `[deleteBatches] erreur table ${tableName}:`,
                    err.message
                );
            }
        }

        // 🔥 supprimer les batches
        const batchDelResult = await db.query(
            `DELETE FROM import_batches WHERE id = ANY($1)`,
            [batch_ids]
        );

        res.json({
            success: true,
            message: "Lots supprimés avec succès",
            batches_deleted: batchDelResult.rowCount || 0,
            leads_deleted: totalLeadsDeleted
        });

    } catch (err) {
        console.error("[deleteBatches] Error:", err);
        res.status(500).json({
            error: "Erreur suppression",
            details: err.message
        });
    }
};


exports.bulkUpdateStatus = async (req, res) => {
    try {
        const { ids, status } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Aucun lead sélectionné" });
        }

        if (!status) {
            return res.status(400).json({ error: "Status requis" });
        }

        // 🔥 récupérer les leads avec leur campagne
        const leads = await exports.getAllLeadsInternal(ids);

        // 🔥 grouper par campagne
        const grouped = {};

        leads.forEach(l => {
            if (!grouped[l.campagne_id]) {
                grouped[l.campagne_id] = {
                    name: l.campagne_name,
                    ids: []
                };
            }
            grouped[l.campagne_id].ids.push(l.id);
        });

        let totalUpdated = 0;

        // 🔥 update par table
        for (const campId in grouped) {
            const { name, ids } = grouped[campId];
            const tableName = getTableName(name);

            const result = await db.query(
                `UPDATE ${tableName}
                 SET validation_status = $1, updated_at = NOW()
                 WHERE id = ANY($2)`,
                [status, ids]
            );

            totalUpdated += result.rowCount;
        }

        res.json({
            success: true,
            message: `${totalUpdated} leads mis à jour`
        });

    } catch (err) {
        console.error("Erreur bulkUpdateStatus:", err);
        res.status(500).json({
            error: "Erreur serveur",
            details: err.message
        });
    }
};

exports.getAllLeadsInternal = async (ids) => {
    try {

        const campagnesRes = await db.query("SELECT id, name FROM campagnes");
        const campagnes = campagnesRes.rows;

        let results = [];

        for (const camp of campagnes) {
            const tableName = getTableName(camp.name);

            try {
                const res = await db.query(
                    `SELECT id, ${camp.id} as campagne_id, '${camp.name}' as campagne_name
                     FROM ${tableName}
                     WHERE id = ANY($1)`,
                    [ids]
                );

                results = [...results, ...res.rows];

            } catch (err) {
                // ignore table errors
            }
        }

        return results;

    } catch (err) {
        console.error(err);
        return [];
    }
};

