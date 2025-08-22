import {S3DeleteObject, S3RetreiveFileBuffer} from '@/aws'
import fs from 'fs'

export default async () => {
    const url = 'upload/11992/(주)블루개러지 자동결제 부가합의서_2025_암호화해제.doc';
    const r = await S3RetreiveFileBuffer({key: url, bucketIndex: 1})

    if (!r.Body) return

    fs.writeFileSync("(주)블루개러지 자동결제 부가합의서_2025_암호화해제.doc", r.Body)
}