import {S3DeleteObject} from '@/aws'
import sequelize from '@/db'

export default async () => {
    sequelize.query(`SELECT * FROM cfs_file`)

    const a = []

    for (let i = 0; i < 50; i++) 
    {
        const b = {
            a: 1,
            b: 1,
            c: 1,
            d: 1,
            e: 1
        }

        if (i === 0) b.a = 2;

        b.b = Math.floor(Math.random() * 100) % 2 === 0 ? 2 : 1
        b.c = Math.floor(Math.random() * 100) % 2 === 0 ? 2 : 1
        b.d = Math.floor(Math.random() * 100) % 2 === 0 ? 2 : 1
        b.e = Math.floor(Math.random() * 100) % 2 === 0 ? 2 : 1

        a.push(b)
    }

    const d = a.map(x => [x.a === 2 && "a", x.b === 2 && "b"])

    console.log(1)
}