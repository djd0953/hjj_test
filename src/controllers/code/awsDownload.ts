import fs from 'fs';

import { s3 } from '@aws';

export default async () => 
{
    const url = 'upload/11992/file.doc';
    const r = await s3.retreiveFileBuffer({ key: url, bucketIndex: 1 });

    if (!r.body) return;

    fs.writeFileSync("file.doc", r.body);
};