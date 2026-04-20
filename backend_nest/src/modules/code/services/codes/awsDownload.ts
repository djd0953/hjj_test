import { S3Service } from "@lib/aws/services/s3.service";
import { S3Path } from "@lib/aws/utils/aws";

export const awsDownload = async (s3Client: S3Service) => {
    const s3Path = new S3Path({ fileName: "재직증명서.pdf", base: "" });
    const path = await s3Client.getFullPath({ s3Path });
    return path;
};
