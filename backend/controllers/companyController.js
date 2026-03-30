const Company = require('../models/companyModel');
const CompanyField = require('../models/companyFieldModel');
const db = require('../config/db');

// Helper
const getTableName = (name) => {
    return 'camp_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '');
};

// -------------------
// CREATE COMPANY
// -------------------
exports.createCompany = async (req, res) => {
    try {
        const { name, description, type} = req.body;

       if (!name || !type) {
    return res.status(400).json({
        success: false,
        error: 'Nom et type sont obligatoires'
    });
}

const existing = await db.query(
  `SELECT * FROM campagnes 
   WHERE LOWER(name) = LOWER($1) 
   AND type = $2
   AND is_archived = false`,
  [name, type]
)

if (existing.rows.length > 0) {
  return res.status(400).json({
    success: false,
    error: "Campagne déjà existante avec ce type"
  })
}

        const newCompany = await Company.create({ name, description, type });
        const campagne_id = newCompany.id;

        // 🔥 champs fixes auto
        const fixedFields = [
            { field_label: "Nom", field_key: "lastname", field_type: "text", is_required: true, sort_order: 1 },
            { field_label: "Prénom", field_key: "firstname", field_type: "text", is_required: true, sort_order: 2 },
            { field_label: "Email", field_key: "email", field_type: "email", is_required: true, sort_order: 3 },
        ];

        for (const f of fixedFields) {
            await CompanyField.create(campagne_id, f);
        }

        await exports.syncCompanyTable(
    { params: { id: campagne_id } },
    { json: () => {} }
);

        res.status(201).json({
            success: true,
            message: 'Campagne créée',
            data: { id: campagne_id, name, description, type }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
};

// -------------------
// GET COMPANIES
// -------------------
exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.getAll();

        for (let i = 0; i < companies.length; i++) {
            companies[i].fields = await CompanyField.getByCompanyId(companies[i].id);
        }

        res.json({ success: true, data: companies });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// -------------------
// UPDATE
// -------------------
exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, type } = req.body;

        await db.query(`
            UPDATE campagnes 
            SET name=$1, description=$2, type=$3, updated_at=NOW()
            WHERE id=$4 AND is_archived=false
        `, [name, description, type, id]); 

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// -------------------
// archive
// -------------------

exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        // 🔥 soft delete uniquement
        await Company.delete(id);

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// -------------------
// 🔥 SYNC TABLE (TRÈS IMPORTANT)
// -------------------
/*exports.syncCompanyTable = async (req, res) => 
    try {
        const { id } = req.params;

        const company = await Company.getById(id);
        if (!company) {
            return res.status(404).json({ error: "Campagne introuvable" });
        }

        const tableName = getTableName(company.name);

        // 🔥 CREATE TABLE
        await db.query(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id SERIAL PRIMARY KEY,
                campagne_id INTEGER,
                batch_id INTEGER,
                validation_status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 🔥 CHECK STATUS
       await db.query(`
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_${tableName}_validation_status'
    ) THEN
        ALTER TABLE ${tableName}
        ADD CONSTRAINT check_${tableName}_validation_status
        CHECK (validation_status IN ('pending', 'validated', 'rejected'));
    END IF;
END$$;
`);

        // 🔥 TRIGGER updated_at
        await db.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        `);

        await db.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_trigger WHERE tgname = 'update_${tableName}_updated_at'
            ) THEN
                CREATE TRIGGER update_${tableName}_updated_at
                BEFORE UPDATE ON ${tableName}
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
            END IF;
        END$$;
        `);

        // 🔥 ADD FIELDS
        const fields = await CompanyField.getByCompanyId(id);

        for (const field of fields) {
            const col = field.field_key.replace(/[^a-zA-Z0-9_]/g, '');

            await db.query(`
                ALTER TABLE ${tableName}
                ADD COLUMN IF NOT EXISTS ${col} TEXT
            `);
        }

        res.json({ success: true, table: tableName });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur sync" });
    }
};{*/

exports.syncCompanyTable = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Company.getById(id);
        if (!company) {
            return res.status(404).json({ error: "Campagne introuvable" });
        }

        const tableName = getTableName(company.name);

        // 🔥 CREATE TABLE
        await db.query(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id SERIAL PRIMARY KEY,
                campagne_id INTEGER,
                batch_id INTEGER,
                validation_status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 🔥 CHECK STATUS
        await db.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'check_${tableName}_validation_status'
            ) THEN
                ALTER TABLE ${tableName}
                ADD CONSTRAINT check_${tableName}_validation_status
                CHECK (validation_status IN ('pending', 'validated', 'rejected'));
            END IF;
        END$$;
        `);

        // 🔥 TRIGGER updated_at
        await db.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        `);

        await db.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_trigger WHERE tgname = 'update_${tableName}_updated_at'
            ) THEN
                CREATE TRIGGER update_${tableName}_updated_at
                BEFORE UPDATE ON ${tableName}
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
            END IF;
        END$$;
        `);

        // 🔥 GET ALL FIELDS
        const result = await db.query(`
            SELECT field_key, field_type, is_active 
            FROM campagne_fields 
            WHERE campagne_id = $1
        `, [id]);

        const allFields = result.rows;

        // 🔥 COLONNES EXISTANTES
        const colsRes = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1 AND table_schema = 'public'
        `, [tableName]);

        const dbColumns = colsRes.rows.map(c => c.column_name);

        // 🔥 COLONNES SYSTÈME
        const safeColumns = [
            "id",
            "campagne_id",
            "batch_id",
            "validation_status",
            "created_at",
            "updated_at"
        ];

        // =====================================
        // 🔥 ADD
        // =====================================
        for (const field of allFields) {
            if (field.is_active !== false) {
                const col = field.field_key.replace(/[^a-zA-Z0-9_]/g, '');

                if (!dbColumns.includes(col)) {
                    await db.query(`
                        ALTER TABLE ${tableName}
                        ADD COLUMN ${col} TEXT
                    `);
                }
            }
        }

        // 🔥🔥 FIX ICI (RELOAD COLONNES)
        const colsResUpdated = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1 AND table_schema = 'public'
        `, [tableName]);

        const updatedColumns = colsResUpdated.rows.map(c => c.column_name);

        // =====================================
        // 🔥 DROP
        // =====================================
        for (const field of allFields) {
            if (field.is_active === false) {
                const col = field.field_key.replace(/[^a-zA-Z0-9_]/g, '');

                if (updatedColumns.includes(col) && !safeColumns.includes(col)) {
                    await db.query(`
                        ALTER TABLE ${tableName}
                        DROP COLUMN IF EXISTS ${col}
                    `);
                }
            }
        }

        res.json({ success: true, table: tableName });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur sync" });
    }
};

// -------------------
// ADD FIELD
// -------------------
exports.addField = async (req, res) => {
    try {
        const { id } = req.params;
        const field = req.body;
    
        // 🔥 vérifier doublon dans la même campagne
        const existing = await CompanyField.getByCompanyId(id);
        console.log("FIELD:", field)
console.log("EXISTING:", existing.map(f => f.field_key))
        const normalizedKey = field.field_key.trim().toLowerCase()

if (existing.some(f => f.field_key.trim().toLowerCase() === normalizedKey)) {
    return res.status(400).json({ error: "field_key déjà utilisé" });
}

        const insertInfo = await CompanyField.create(id, field);
                await exports.syncCompanyTable(
            { params: { id } },
            { json: () => {} }
        );

        res.json({ success: true, data: insertInfo });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// -------------------
// UPDATE FIELD
// -------------------
exports.updateField = async (req, res) => {
    try {
        const { fieldId } = req.params;
        const field = req.body;

        // 🔥 récupérer la campagne du champ
        const result = await db.query(
            "SELECT campagne_id FROM campagne_fields WHERE id = $1",
            [fieldId]
        );

        const campagne_id = result.rows[0].campagne_id;

        // 🔥 récupérer champs de cette campagne
        const existing = await CompanyField.getByCompanyId(campagne_id);

        // 🔥 vérifier doublon (sauf lui-même)
        if (existing.some(f => f.field_key === field.field_key && f.id !== fieldId)) {
            return res.status(400).json({ error: "field_key déjà utilisé" });
        }

        await CompanyField.update(fieldId, field);

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// -------------------
// DELETE FIELD
// -------------------
exports.deleteField = async (req, res) => {
    try {
        const { fieldId } = req.params;

        await db.query(
  "UPDATE campagne_fields SET is_active = false WHERE id = $1",
  [fieldId]
)

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Company.getById(id);

        if (!company) {
            return res.status(404).json({ error: "Campagne introuvable" });
        }

        const fields = await CompanyField.getByCompanyId(id);

        res.json({
            success: true,
            data: {
                ...company,
                fields
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};