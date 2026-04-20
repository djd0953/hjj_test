import { S3PathParam, S3PathParamType2 } from "../dto/aws";

export class S3Path {
    private environment =
        (process.env.LF_ENV as 'production' | 'staging' | 'development') ?? 'development';
    private readonly fileExtensionRegexp = /\.[^/.]+$/;
    private path: string[] = [];
    private fileName: string = '';

    constructor({
        url,
        dirArr,
        id,
        fileName,
        base = 'upload',
        isIncludeEnvPath = true
    }: S3PathParam) {
        if (process.env.LF_ENV === 'local') this.environment = 'development';
        if (url) this.setPathWithURL(url);
        else if (fileName) this.setPathWithId({ base, dirArr, isIncludeEnvPath, id, fileName });
    }

    setPathWithURL(url: string) {
        const splitURL = url.split('/');
        this.path = [...splitURL].slice(0, -1);
        this.fileName = splitURL[splitURL.length - 1]?.normalize();
    }

    setPathWithId({ base, dirArr, isIncludeEnvPath, id, fileName }: S3PathParamType2) {
        if (base) this.path.push(base);
        if (dirArr && Array.isArray(dirArr)) dirArr.map((dir) => this.path.push(dir));
        if (isIncludeEnvPath) this.path.push(this.environment);
        if (id) this.path.push(`${id}`);
        if (fileName) this.fileName = fileName.normalize();
    }

    getFileName = (): string => this.fileName;
    getTitle = (): string => this.fileName.replace(this.fileExtensionRegexp, '');
    getExtension = (): string =>
        this.fileName.match(this.fileExtensionRegexp)?.[0]?.toLowerCase() || '';

    setSuffix(suffix: string, separate: string = '_') {
        if (!suffix) return;
        this.fileName = `${this.getTitle()}${separate}${suffix}${this.getExtension()}`;
    }

    setExtension(extension: string) {
        if (!extension) return;
        this.fileName = `${this.getTitle()}.${extension}`;
    }

    get = (): string => [...this.path, this.fileName].join('/');
    getDirectory = (): string => this.path.join('/');
}
