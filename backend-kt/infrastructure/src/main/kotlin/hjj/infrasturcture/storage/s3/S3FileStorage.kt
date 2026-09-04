package hjj.infrasturcture.storage.s3

import hjj.storage.FileStorage
import hjj.storage.StorageException
import hjj.storage.StorageOperation
import hjj.storage.StoredFile
import software.amazon.awssdk.core.exception.SdkException
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.core.sync.ResponseTransformer
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest

class S3FileStorage(
    private val s3Client: S3Client,
    private val bucket: String
): FileStorage {
    override fun save(key: String, content: ByteArray): StoredFile {
        try {
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType("application/octet-stream")
                    .build(),
                RequestBody.fromBytes(content)
            )
        } catch (e: SdkException) {
            throw StorageException(StorageOperation.SAVE, key, e)
        }

        return StoredFile(key = key, size = content.size.toLong())
    }

    override fun read(key: String): ByteArray = try {
            s3Client.getObject(
                GetObjectRequest.builder().bucket(bucket).key(key).build(),
                ResponseTransformer.toBytes()
            ).asByteArray()
    } catch (e: SdkException) {
        throw StorageException(StorageOperation.READ, key, e)
    }
}