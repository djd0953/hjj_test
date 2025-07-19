import {S3DeleteObject, S3GetKeyByListObject, S3ListObjectsToNormalizeList} from '@/aws'
import sequelize from '@/db'
import { QueryTypes, Transaction } from 'sequelize'

interface CfsFile {
    id: number,
    cfs_id: number,
    user_id: number,
    clm_id: number | null,
    advice_id: number | null,
    team_standard_contract_id: number | null,
    filename: string,
    extension: string | null,
    cfs_file_html: string | null,
    cfs_file_html_head: string | null
}

export default async () => {
    let transaction: Transaction | null = null
    const cfsFileList = await sequelize.query(
        `SELECT id, user_id, filename FROM cfs_file WHERE filename like '가 사%';`,
        {
            transaction,
            type: QueryTypes.SELECT
        }
    );

    // const cfsFileList = await sequelize.query(
    //     `SELECT id, user_id, filename FROM cfs_file WHERE id = 29267;`,
    //     {
    //         transaction,
    //         type: QueryTypes.SELECT
    //     }
    // );

    transaction = await sequelize.transaction();
    try 
    {
        await Promise.all(
            (cfsFileList as unknown as CfsFile[]).map(async cfsFile => {
                const prefix = `upload/${cfsFile.id}`
                const root = await S3ListObjectsToNormalizeList({bucketIndex: 1, prefix})

                const fileNameSplit = cfsFile.filename.split('.');
                const fileName = fileNameSplit.slice(0, fileNameSplit.length - 1).join('.').normalize();

                const path = S3GetKeyByListObject({root, fileName});
                if (cfsFile.clm_id)
                    await sequelize.query('UPDATE clm set is_del = 0 WHERE id = :clm_id', {transaction, type: QueryTypes.UPDATE, replacements: {clm_id: cfsFile.clm_id}});

                await sequelize.query('UPDATE cfs_file SET is_del = 0 WHERE id = :id', {transaction, type:QueryTypes.UPDATE, replacements: {id: cfsFile.id}})
                await S3DeleteObject({key: path, bucketIndex: 1})
            })
        )

        await transaction.commit()
    }
    catch (err)
    {
        await transaction.rollback()
        console.log(err)
    }

    console.log(1)
}