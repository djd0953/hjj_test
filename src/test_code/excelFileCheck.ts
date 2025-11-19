import fs from 'fs';
import path from 'path';
import exceljs from 'exceljs';
import dayjs from 'dayjs';

type TreeNode = DirNode | FileNode;

interface DirNode {
    type: 'dir';
    name: string;
    relativePath: string; // contract_list 기준 상대 경로
    p: string;
    children: TreeNode[];
}

interface FileNode {
    type: 'file';
    name: string;
    title: string;
    relativePath: string; // contract_list 기준 상대 경로 (예: "folder1/a.txt")
    p: string;
    ext: string;          // 예: "txt"
}

interface FlatFileInfo {
    path: string; // relativePath
    p: string;
    name: string;
    title: string
    ext: string;
}

const buildTree = async (rootDir: string, currentDir: string = rootDir, baseDir: string = rootDir): Promise<TreeNode[]> =>
{
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    const nodes: TreeNode[] = [];

    for (const entry of entries)
    {
        const name = entry.name;
        if (name === '.DS_Store') continue;

        const absPath = path.join(currentDir, name);
        const relativePath = path
            .relative(baseDir, absPath) // baseDir 기준 상대 경로
            .replace(/\\/g, '/');      // Windows 대비 슬래시 통일

        if (entry.isDirectory()) 
        {
            const children = await buildTree(rootDir, absPath, baseDir);
            const dirNode: DirNode = {
                type: 'dir',
                name,
                relativePath,
                p: relativePath.split('/').length > 1 ? relativePath.split('/').slice(0, -1).join('/') : '',
                children,
            };
            nodes.push(dirNode);
        } 
        else
        {
            const ext = path.extname(name).slice(1); // ".pdf" -> "pdf"
            const fileNode: FileNode = {
                type: 'file',
                name,
                title: name.replace(/\.[^/.]+$/, '').normalize(),
                relativePath,
                p: relativePath.split('/').length > 1 ? relativePath.split('/').slice(0, -1).join('/') : '',
                ext,
            };
            nodes.push(fileNode);
        }
    }

    return nodes;
}

const parseExcel = async (path: string) =>
{
    const workbook = new exceljs.Workbook();

    try
    {
        await workbook.xlsx.readFile(path);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) throw new Error();

        const data: {no: number, path: string | null, title: string, att: string}[] = [];
        worksheet.eachRow((row, rowNumber) =>
        {
            if (rowNumber < 3) return;

            if (Array.isArray(row.values))
            {
                let val: exceljs.CellValue = row.values?.[8];
                let val2: exceljs.CellValue = row.values?.[9];

                if (typeof val === 'string') val = val.normalize()
                else if (typeof val === 'number') val = `${val}`
                else if (val && typeof val === 'object' && (val as exceljs.CellFormulaValue | exceljs.CellSharedFormulaValue)?.result) val = (val as exceljs.CellFormulaValue | exceljs.CellSharedFormulaValue).result?.toString()
                else if (val && typeof val === 'object' && val instanceof Date) val = dayjs(val).format('YYYY-MM-DD');
                else if (val && typeof val === 'object' && val.hasOwnProperty('richText')) val = (val as exceljs.CellRichTextValue).richText.map((z: exceljs.RichText) => z.text).join('')
                else if (val && typeof val === 'object' && (val as exceljs.CellHyperlinkValue)?.text) val = (val as exceljs.CellHyperlinkValue).text.toString();
                else if (val && typeof val === 'object' && (val as exceljs.CellErrorValue)?.error) val = (val as exceljs.CellErrorValue).error.toString();
                else val = ''

                if (typeof val2 === 'string') val2 = val2.normalize()
                else if (typeof val2 === 'number') val2 = `${val2}`
                else if (val2 && typeof val2 === 'object' && (val2 as exceljs.CellFormulaValue | exceljs.CellSharedFormulaValue)?.result) val2 = (val2 as exceljs.CellFormulaValue | exceljs.CellSharedFormulaValue).result?.toString()
                else if (val2 && typeof val2 === 'object' && val2 instanceof Date) val2 = dayjs(val2).format('YYYY-MM-DD');
                else if (val2 && typeof val2 === 'object' && val2.hasOwnProperty('richText')) val2 = (val2 as exceljs.CellRichTextValue).richText.map((z: exceljs.RichText) => z.text).join('')
                else if (val2 && typeof val2 === 'object' && (val2 as exceljs.CellHyperlinkValue)?.text) val2 = (val2 as exceljs.CellHyperlinkValue).text.toString();
                else if (val2 && typeof val2 === 'object' && (val2 as exceljs.CellErrorValue)?.error) val2 = (val2 as exceljs.CellErrorValue).error.toString();
                else val2 = '';

                data.push({no: rowNumber, path: null, title: val || '', att: val2 || ''});
            }
        });

        return data;
    }
    catch (error)
    {
        console.error('Error reading Excel file:', error);
        return [];
    }
}

function flattenFilesFromTree(nodes: TreeNode[]): FlatFileInfo[] 
{
    const result: FlatFileInfo[] = [];

    const walk = (node: TreeNode) => 
    {
        if (node.type === 'file') 
        {
            const file = node as FileNode;
            result.push({
                path: file.relativePath, // 예: "folder1/subfolder/a.docx"
                p: file.p,
                name: file.name,         // 예: "a.docx"
                title: file.name.replace(/\.[^/.]+$/, '').normalize(),
                ext: file.ext,           // 예: "docx"
            });
        }
        else
        {
            for (const child of node.children)
                walk(child);
        }
    };

    for (const n of nodes) {
        walk(n);
    }

    return result;
}

export default async () => 
{
    const root = path.resolve('files', 'contract_list');
    const tree = await buildTree(root);
    const files = flattenFilesFromTree(tree);

    const excelFilePath = tree.find(x => x.name === 'clm_list.xlsx');
    if (excelFilePath)
    {
        const excelData = await parseExcel(path.join(root, excelFilePath.relativePath));
        const lines: string[] = []
        for (const d of excelData)
        {
            const match = files.find(f => f.title.replace(/\s/g, '').toLocaleLowerCase() === d.title.replace(/\s/g, '').toLocaleLowerCase());
            if (match) d.path = match.path.split('/').slice(0, -1).join('/').normalize();

            lines.push(`${d.no}\t${d.path}\t${d.title}\t${d.att}\n`)
        }

        fs.writeFileSync('files/contract_list/contract_list.txt', lines.join(''));
    }

    console.log(1)
}