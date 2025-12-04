import { QueryTypes, Transaction } from 'sequelize';
import { Json } from 'sequelize/types/utils';
import { type Request, type Response } from 'express';

import db2 from '@migrateDb';
import db from '@db';

/**
 * migration list
 * 1. banners
 * 2. category_1
 * 3. documents
 * 4. document_info
 * 5. document_template
 * 6. category
 * 7. category_sub
 * 8. category_depth
 */


interface list {
    id: number
    idx: number
    iddocuments: number
    expire_at?: Date | string | null 

    keywords?: Json,
    category?: Json,
    [key: string]: any
}

const tableName = 'category_depth';

const tablePK = 
{
    banners: 'id',
    category_1: 'idx',
    documents: 'id',
    documents_info: 'iddocuments',
    document_template: 'id',
    category: 'idx',
    category_sub: 'idx',
    category_depth: 'idx'
};

const insertQueries = 
{
    banners: `INSERT INTO banners (id, sort_id, dev_id, dev_message, group_id, target_id, name, image_url, content, redirect_url, use_popup, is_used, bg_color, expire_at, check_expire_at, color_1, color_2, color_3, color_4, color_5, edit_user_id, updated_at, created_at, is_del) VALUES (:id, :sort_id, :dev_id, :dev_message, :group_id, :target_id, :name, :image_url, :content, :redirect_url, :use_popup, :is_used, :bg_color, :expire_at, :check_expire_at, :color_1, :color_2, :color_3, :color_4, :color_5, :edit_user_id, :updated_at, :created_at, :is_del)`,
    category_1: `INSERT INTO category_1 (idx, idcategory_1, name, definition, description, description_1) VALUES(:idx, :idcategory_1, :name, :definition, :description, :description_1);`,
    documents: `INSERT INTO documents (id, dev_id, team_id, code, idcategory_1, title, subtitle, h2, desc1, desc2, price, dc_price, dc_rate, extra_dc_price, description, registerdate, modifieddate, priority, minimum_input_field, signer_number, service, status, category_sub, contract, is_del, updated_at, created_at, manuscript_id, ai_description, ai_is_used, is_docx_download_allowed, ai_output_type, template_json, template_category) VALUES (:id, :dev_id, :team_id, :code, :idcategory_1, :title, :subtitle, :h2, :desc1, :desc2, :price, :dc_price, :dc_rate, :extra_dc_price, :description, :registerdate, :modifieddate, :priority, :minimum_input_field, :signer_number, :service, :status, :category_sub, :contract, :is_del, :updated_at, :created_at, :manuscript_id, :ai_description, :ai_is_used, :is_docx_download_allowed, :ai_output_type, :template_json, :template_category);`,
    documents_info: 'INSERT INTO documents_info (iddocuments, `update`, description, keywords, search_keywords, title, title1, category, sample_data, guide_link, docs_info, lawyer_service, sign_service, use_pdf_sample, is_premium, privates) VALUES (:iddocuments, :update, :description, :keywords, :search_keywords, :title, :title1, :category, :sample_data, :guide_link, :docs_info, :lawyer_service, :sign_service, :use_pdf_sample, :is_premium, :privates);',
    document_template: 'INSERT INTO document_template (id, document_id, template_id, template_data, template_category, css_template_type, ai_questions, modifieddate, updated_at, created_at, is_del) VALUES (:id, :document_id, :template_id, :template_data, :template_category, :css_template_type, :ai_questions, :modifieddate, :updated_at, :created_at, :is_del)',
    category: 'INSERT INTO category (idx, name, `type`) VALUES (:idx, :name, :type);',
    category_sub: 'INSERT INTO category_sub (idx, category, name, `desc`, status, sort) VALUES (:idx, :category, :name, :desc, :status, :sort);',
    category_depth: 'INSERT INTO category_depth (idx, category_sub, name, status, sort, `level`) VALUES (:idx, :category_sub, :name, :status, :sort, :level);'
};

const defaultValues = 
{
    banners: {},
    category_1: {
        description: null
    },
    documents:
    {
        category_sub: [],
        description: [],
        template_json: null
    },
    documents_info:
    {
        keywords: [],
        category: null,
        sample_data: null,
        docs_info: null
    },
    document_template:
    {
        template_data: null,
        ai_questions: null
    },
    category: {},
    category_sub: {},
    category_depth: {}
};

const setDefaultValue = (row: Record<string, any>) =>
{
    const safeValues = { ...row };
    const defaultValue = defaultValues[tableName];

    for (const key in defaultValue)
    {
        const val = safeValues?.[key];

        if (!val && !defaultValue[key as keyof typeof defaultValue])
            safeValues[key] = defaultValue[key as keyof typeof defaultValue];
        else if (!val || val === 'null' || val === '')
            safeValues[key] = JSON.stringify(defaultValue[key as keyof typeof defaultValue]);
        else if (typeof val === 'object')
            safeValues[key] = JSON.stringify(safeValues[key]);
        else if ((typeof val === 'number' || typeof val === 'string') && Array.isArray(defaultValue[key as keyof typeof defaultValue]))
            safeValues[key] = JSON.stringify([val]);

    }

    return safeValues;
};

export default async () => 
{
    console.groupCollapsed('Migration');
    let transaction: Transaction|null = null;
    let transaction2: Transaction|null = null;
    
    try 
    {
        const query = insertQueries[tableName];

        let lastId = 0;
        const limit = 100;
        const pk = tablePK[tableName];
        if (!pk) throw 'none pk';
        
        for (;;)
        {
            transaction = await db.transaction();
            transaction2 = await db2.transaction();

            const rows = await db.query<list>(`SELECT * FROM ${tableName} where ${pk} > :lastId ORDER BY ${pk} ASC LIMIT :limit`, {
                transaction,
                type: QueryTypes.SELECT,
                replacements: { lastId, limit }
            });

            if (rows.length < 1) break;
    

            for (const row of rows)
            {
                const safeValues = setDefaultValue(row);
                lastId = row[pk];

                await db2.query(query, 
                    {
                        transaction: transaction2, 
                        type: QueryTypes.INSERT, 
                        replacements: safeValues
                    }
                ).catch(e => 
                {
                    console.log(e);
                    logInsertErrorPretty(e, row);
                    throw e;
                }
                );
            }

            await transaction.commit();
            await transaction2.commit();
        }

    }
    catch (e)
    {
        console.log(e);
        if (transaction)
            await transaction.rollback();
        if (transaction2)
            await transaction2.rollback();
    }

    console.groupEnd();
    console.log(1);
};

// 1) 'target ... fails ( ... )' 헤드라인만 추출
function extractVitessHeadline(msg: string): string | null 
{
    if (!msg) return null;
    // 'target: ... fails ( ... ) (errno ...' 구조에서 errno 직전까지 캡처
    const m = msg.match(/(target:[\s\S]*?fails\s*\([\s\S]*?\))\s*\(errno\b/i);
    return m ? m[1] : null;
}

// 2) Vitess/MySQL FK 메시지에서 세부정보 파싱
function parseFkFail(msg: string) 
{
    if (!msg) return null;

    // target DB/테이블:  ... fails (`lfdev`.`documents`, CONSTRAINT ...
    const mTable = msg.match(/fails\s*\(\s*`([^`]+)`\.`([^`]+)`/i);
    // CONSTRAINT `FK_xxx`
    const mConstraint = msg.match(/CONSTRAINT\s+`([^`]+)`/i);
    // FOREIGN KEY (`child_col`)
    const mChild = msg.match(/FOREIGN KEY\s*\(`([^`]+)`\)/i);
    // REFERENCES `parent_table` (`parent_col`)
    const mRef = msg.match(/REFERENCES\s+`([^`]+)`\s*\(`([^`]+)`\)/i);

    return {
        db: mTable?.[1] ?? null,
        childTable: mTable?.[2] ?? null,
        constraint: mConstraint?.[1] ?? null,
        childColumn: mChild?.[1] ?? null,
        parentTable: mRef?.[1] ?? null,
        parentColumn: mRef?.[2] ?? null
    };
}


function logInsertErrorPretty(err: any, replacements: Record<string, any>) 
{
    const sqlMessage: string | undefined =
    err?.sqlMessage || err?.parent?.sqlMessage || err?.message;

    const headline = sqlMessage ? extractVitessHeadline(sqlMessage) : null;
    const fk = sqlMessage ? parseFkFail(sqlMessage) : null;

    // 값 포매터(그대로 사용해도 됨)
    const formatVal = (v: any) => 
    {
        if (v === null) return 'NULL';
        if (v === undefined) return 'undefined';
        if (Buffer.isBuffer(v)) return `<Buffer ${v.length} bytes>`;
        if (typeof v === 'string') 
        {
            const s = v.length > 300 ? v.slice(0, 300) + '…(truncated)' : v;
            try { return JSON.stringify(JSON.parse(s)); }
            catch { return s; }
        }
        if (typeof v === 'object') 
        {
            try { return JSON.stringify(v); }
            catch { return String(v); }
        }
        return String(v);
    };

    const lines = Object.entries(replacements || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `  ${k}: ${formatVal(v)}`);

    console.error('='.repeat(80));
    if (headline) 
    {
    // ✅ 원하는 출력: 'error: target ... fails (...)'
        console.error(`- error: '${headline}'`);
    }
    else if (sqlMessage) 
    {
        console.error(`- error: ${sqlMessage}`);
    }
    else 
    {
        console.error(`- error: ${String(err)}`);
    }

    // FK 디테일과 문제 값도 함께
    if (fk) 
    {
        const badVal =
      fk.childColumn && replacements
          ? replacements[fk.childColumn]
          : undefined;

        console.error(`- details: db=${fk.db ?? '-'}, table=${fk.childTable ?? '-'}, constraint=${fk.constraint ?? '-'}`);
        console.error(`           child_column=${fk.childColumn ?? '-'}  parent=${fk.parentTable ?? '-'}(${fk.parentColumn ?? '-'})`);
        if (fk.childColumn) 
        {
            console.error(`- offending value (${fk.childColumn}): ${formatVal(badVal)}`);
        }
    }

    // errno/code/sqlState 등 원하면 그대로
    if (err?.errno || err?.code || err?.sqlState) 
    {
        console.error(`- errno: ${err.errno ?? '-'}, code: ${err.code ?? '-'}, sqlState: ${err.sqlState ?? '-'}`);
    }

    console.error('- values (from replacements):');
    console.error(lines.join('\n'));
    console.error('='.repeat(80));
}
