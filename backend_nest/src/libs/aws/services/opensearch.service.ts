import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws-v3';

@Injectable()
export class OpenSearchService {
    private readonly logger = new Logger(OpenSearchService.name);
    private osClient: Client | null = null;

    private get isLocal(): boolean {
        return process.env.LF_ENV === 'local';
    }

    private get client(): Client {
        if (!this.osClient) {
            this.osClient = new Client({
                ...AwsSigv4Signer({
                    region: process.env.LF_AWS_OPENSEARCH_REGION || 'ap-northeast-2',
                    service: 'aoss',
                    getCredentials: () =>
                        Promise.resolve({
                            accessKeyId: process.env.LF_AWS_OPENSEARCH_ACCESS_KEY_ID!,
                            secretAccessKey: process.env.LF_AWS_OPENSEARCH_SECRET_ACCESS_KEY!
                        })
                }),
                node: process.env.LF_AWS_OPENSEARCH_URL!
            });
        }
        return this.osClient;
    }

    async existsIndex(index: string): Promise<boolean> {
        if (this.isLocal) return false;
        const exists = await this.client.indices.exists({ index });
        void exists.body;
        return exists.statusCode === 200;
    }

    async createIndex(index: string, body: object): Promise<void> {
        if (this.isLocal) return;
        const res = await this.client.indices.create({ index, body });
        void res.body;
        this.logger.log(`Index created: ${index}`);
    }

    async deleteIndex(index: string): Promise<void> {
        if (this.isLocal) return;
        const res = await this.client.indices.delete({ index });
        void res.body;
        this.logger.log(`Index deleted: ${index}`);
    }

    // OpenSearch Serverless does not support explicit document IDs — uses POST
    async indexDocument(index: string, body: object): Promise<void> {
        if (this.isLocal) return;
        const res = await this.client.index({ index, body });
        void res.body;
    }

    // OpenSearch Serverless does not support _delete_by_query
    // Search for _id first, then delete by native document ID
    async deleteDocument(index: string, query: object): Promise<void> {
        if (this.isLocal) return;
        const response = await this.client.search({ index, body: { query, size: 1, _source: false } });
        const hits = (response.body as { hits: { hits: Array<{ _id: string }> } }).hits.hits;
        if (hits[0]) {
            const res = await this.client.delete({ index, id: decodeURIComponent(hits[0]._id) });
            void res.body;
        }
    }

    // OpenSearch Serverless does not support get by ID — uses search
    async getDocument(index: string, query: object): Promise<unknown> {
        if (this.isLocal) return null;
        const response = await this.client.search({ index, body: { query, size: 1 } });
        const hits = (response.body as { hits: { hits: unknown[] } }).hits.hits;
        return hits[0] ?? null;
    }

    async search(index: string, body: object): Promise<unknown> {
        if (this.isLocal) return { hits: { total: { value: 0, relation: 'eq' }, hits: [] } };
        const response = await this.client.search({ index, body });
        return response.body;
    }

    async getMapping(index: string): Promise<unknown> {
        if (this.isLocal) return null;
        const res = await this.client.indices.getMapping({ index });
        return res.body;
    }
}
