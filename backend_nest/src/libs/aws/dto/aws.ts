export class S3RetrieveParams {
    key?: string | null;
    prefix?: string | null;
    bucketIndex?: 0 | 1;
}

export class S3FileNode {
    type: 'file';
    id: number;
    name: string;
    normalize: string;
    fullPath: string;
}

export class S3DirNode {
    type: 'dir';
    name: string;
    children: Array<S3DirNode | S3FileNode>;
}
export class S3PathParamType1 {
    url: string;
    dirArr?: string[];
    id?: number | string;
    fileName?: string;
    base?: string;
    isIncludeEnvPath?: boolean;
}

export class S3PathParamType2 {
    url?: string;
    dirArr?: string[];
    id?: number | string;
    fileName: string;
    base?: string;
    isIncludeEnvPath?: boolean;
}

export type S3PathParam = S3PathParamType1 | S3PathParamType2;
