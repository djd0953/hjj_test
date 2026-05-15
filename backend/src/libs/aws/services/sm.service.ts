import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { API_ERROR_CODE } from "@error/constants/error.const";
import { Injectable, Logger } from "@nestjs/common";
import { getJsonObjectOrThrow } from "@util/common";
import { ApiError } from "@error/services/error.service";

@Injectable()
export class SMService {
    private readonly logger = new Logger(SMService.name);

    async load() {
        const smClient = new SecretsManagerClient({
            region: process.env.AWS_REGION || "ap-northeast-2"
        });

        const key = process.env.AWS_SM_KEY_ID;
        if (!key) throw new ApiError(API_ERROR_CODE.NOT_SET_ENVIRONMENT);

        try {
            const command = new GetSecretValueCommand({ SecretId: key });
            const response = await smClient.send(command);

            if (!response.SecretString) throw new ApiError(API_ERROR_CODE.NOT_SET_ENVIRONMENT);

            const parsed = getJsonObjectOrThrow<Record<string, string>>(response.SecretString);
            const envVariables: Record<string, string> = {};
            for (const [k, v] of Object.entries(parsed)) {
                if (!k || !v) continue;
                if (process.env?.[k]) continue;
                if (typeof v === "string") envVariables[k] = v;
                else envVariables[k] = String(v);
            }

            const env = Object.assign(process.env, envVariables);
            return env;
        } catch (err) {
            this.logger.error(err);
            throw new ApiError(API_ERROR_CODE.NOT_SET_ENVIRONMENT);
        }
    }
}
