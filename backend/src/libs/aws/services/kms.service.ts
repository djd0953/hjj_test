import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { API_ERROR_CODE } from "@error/constants/error.const";
import { ApiError } from "@error/services/error.service";

@Injectable()
export class KmsService {
    private readonly logger = new Logger(KmsService.name);
    private kmsClient: KMSClient;
    private keyId: string;

    constructor(private readonly configService: ConfigService) {
        this.kmsClient = new KMSClient({
            region: configService.get("AWS_REGION", "ap-northeast-2")
        });
        this.keyId = configService.getOrThrow("AWS_KMS_KEY_ID");
    }

    async encrypt(plaintext: string): Promise<string> {
        try {
            const command = new EncryptCommand({
                KeyId: this.keyId,
                Plaintext: Buffer.from(plaintext ?? "", "utf8")
            });
            const response = await this.kmsClient.send(command);
            if (!response.CiphertextBlob) throw new ApiError(API_ERROR_CODE.NOT_AWS_PERMISSION);
            return Buffer.from(response.CiphertextBlob).toString("base64");
        } catch (e) {
            if (e instanceof ApiError) throw e;
            this.logger.error(e);
            throw new ApiError(API_ERROR_CODE.NOT_AWS_PERMISSION);
        }
    }

    async decrypt(cipherText?: string): Promise<string> {
        try {
            if (!cipherText) return "";
            const command = new DecryptCommand({
                CiphertextBlob: Buffer.from(cipherText, "base64")
            });
            const response = await this.kmsClient.send(command);
            if (!response.Plaintext) throw new ApiError(API_ERROR_CODE.NOT_AWS_PERMISSION);
            return Buffer.from(response.Plaintext).toString("utf8");
        } catch (e) {
            if (e instanceof ApiError) throw e;
            this.logger.error(e);
            throw new ApiError(API_ERROR_CODE.NOT_AWS_PERMISSION);
        }
    }
}
