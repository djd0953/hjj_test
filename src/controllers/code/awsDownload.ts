import fs from 'fs';

import { s3, S3Path } from '@aws';

export default async () => 
{
    // const s3Path = new S3Path({ id: 11992, fileName: "file.doc", base: "upload", isIncludeEnv: false });
    const s3Path = new S3Path({ fileName: "재직증명서.pdf", base: "", isIncludeEnv: false });
    const path = await s3.getKeyByUrl({ s3Path });
    return path;
    // const r = await s3.retreiveFileBuffer({ key: s3Path.get(), bucketIndex: 1 });
    // if (r.status !== 200) throw r;

    // fs.writeFileSync("file.doc", r.body);
};