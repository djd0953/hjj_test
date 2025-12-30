export interface CellInfo 
{
    address: string;
    value: string | undefined;
}

export interface ErrorStat
{
    prob: boolean,
    message: string
}

export interface CellData
{
    bindKeyName: string;
    displayName: string;
    value: string|number|boolean|null;
}

export interface ExcelContent
{
    rowIndex: number;
    error: ErrorStat;
    content: Record<string, CellData>;
    esignSigner: Record<string, CellData>;
}