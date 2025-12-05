import fs from 'fs';
import path from 'path';

import dayjs from 'dayjs';
import exceljs from 'exceljs';

import templateData from '@libs/template_data.json';

interface CellInfo 
{
    address: string;
    value: string | undefined;
}

interface ErrorStat
{
    prob: boolean,
    message: string
}

interface CellData
{
    bindKeyName: string;
    displayName: string;
    value: string|number|boolean|null;
}

interface ExcelContent
{
    rowIndex: number;
    error: ErrorStat;
    content: Record<string, CellData>;
    esignSigner: Record<string, CellData>;
}

const user_to_bind_key_map = 
[
    {
        "displayName": "대리점 상호",
        "bindKeyName": "name1",
        "required": false
    },
    {
        "displayName": "사업자번호",
        "bindKeyName": "rrn1",
        "required": false
    },
    {
        "displayName": "사무실 주소",
        "bindKeyName": "addr1_2"
    },
    {
        "displayName": "대표자",
        "bindKeyName": "ceo1"
    },
    {
        "displayName": "연락처",
        "bindKeyName": "phone1"
    },
    {
        "displayName": "이메일",
        "bindKeyName": "email1"
    },
    {
        "displayName": "창고주소",
        "bindKeyName": "addr2_2"
    },
    {
        "displayName": "계약 체결일",
        "bindKeyName": "clm_con_date"
    },
    {
        "displayName": "결제조건",
        "bindKeyName": "payterm"
    },
    {
        "displayName": "매출 장려금 제품",
        "bindKeyName": "obj"
    },
    {
        "displayName": "운임 및 운임보조비",
        "bindKeyName": "kgpay1"
    },
    {
        "displayName": "월중한도",
        "bindKeyName": "limit1"
    },
    {
        "displayName": "월말한도",
        "bindKeyName": "limit2"
    }
];

const HP_EXCEL_TO_WRITING_BULK_META_INFO = async (excel: Buffer) => 
{
    let workbook;

    try 
    {
        try 
        {
            workbook = new exceljs.Workbook();

            const arrayBuffer = excel.buffer.slice(excel.byteOffset, excel.byteOffset + excel.byteLength) as ArrayBuffer;
            await workbook.xlsx.load(arrayBuffer);
        } 
        catch 
        {
            throw new Error("");
        }

        let headers: CellInfo[] = [];
        const values: CellInfo[][] = [];
        for (const worksheet of workbook.worksheets) 
        {
            if (worksheet.name !== 'data') continue;

            worksheet.eachRow((row, rowNumber) =>
            {
                const cells: CellInfo[] = getCells(row);
                if (!cells.some((x: CellInfo) => x.value)) return;

                if (rowNumber === 1) headers = cells;
                else values.push(cells);
            });
        }

        if (values.length > 501)
            throw new Error("500개 넘음");

        const userToBindKeyMap = user_to_bind_key_map;
        const fixedInputData: Record<string, string|number|boolean|null> = { "1": 1 };

        const excelContent: {contents: ExcelContent[], total: number} = 
        {
            contents: [],
            total: values.length
        };

        let rowIndex = 0;
        for (const row of values) 
        {
            rowIndex++;

            const error: ErrorStat = { prob: false, message: '' };
            const esign: Record<string, CellData> = {};
            const rowObject: Record<string, CellData> = {};
            
            for (const { displayName, bindKeyName, required } of [
                ...userToBindKeyMap,
                ...CF_WRITING_BULK_DOCUMENT_ESIGN_EXCEL_HEADERS
            ]) 
            {
                if (!displayName || !bindKeyName) continue;

                const address = headers.find((header: CellInfo) => header.value === displayName)?.address;
                if (!address) continue;

                const value = row.find((cell: CellInfo) => cell.address === address)?.value;

                const cellData = 
                {
                    displayName,
                    bindKeyName,
                    value: HP_DOCUMENT_TEMPLATE_CAST_VALUE_BY_TYPE(
                        {
                            error,
                            template_data: templateData,
                            displayName,
                            bindKeyName,
                            value,
                            rowIndex,
                            addCheckBindData: (bindKey: string) => 
                            {
                                if (!bindKey) return;
                                fixedInputData[`${bindKey}_checked`] = true;
                            }
                        }
                    )
                };

                if (required && !cellData.value)
                    throw new Error("형식 아님");

                if (bindKeyName.includes('esignSigners')) 
                {
                    HP_EXCEL_VALIDATE_ESIGN_DATA({
                        error,
                        rowIndex,
                        bindKeyName,
                        displayName,
                        value
                    });

                    esign[bindKeyName] = cellData;
                }
                else rowObject[bindKeyName] = cellData;
            }

            const result = {
                rowIndex,
                error,
                content: rowObject,
                esignSigner: esign
            };

            excelContent.contents.push(result);
        }

        return excelContent;
    }
    catch (err) 
    {
        throw err;
    }
};

const CF_WRITING_BULK_DOCUMENT_ESIGN_EXCEL_HEADERS = [
    {
        displayName: '서명 참여자 이름(필수)',
        bindKeyName: 'esignSignersName',
        required: true,
        type: 'string'
    },
    {
        displayName: '이메일 주소(필수)',
        bindKeyName: 'esignSignersEmail',
        required: true,
        type: 'email'
    },
    {
        displayName: '휴대폰 번호(필수)',
        bindKeyName: 'esignSignersMobileNumber',
        required: true,
        type: 'phone'
    },
    {
        displayName: '암호(필수)',
        bindKeyName: 'esignSignersPassword',
        required: true,
        type: 'string'
    },
    {
        displayName: '참여기한(선택)\n설정하지 않을 경우 10일 이내',
        bindKeyName: 'esignSignersDeadlineAt',
        required: false,
        type: 'number'
    },
    {
        displayName: '코멘트(선택)',
        bindKeyName: 'esignSignersComment',
        required: false,
        type: 'string'
    }
];

const HP_EXCEL_VALIDATE_ESIGN_DATA = (
    { 
        error, 
        rowIndex, 
        bindKeyName, 
        displayName, 
        value 
    }: 
    {
        error: ErrorStat; 
        rowIndex: number; 
        bindKeyName: string; 
        displayName: string; 
        value?: string;
    }) => 
{
    const esignField = CF_WRITING_BULK_DOCUMENT_ESIGN_EXCEL_HEADERS.find(
        (o) => o.bindKeyName === bindKeyName
    );

    try 
    {
        if (!esignField) throw '해당 항목 행 제목이 수정됨';
        else if (esignField.required && !value) throw '필수 항목의 데이터 없음';

        if (value && esignField.type && !validateExcelValue(esignField.type, value))
            throw '항목의 형식이 맞지 않음';
    } 
    catch (e)
    {
        error.prob = true;

        if (e) error.message = `${e} (${rowIndex}행, ${displayName})`;
        else error.message = `필수항목 데이터 없음 (${rowIndex}행, ${displayName})`;
    }
};

const HP_DOCUMENT_TEMPLATE_CAST_VALUE_BY_TYPE = ({
    error,
    template_data,
    displayName,
    bindKeyName,
    value,
    rowIndex,
    addCheckBindData
}: {
    error: ErrorStat;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    template_data: Record<string, any>;
    displayName: string;
    bindKeyName: string;
    value?: string;
    rowIndex: number;
    addCheckBindData: (bindKey: string) => void;
}) => 
{
    if (!bindKeyName)
        throw new Error(`엑셀 값이 잘못됐습니다 (${rowIndex}행, ${displayName})`);

    if (!value) return null;

    let retVal: string|number|boolean|null = value;

    const data = template_data.inputSections ?? [];
    let type = '';
    for (const x of data) 
    {
        for (const y of x.fields) 
        {
            for (const z of y.objdataFields) 
            {
                if (z.type === 'select' && z.selectBinding === bindKeyName) 
                {
                    type = 'select';
                    break;
                } 
                else if (z.type === 'text') 
                {
                    if (!z.textFields || z.textFields.length === 0) break;
                    for (const a of z.textFields)
                        if (a.binding === bindKeyName) 
                        {
                            if (typeof a.binding === 'string' && a.binding.includes('phone'))
                                type = 'phone';
                            if (a.currency) type = 'number';
                            else type = 'text';
                            break;
                        }
                }
                else if (z.type === 'calendar' && z.calendar_Binding === bindKeyName) 
                {
                    type = 'calendar';
                    break;
                }
                else if (z.type === 'checkbox') 
                {
                    if (!z.checkboxFields || z.checkboxFields.length === 0) break;
                    for (const a of z.checkboxFields)
                        if (a.binding === bindKeyName) 
                        {
                            type = 'checkbox';
                            break;
                        }
                }
                else if (z.type === 'radio' && z.radioBinding === bindKeyName) 
                {
                    type = 'radio';
                    break;
                }
                else if (z.type === 'address' && z.addressBinding === bindKeyName) 
                {
                    type = 'address';
                    break;
                }

                if (type !== '') break;
            }
            if (type !== '') break;
        }
        if (type !== '') break;
    }

    if (type === 'phone' || bindKeyName === 'esignSignersMobileNumber') 
    {
        retVal = retVal.replace(/-/g, '').replace(/\s/g, '');
        if (`${retVal}`[0] !== '0') retVal = `0${retVal}`;
    }
    else if (type === 'calendar') 
    {
        const dateValue = value ? dayjs(value).format('YYYY-MM-DD') : null;
        if (dateValue === 'Invalid Date') 
        {
            error.prob = true;
            error.message = `날짜 값이 아님 (${rowIndex}행, ${displayName})`;
        }
        else 
        {
            retVal = dateValue;
        }
    }
    else if (type === 'checkbox') addCheckBindData(bindKeyName);
    else if (bindKeyName?.includes('_checked')) 
    {
        if (value === 'true') retVal = true;
        else if (value === 'false') retVal = false;
        else retVal = null;
    }
    else if (type === 'number') 
    {
        if (typeof value === 'string' && isNaN(Number(value.replace(/,/g, '')))) 
        {
            error.prob = true;
            error.message = `숫자가 아님 (${rowIndex}행, ${displayName})`;
        }
        else if (typeof value !== 'string' && isNaN(Number(value))) 
        {
            error.prob = true;
            error.message = `숫자가 아님 (${rowIndex}행, ${displayName})`;
        }
        else 
        {
            if (typeof value === 'string') retVal = Number(value.replace(/,/g, '')).toLocaleString();
            else retVal = Number(value).toLocaleString();
        }
    }

    return retVal;
};

const getCells = (row: exceljs.Row) => 
{
    const cells = [];
    for (let i = 1; i <= row.cellCount; i++)
    {
        const cell = row.getCell(i);

        cells.push({
            address: cell.address,
            value: getCellValue(cell)
        });
    }

    return cells;
};

const getCellValue = (cell: exceljs.Cell) =>
{
    let val = cell?.value;

    if (typeof val === 'string') val = val.normalize();
    else if (typeof val === 'number') val = `${val}`;
    else if (
        val && typeof val === 'object' && 
        (val as exceljs.CellFormulaValue | exceljs.CellSharedFormulaValue)?.result
    ) 
        val = (val as exceljs.CellFormulaValue | exceljs.CellSharedFormulaValue).result?.toString();
    else if (val && typeof val === 'object' && val instanceof Date) val = dayjs(val).format('YYYY-MM-DD');
    else if (
        val && typeof val === 'object' && 
        val.hasOwnProperty('richText')
    ) 
        val = (val as exceljs.CellRichTextValue).richText.map((z: exceljs.RichText) => z.text).join('');
    else if (
        val && typeof val === 'object' && 
        (val as exceljs.CellHyperlinkValue)?.text
    ) 
        val = (val as exceljs.CellHyperlinkValue).text.toString();
    else if (
        val && typeof val === 'object' 
        && (val as exceljs.CellErrorValue)?.error
    ) 
        val = (val as exceljs.CellErrorValue).error.toString();
    else val = '';

    return val;
};


const validateExcelValue = (type: string, value: string) => 
{
    if (type === 'email')
        return value.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    else if (type === 'phone') return value.match(/^(0)?1[016789][- ]?\d{3,4}[- ]?\d{4}$/);
    else if (type === 'number') return !isNaN(Number(value));

    return true;
};

export default async () => 
{
    const e = fs.readFileSync(path.resolve('files', 'tt.xlsx'));
    return await HP_EXCEL_TO_WRITING_BULK_META_INFO(e);
};