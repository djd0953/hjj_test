import type {S3RetrieveParams} from 'types'
import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SendRawEmailCommand, SESClient } from '@aws-sdk/client-ses';

const BUCKET_NAME = [process.env.BUCKET_NAME1, process.env.BUCKET_NAME2]

export const S3RetreiveFileBuffer = async ({ key }: S3RetrieveParams): Promise<{ status: number; Body?: Buffer; message?: unknown }> => {
    const normalizeKey = key;

    const s3Client = new S3Client({
        region: process.env.AWS_REGION || '',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
    });

    const params = {
        Bucket: BUCKET_NAME[0] || '',
        Key: normalizeKey,
    };

    const command = new GetObjectCommand(params);
    try {
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

export const S3DeleteObject = async ({ key }: S3RetrieveParams): Promise<void> => {
    const s3Client = new S3Client({
        region: process.env.AWS_REGION || '',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
    });

    try {
        // 원본 파일 삭제
        const deleteParams = {
            Bucket: BUCKET_NAME[0] || '',
            Key: key, // 삭제할 원본 파일 경로
        }
        const deleteCommand = new DeleteObjectCommand(deleteParams)
        await s3Client.send(deleteCommand)
    } catch (err) {
        console.error('Error moving file:', err)
        throw err
    }
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