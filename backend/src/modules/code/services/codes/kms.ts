import { KmsService } from "@lib/aws/services/kms.service";

export const kmsTest = async (kms: KmsService) => {
    const testText = ["암호화1", "encrypt text 1", "현재 키 구성 요소 ID", "To address issues that do not require,"];
    const encryptText = await Promise.all(testText.map(async (v) => await kms.encrypt(v)));

    return { testText, encryptText };
};
