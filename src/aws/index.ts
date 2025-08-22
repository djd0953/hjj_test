import type {S3RetrieveParams} from 'types'
import { DeleteObjectCommand, GetObjectCommand, GetObjectCommandInput, GetObjectRequest, ListObjectsV2Command, ListObjectsV2CommandInput, S3Client } from '@aws-sdk/client-s3';
import { SendRawEmailCommand, SESClient } from '@aws-sdk/client-ses';

const BUCKET_NAME = [process.env.BUCKET_NAME1 as string, process.env.BUCKET_NAME2 as string]

const getS3Client = () => {
    return new S3Client({
        region: process.env.AWS_REGION || '',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
    });
}


export const S3RetreiveFileBuffer = async ({ key, bucketIndex = 0}: S3RetrieveParams): Promise<{ status: number; Body?: Buffer; message?: unknown }> => {
    if (!key) return { status: 400, message: "Key가 없음" }

    try {
        const normalizeKey = key;
        const s3Client = getS3Client()

        const params = {
            Bucket: BUCKET_NAME[bucketIndex],
            Key: normalizeKey,
        };

        const command = new GetObjectCommand(params);

        const response = await s3Client.send(command);
        const chunks: Buffer[] = [];

        for await (const chunk of response.Body as AsyncIterable<Buffer>) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);
        return { status: 200, Body: buffer };
    } catch (err) {
        console.error(err);
        return { status: 400, message: err };
    }
};

export const S3DeleteObject = async ({ key, bucketIndex = 0 }: S3RetrieveParams): Promise<void> => {
    if (!key) return

    try {
        const s3Client = getS3Client()

        // 원본 파일 삭제
        const deleteParams = {
            Bucket: BUCKET_NAME[bucketIndex] || '',
            Key: key, // 삭제할 원본 파일 경로
        }
        const deleteCommand = new DeleteObjectCommand(deleteParams)
        await s3Client.send(deleteCommand)
    } catch (err) {
        console.error('Error moving file:', err)
        throw err
    }
}

interface S3FileNode {
    type: 'file'
    id: number,
    name: string,
    normalize: string,
    fullPath: string
}

interface S3DirNode {
    type: 'dir',
    name: string,
    children: Array<S3DirNode | S3FileNode>
}

export const S3ListObjectsToNormalizeList = async ({ prefix, bucketIndex = 0 }: S3RetrieveParams): Promise<S3DirNode> => {
    const root: S3DirNode = {
        type: 'dir',
        name: '',
        children: []
    }
    if (!prefix) return root

    try {
        const s3Client = getS3Client()

        const list: string[] = []
        let isTruncated = true
        let ContinuationToken = undefined

        while (isTruncated) {
            const params: ListObjectsV2CommandInput = {
                Bucket: BUCKET_NAME[bucketIndex],
                Prefix: prefix,
                ContinuationToken,
            }

            const command = await s3Client.send(new ListObjectsV2Command(params))
            if (command.Contents) {
                list.push(...command.Contents.map((content) => content.Key as string))
            } else {
                break
            }
            isTruncated = command.IsTruncated ?? false
            ContinuationToken = command.NextContinuationToken
        }

        let listIndex = 0
        for (let i = 0; i < list.length; i++) {
            const path = list[i].replace(prefix, '').split('/').filter(Boolean)
            let currentPath = root

            for (let j = 0; j < path.length; j++) {
                const key = path[j]
                const normalizeKeySplit = path[j].normalize().split('.')
                const normalizeKey = normalizeKeySplit
                    .slice(0, normalizeKeySplit.length - 1)
                    .join('.')
                const isFile = j === path.length - 1;
                if (isFile) 
                {
                    currentPath.children.push({
                        type: 'file',
                        id: listIndex++,
                        name: key,
                        normalize: normalizeKey,
                        fullPath: list[i],
                    })
                }
                else
                {
                    let nextDir = currentPath.children.find((c): c is S3DirNode => c.type === 'dir' && c.name === key);
                    if (!nextDir) {
                        nextDir = {type: 'dir', name: key, children: []};
                        currentPath.children.push(nextDir)
                    } else {
                        currentPath = nextDir
                    }
                }                
            }
        }

        return root
    } catch (err) {
        console.error('Error list files:', err)
        throw err
    }
}

export const S3GetKeyByListObject = ({ root, folderPath = [], fileName }: {root: S3DirNode, folderPath?: string[], fileName: string}): string | null => {
    let current: S3DirNode = root;

    for (const seg of folderPath) {
        const next = current.children.find(
            (node): node is S3DirNode => node.type === 'dir' && node.name === seg
        );

        if (!next) return null
        current = next;
    }

    const target = current.children.find((node): node is S3FileNode => node.type === 'file' && node.normalize.toLocaleLowerCase() === fileName.normalize().toLocaleLowerCase());
    return target ? target.fullPath : null
}

export const AmazonES = async (message: Buffer) => {
    const sesClient = new SESClient({
        region: process.env.AWS_EMAIL_REGION as string,
        credentials: {
            accessKeyId: process.env.AWS_EMAIL_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_EMAIL_SECRET_ACCESS_KEY as string,
        },
    })

    try {
        const command = new SendRawEmailCommand({
            RawMessage: {
                Data: message,
            },
        })

        const data = await sesClient.send(command)
        return data
    } catch (err) {
        console.error('Error sending raw email:', err)
    }
}