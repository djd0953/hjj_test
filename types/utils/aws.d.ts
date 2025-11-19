export type S3RetrieveParams = {
    key?: string | null;
    prefix?: string | null;
    bucketIndex?: 0 | 1;
};

export interface S3FileNode {
    type: "file";
    id: number;
    name: string;
    normalize: string;
    fullPath: string;
}

export interface S3DirNode {
    type: "dir";
    name: string;
    children: Array<S3DirNode | S3FileNode>;
}

export type S3PathTypeValues =
    | "writingEditorLog"
    | "cfsFileEditorLog"
    | "esign"
    | "migration"
    | "standardContract"
    | "file"
    | 1
    | 2
    | 3;

interface S3PathParamType1 {
    url: string;
    type?: S3PathTypeValues;
    id?: number | string;
    fileName?: string;
    base?: string;
    isIncludeEnv?: boolean;
}

interface S3PathParamType2 {
    url?: string;
    type?: S3PathTypeValues;
    id?: number | string;
    fileName: string;
    base?: string;
    isIncludeEnv?: boolean;
}

export type S3PathParam = S3PathParamType1 | S3PathParamType2;
