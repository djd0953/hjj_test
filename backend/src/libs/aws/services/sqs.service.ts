import { SendMessageCommand, SendMessageBatchCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SqsService {
    private sqsClient: SQSClient | null = null;

    private get client(): SQSClient {
        if (!this.sqsClient) {
            this.sqsClient = new SQSClient({
                region: "ap-northeast-2",
                credentials: {
                    accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.AWS_SQS_SECRET_ACCESS_KEY!
                }
            });
        }
        return this.sqsClient;
    }

    async sendMessage({ queueUrl, body }: { queueUrl: string; body: object }): Promise<void> {
        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(body)
        });
        await this.client.send(command);
    }

    async sendMessageBatch({
        queueUrl,
        entries
    }: {
        queueUrl: string;
        entries: { id: string; body: object }[];
    }): Promise<void> {
        const command = new SendMessageBatchCommand({
            QueueUrl: queueUrl,
            Entries: entries.map((e) => ({ Id: e.id, MessageBody: JSON.stringify(e.body) }))
        });
        await this.client.send(command);
    }
}
