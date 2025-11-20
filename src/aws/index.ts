import type { S3DirNode, S3FileNode, S3PathParam, S3PathTypeValues, S3RetrieveParams } from '@types';
import { DeleteObjectCommand, GetObjectCommand, GetObjectCommandInput, GetObjectRequest, ListObjectsV2Command, ListObjectsV2CommandInput, S3Client } from '@aws-sdk/client-s3';
import { SendRawEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { extensionReg } from '@util';

const BUCKET_NAME = [process.env.BUCKET_NAME1 as string, process.env.BUCKET_NAME2 as string];
const responseStatus = ({ status, msg, body }: {status: number, msg?: string, body?: any}) => ({ status, message: msg, body });
const environment = "stagging";

export class S3Path 
{
    _path: string[] = [];
    _fileName: string = '';

    constructor({ url, type, id, fileName, base = 'uploadV2', isIncludeEnv = true }: S3PathParam)
    {
        if (base) this._path = base.split('/');

        if (url) 
        {
            const split = url.split('/');
            this._path = [...split].slice(0, -1);

            this._fileName = split[split.length - 1]?.normalize();
        }
        else
        {
            if (type) this._path.push(this.setType(type));
            if (isIncludeEnv) this._path.push(environment);
            if (id) this._path.push(`${id}`);
            if (fileName) this._fileName = fileName.normalize();
        }
    }

    getFileName = (): string => this._fileName;
    getTitle = (): string => this._fileName.replace(extensionReg, '');
    getExtension = (): string => this._fileName.match(extensionReg)?.[0]?.toLowerCase() || '';
    getAnotherExtensionFileName = (extension: string): string => `${this.getTitle()}.${extension}`;
    getWithSuffixFileName = (suffix: string, separate: string = '_'): string =>
        `${this.getTitle()}${separate}${suffix}.${this.getExtension()}`;
    getAnotherExtensionWithSuffixFileName = (extension: string, suffix: string, separate: string = '_'): string =>
        `${this.getTitle()}${separate}${suffix}.${extension}`;

    get = (): string => [...this._path, this._fileName].join('/');
    getPrefix = (): string => this._path.join('/') + '/';
    getDirectory = (): string => this._path.join('/');
    getAnotherExtension = (extension: string): string =>
        [...this._path, this.getAnotherExtensionFileName(extension)].join('/');
    getWithSuffix = (suffix: string, separate: string = '_'): string =>
        `${this.getPrefix()}${this.getWithSuffixFileName(suffix, separate)}`;
    getAnotherExtensionWithSuffix = (extension: string, suffix: string, separate: string = '_'): string =>
        `${this.getPrefix()}${this.getAnotherExtensionWithSuffixFileName( extension, suffix, separate)}`;

    setType = (type: S3PathTypeValues) => 
    {
        if (type === 1 || type === 2) return 'writingEditorLog';
        if (type === 3) return 'cfsFileEditorLog';
        else return type;
    };
}

class awsS3Client
{
    s3Client = new S3Client({
        region: process.env.AWS_REGION || '',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
    });

    async retreiveFileBuffer ({ key, bucketIndex = 0 }: S3RetrieveParams)
    {
        if (!key) return responseStatus({ status: 400, msg: "not found key" });

        try 
        {
            const params = {
                Bucket: BUCKET_NAME[bucketIndex],
                Key: key
            };

            const command = new GetObjectCommand(params);

            const response = await this.s3Client.send(command);
            const chunks: Buffer[] = [];

            for await (const chunk of response.Body as AsyncIterable<Buffer>)
                chunks.push(chunk);

            return responseStatus({ status: 200, body: Buffer.concat(chunks) });
        } 
        catch (err: any) 
        {
            console.error(err);
            return responseStatus({ status: 400, msg: err?.message || '' });
        }
    }

    async deleteFile ({ key, bucketIndex = 0 }: S3RetrieveParams): Promise<void>
    {
        if (!key) return;

        try 
        {
            // 원본 파일 삭제
            const deleteParams = 
            {
                Bucket: BUCKET_NAME[bucketIndex] || '',
                Key: key // 삭제할 원본 파일 경로
            };

            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await this.s3Client.send(deleteCommand);
        }
        catch (err) 
        {
            console.error('Error moving file:', err);
            throw err;
        }
    }

    async getFilesList ({ prefix, bucketIndex = 0 }: S3RetrieveParams): Promise<S3DirNode> 
    {
        const root: S3DirNode = 
        {
            type: 'dir',
            name: '',
            children: []
        };
        if (!prefix) return root;

        try 
        {
            const list: string[] = [];
            let isTruncated = true;
            let ContinuationToken = undefined;

            while (isTruncated) 
            {
                const params: ListObjectsV2CommandInput = 
                {
                    Bucket: BUCKET_NAME[bucketIndex],
                    Prefix: prefix,
                    ContinuationToken
                };

                const command = await this.s3Client.send(new ListObjectsV2Command(params));
                if (command.Contents)
                    list.push(...command.Contents.map((content) => content.Key as string));
                else
                    break;

                isTruncated = command.IsTruncated ?? false;
                ContinuationToken = command.NextContinuationToken;
            }

            let listIndex = 0;
            for (const l of list)
            {
                const path = l.replace(prefix, '').split('/').filter(Boolean);
                let currentPath = root;

                let pathIndex = 1;
                for (const p of path)
                {
                    const isFile = pathIndex++ === path.length;
                    if (isFile)
                    {
                        currentPath.children.push(
                            {
                                type: 'file',
                                id: listIndex++,
                                name: p,
                                normalize: p.normalize(),
                                fullPath: l
                            }
                        );
                    }
                    else
                    {
                        let nextDir = currentPath.children.find((c): c is S3DirNode => c.type === 'dir' && c.name === p);

                        if (!nextDir) 
                        {
                            nextDir = { type: 'dir', name: p, children: [] };
                            currentPath.children.push(nextDir);
                        } 
                        else
                            currentPath = nextDir;
                    }
                }
            }

            return root;
        }
        catch (err) 
        {
            console.error('Error list files:', err);
            throw err;
        }
    }

    getKeyByListObject = ({ root, folderPath = [], fileName }: {root: S3DirNode, folderPath?: string[], fileName: string}): string | null => 
    {
        let current: S3DirNode = root;

        for (const seg of folderPath) 
        {
            const next = current.children.find(
                (node): node is S3DirNode => node.type === 'dir' && node.name === seg
            );

            if (!next) return null;
            current = next;
        }

        const target = current.children.find((node): node is S3FileNode => node.type === 'file' && node.normalize.toLocaleLowerCase() === fileName.normalize().toLocaleLowerCase());
        return target ? target.fullPath : null;
    };
}

class sesClient
{
    sesClient = new SESClient(
        {
            region: process.env.AWS_EMAIL_REGION as string,
            credentials: 
            {
                accessKeyId: process.env.AWS_EMAIL_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.AWS_EMAIL_SECRET_ACCESS_KEY as string
            }
        }
    );

    async sendEmail (message: Buffer)
    {
        try
        {
            const command = new SendRawEmailCommand(
                {
                    RawMessage: 
                {
                    Data: message
                }
                });

            const data = await this.sesClient.send(command);
            return data;
        }
        catch (err)
        {
            console.error('Error sending raw email:', err);
        }
    }
}

class awsKMSClient
{
    kmsClient = new KMSClient({ region: process.env.AWS_REGION || '' });
    key = process.env.AWS_KMS_KEY_ID || '';

    constructor (key?: string)
    {
        if (key) this.key = key;
    }

    async encrypt (plaintext: string)
    {
        const command = new EncryptCommand(
            {
                KeyId: this.key,
                Plaintext: Buffer.from(plaintext, 'utf8')
            });

        const response = await this.kmsClient.send(command);
        if (!response.CiphertextBlob) throw new Error();
        return Buffer.from(response.CiphertextBlob).toString('base64');
    }

    async decrypt (cipherText?: string)
    {
        if (!cipherText) return '';

        const command = new DecryptCommand(
            {
                KeyId: this.key,
                CiphertextBlob: Buffer.from(cipherText, 'base64')
            });

        const response = await this.kmsClient.send(command);
        if (!response.Plaintext) throw new Error();
        return Buffer.from(response.Plaintext).toString('utf8');
    }
}

class awsSMClient
{
    smClient = new SecretsManagerClient({ region: process.env.AWS_REGION || 'ap-northeast-2' });
    key = process.env.AWS_SM_KEY_ID || '';

    async get<T = Record<string, unknown>> (): Promise<T>
    {
        const command = new GetSecretValueCommand({ SecretId: this.key });
        const response = await this.smClient.send(command);

        if (!response.SecretString) throw new Error();

        return JSON.parse(response.SecretString);
    }

    async getByKey (key: string)
    {
        const secret = await this.get();
        if (!secret[key]) throw new Error();

        return secret[key];
    }

    async set (value: Record<string, unknown>)
    {
        const command = new PutSecretValueCommand({ SecretId: this.key, SecretString: JSON.stringify(value) });
        const response = await this.smClient.send(command);

        return response;
    }

    async update (key: string, value: unknown)
    {
        const secret = await this.get();
        secret[key] = value;

        return await this.set(secret);
    }

    autoParseValue (value: Record<string, unknown>)
    {
        const parseAuto = (val: string) =>
        {
            if (val === "true") return true;
            if (val === "false") return false;

            if (val && !isNaN(Number(val))) return Number(val);

            try
            {
                if (val.startsWith("{") && val.endsWith("}")) return JSON.parse(val);
                if (val.startsWith("[") && val.endsWith("]")) return JSON.parse(val);
            }
            catch
            {
                return val;
            }

            return val;
        };
    }
}

export const s3 = new awsS3Client();
export const ses = new sesClient();
export const kms = new awsKMSClient();
export const sm = new awsSMClient();

export const whoAmI = async () =>
{
    const sts = new STSClient({ region: process.env.AWS_REGION || '' });
    return await sts.send(new GetCallerIdentityCommand({}));
};