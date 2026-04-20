import {
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    ListObjectsV2CommandInput,
    ObjectCannedACL,
    PutObjectCommand,
    S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Response } from 'express';
import { Readable } from 'stream';
import contentDisposition from 'content-disposition';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiError } from '@error/services/error.service';
import { API_ERROR_CODE } from '@error/constants/error.const';
import { S3Path } from '@lib/aws/utils/aws';
import { S3DirNode, S3FileNode } from '../dto/aws';

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private readonly s3Client: S3Client;
    private readonly privateBucket: string;
    private readonly publicBucket: string;

    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get('LF_AWS_S3_REGION', 'ap-northeast-2'),
            credentials: {
                accessKeyId: this.configService.getOrThrow('LF_AWS_S3_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.getOrThrow('LF_AWS_S3_SECRET_ACCESS_KEY')
            }
        });

        this.privateBucket = this.configService.getOrThrow('LF_AWS_S3_PRIVATE_BUCKET_NAME');
        this.publicBucket = this.configService.getOrThrow('LF_AWS_S3_PUBLIC_BUCKET_NAME');
    }

    private getBucket(bucketName?: string): string {
        if (bucketName === 'public') {
            if (!this.publicBucket) throw new ApiError(API_ERROR_CODE.NOT_SET_ENVIRONMENT);
            return this.publicBucket;
        }

        if (bucketName === 'private' || !bucketName) {
            if (!this.privateBucket) throw new ApiError(API_ERROR_CODE.NOT_SET_ENVIRONMENT);
            return this.privateBucket;
        }

        return bucketName;
    }

    async upload({ buffer, key, bucketName }: { buffer: Buffer; key: string; bucketName?: string }) {
        try {
            if (!key || !buffer || typeof key !== 'string')
                throw new ApiError(API_ERROR_CODE.NOT_SET_S3_PATH);
            const command = new PutObjectCommand({
                Bucket: this.getBucket(bucketName),
                Key: key?.normalize(),
                Body: buffer,
                ACL: ObjectCannedACL.bucket_owner_full_control
            });
            return await this.s3Client.send(command);
        } catch (err) {
            this.logger.error('S3 upload failed:', err);
            throw err;
        }
    }

    async retrieveFile(
        {
            res,
            key,
            bucketName
        }: {
            res: Response
            key: string
            bucketName?: string
        }
    ) {
        try {
            if (!key || typeof key !== 'string') throw new ApiError(API_ERROR_CODE.NOT_SET_S3_PATH);

            const Key = await this.getFullPath({ s3Path: new S3Path({ url: key }), bucketName });
            if (!Key) throw new Error('Not Found Key');

            const response = await this.s3Client.send(
                new GetObjectCommand({ Bucket: this.getBucket(bucketName), Key })
            );

            const fileName = contentDisposition(Key);
            if (fileName) res.setHeader('Content-Disposition', fileName);
            if (response.ContentType) res.setHeader('Content-Type', response.ContentType);

            Readable.from(response.Body as AsyncIterable<Buffer>).pipe(res);
        } catch (err) {
            this.logger.error('S3 retrieveFile failed:', err);
            throw err;
        }
    }

    async retrieveFileBuffer(
        {
            key,
            bucketName
        }: {
            key?: string
            bucketName?: string
        }
    ) {
        try {
            if (!key || typeof key !== 'string') throw new ApiError(API_ERROR_CODE.NOT_SET_S3_PATH);

            const Key = await this.getFullPath({ s3Path: new S3Path({ url: key }), bucketName });
            if (!Key) throw new Error('Not Found Key');

            const response = await this.s3Client.send(
                new GetObjectCommand({ Bucket: this.getBucket(bucketName), Key })
            );
            const chunks: Buffer[] = [];
            for await (const chunk of response.Body as AsyncIterable<Buffer>) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);

            return buffer;
        } catch (err) {
            this.logger.error('S3 retrieveFileBuffer failed:', err);
            throw err;
        }
    }

    private encodeS3KeyPreserveSlashes(key: string) {
        return key.split('/').map(encodeURIComponent).join('/');
    }

    async copyFile({
        sourceKey,
        destinationKey,
        bucketName
    }: {
        sourceKey: string
        destinationKey: string
        bucketName?: string
    }): Promise<void> {
        try {
            if (
                !sourceKey ||
        !destinationKey ||
        typeof sourceKey !== 'string' ||
        typeof destinationKey !== 'string'
            )
                throw new ApiError(API_ERROR_CODE.NOT_SET_S3_PATH);

            const CopySource = await this.getFullPath({
                s3Path: new S3Path({ url: sourceKey }),
                bucketName
            });
            if (!CopySource) throw new ApiError(API_ERROR_CODE.NOT_SET_S3_PATH);

            const bucket = this.getBucket(bucketName);
            await this.s3Client.send(
                new CopyObjectCommand({
                    Bucket: bucket,
                    CopySource: `${bucket}/${this.encodeS3KeyPreserveSlashes(CopySource)}`,
                    Key: destinationKey
                })
            );
        } catch (err) {
            this.logger.error('S3 Copy failed:', err);
            throw err;
        }
    }

    async deleteFile({ key, bucketName }: { key: string; bucketName?: string }): Promise<void> {
        try {
            if (!key || typeof key !== 'string') throw new ApiError(API_ERROR_CODE.NOT_SET_S3_PATH);

            const Key = await this.getFullPath({ s3Path: new S3Path({ url: key }), bucketName });
            if (!Key) throw new ApiError(API_ERROR_CODE.NOT_SET_S3_PATH);

            await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.getBucket(bucketName), Key }));
        } catch (err) {
            this.logger.error('S3 Delete failed:', err);
            throw err;
        }
    }

    async moveFile({
        sourceKey,
        destinationKey,
        bucketName
    }: {
        sourceKey: string
        destinationKey: string
        bucketName?: string
    }) {
        await this.copyFile({ sourceKey, destinationKey, bucketName });
        await this.deleteFile({ key: sourceKey, bucketName });
    }

    async getFilesList({
        prefix,
        bucketName
    }: {
        prefix: string
        bucketName?: string
    }): Promise<S3DirNode> {
        const root: S3DirNode = { type: 'dir', name: '', children: [] };
        if (!prefix || prefix === '/') return root;

        const list: string[] = [];
        let isTruncated = true;
        let ContinuationToken: string | undefined = undefined;

        while (isTruncated) {
            const params: ListObjectsV2CommandInput = {
        Bucket: this.getBucket(bucketName),
        Prefix: prefix,
        ContinuationToken
      };
            const command = await this.s3Client.send(new ListObjectsV2Command(params));
            if (command.Contents) list.push(...command.Contents.map((c) => c.Key as string));
            else break;
            isTruncated = command.IsTruncated ?? false;
            ContinuationToken = command.NextContinuationToken;
        }

        let listIndex = 0;
        for (const l of list) {
            const path = l.replace(prefix, '').split('/').filter(Boolean);
            let currentPath = root;
            let pathIndex = 1;
            for (const p of path) {
                const isFile = pathIndex++ === path.length;
                if (isFile) {
                    currentPath.children.push({
                        type: 'file',
                        id: listIndex++,
                        name: p,
                        normalize: p.normalize(),
                        fullPath: l
                    });
                } else {
                    let nextDir = currentPath.children.find(
                        (c): c is S3DirNode => c.type === 'dir' && c.name === p
                    );
                    if (!nextDir) {
                        nextDir = { type: 'dir', name: p, children: [] };
                        currentPath.children.push(nextDir);
                    }
                    currentPath = nextDir;
                }
            }
        }
        return root;
    }

    getKeyByListObject = ({
        root,
        folderPath = [],
        fileName
    }: {
        root: S3DirNode
        folderPath?: string[]
        fileName: string
    }): string | null => {
        let current: S3DirNode = root;
        for (const seg of folderPath) {
            const next = current.children.find(
                (node): node is S3DirNode => node.type === 'dir' && node.name === seg
            );
            if (!next) return null;
            current = next;
        }
        const target = current.children.find(
            (node): node is S3FileNode =>
                node.type === 'file' &&
        node.normalize.toLocaleLowerCase() === fileName.normalize().toLocaleLowerCase()
        );
        return target ? target.fullPath : null;
    };

    getFullPath = async ({ s3Path, bucketName }: { s3Path: S3Path; bucketName?: string }) => {
        if (!(s3Path instanceof S3Path)) return null;
        const prefix = s3Path.getDirectory();
        const fileName = s3Path.getFileName();
        const root = await this.getFilesList({ prefix, bucketName });
        return this.getKeyByListObject({ root, fileName });
    };

    async createPresignedPutUrl({
        key,
        options,
        bucketName
    }: {
        key: string
        options?: { expiresIn?: number }
        bucketName?: string
    }) {
        const command = new PutObjectCommand({ Bucket: this.getBucket(bucketName), Key: key });
        const expiresIn = options?.expiresIn ?? 1 * 60;
        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    async createPresignedGetUrl({
        key,
        options,
        bucketName
    }: {
        key: string
        options?: { expiresIn?: number; fileName?: string }
        bucketName?: string
    }) {
        const command = new GetObjectCommand({
            Bucket: this.getBucket(bucketName),
            Key: key,
            ...(options?.fileName && {
                ResponseContentDisposition: `attachment; filename="${encodeURIComponent(options.fileName)}"`
            })
        });
        const expiresIn = options?.expiresIn ?? 3 * 24 * 60 * 60;
        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }
}
