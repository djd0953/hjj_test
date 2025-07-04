import { Dept, User } from 'types'

import {
    DININGBRANDS_AUTH_TYPE,
    DININGBRANDS_DEPT_ID,
    DININGBRANDS_QUITTER_DEPT_ID,
    DININGBRANDS_TEAM_ID,
} from './config'

import {
    CF_PROFILE_IS_MULTI_TEAM_ENABLED,
    CF_PROFILE_TEAM_IS_LEGAL,
    CF_PROFILE_TEAM_IS_LEGAL_DESIGNATOR,
    CF_TEAM_IS_ACTIVE,
    CF_USER_TYPE,
} from './config'
// import { TeamDetailController } from '@controllers/team/team.detail.controller'
// import { TeamMemberCategoryCreateContoller } from '@controllers/teamMemberCategory/team_member_category.create.controller'
// import { TeamMemberCategoryListContoller } from '@controllers/teamMemberCategory/team_member_category.list.controller'
// import { TeamMemberCategoryUpdateContoller } from '@controllers/teamMemberCategory/team_member_category.update.controller'
// import { TeamMemberSubcategoryCreateController } from '@controllers/teamMemberSubcategory/team_member_subcategory.create.controller'
// import { TeamMemberSubcategoryListContoller } from '@controllers/teamMemberSubcategory/team_member_subcategory.list.controller'
// import { TeamMemberSubcategoryUpdateController } from '@controllers/teamMemberSubcategory/team_member_subcategory.update.controller'
// import { UsersCreateController } from '@controllers/users/users.create.controller'
// import { UsersListController } from '@controllers/users/users.list.controller'
// import { UsersUpdateController } from '@controllers/users/users.update.controller'
// import json_dept from '@crons/json/diningbrands_dept.json'
// import json_user from '@crons/json/diningbrands_user.json'
import diningBrandsDB from './database'
// import lawformDB from '@database/models/lawform'
// import { sendNotify_DiningbrandsUser } from '@libs/mattermost'
// import lodash from 'lodash'
import { QueryTypes, Transaction } from 'sequelize'

let totalDeptCount = 0
let createCategoryCount = 0
let updateCategoryCount = 0

let createSubCategoryCount = 0
let updateSubCategoryCount = 0

let totalCount = 0

let createUserCount = 0
let udpateUserCount = 0

interface DeptWithDepthAndBreadCrumb extends Dept {
    depth: number
    breadCrumb: string[]
}

const CRON_DINING_BRANDS_USER = async () => {

    // const t = await lawformDB.sequelize.transaction()

    try {
        /* 0. 팀 조회 */
        // const a = await HP_GET_TEAM()

        /* 1. 다이닝 브랜즈 부서/팀 추출 및 생성 */
        /* 1-1. dept 조회 후 dictionary 처리 - (deptId,deptName,parentDeptId) */
        const { deptList, deptObj } = await HP_GET_DINING_DEPT()
        /* 1-2. team_member_category, team_member_subcategory - create or update */
        // const { teamMemberCategoryObj, teamMemberSubcategoryObj } =
        //     await HP_CREATE_OR_UPDATE_TEAM_CATEGORY({
        //         deptList,
        //         deptObj,
        //         transaction: t,
        //     })
        /* 2. 다이닝 브랜즈 회원 추출 및 생성 */
        /* 2-1. user 조회 후 dictionray 처리 - {user_key, userId, userName, userpw, duty, com_position, email, deptId, activeYn} */
        const { userList } = await HP_GET_DINING_USER()
        /* 2-2. user create or update */
        // await HP_CREATE_OR_UPDATE_USER({
        //     userList,
        //     deptObj,
        //     teamMemberCategoryObj,
        //     teamMemberSubcategoryObj,
        //     transaction: t,
        // })
        // if (isTest) {
        //     await t.rollback()
        //     return true
        // }
        /* 3. 결과 노티 */
        // await sendNotify_DiningbrandsUser({
        //     totalDeptCount,
        //     createCategoryCount,
        //     updateCategoryCount,
        //     createSubCategoryCount,
        //     updateSubCategoryCount,
        //     totalCount,
        //     createUserCount,
        //     udpateUserCount,
        // })
        // await t.commit()
        // await t.rollback()
    } catch (error: unknown) {
        // await t.rollback()

        console.log(error)
        // if (isTest) {
        //     console.error('알 수 없는 오류 발생', error)
        //     return false
        // }

        /* 4. 에러 노티 */
        // if (error instanceof Error) await sendNotify_DiningbrandsUser({ error })
        // else console.error('알 수 없는 오류 발생', error)
    }
}

export default CRON_DINING_BRANDS_USER

const HP_GET_TEAM = async () => {
    const selectBusiness = await diningBrandsDB.sequelize.query(
        `SELECT * FROM dept WHERE deptId = '${DININGBRANDS_DEPT_ID}'`,
        { type: QueryTypes.SELECT }
    )

    const business = selectBusiness[0]
    if (!business) throw Error('다이닝브랜즈그룹 데이터를 못 가져왔음')

    // const team = await TeamDetailController({ id: DININGBRANDS_TEAM_ID, transaction })
    // if (!team || team.name !== business.deptName)
    //     throw Error(
    //         `로폼DB에서 다이닝브랜즈 팀을 못 가져옴, lawform DB:${team?.name}, dining DB: ${business.deptName}`
    //     )

    // return team
    return selectBusiness
}

const HP_GET_DINING_DEPT = async () => {
    let deptList = await diningBrandsDB.sequelize.query('SELECT * FROM dept', {
        type: QueryTypes.SELECT,
    })

    totalDeptCount = deptList.length

    const deptObj: { [key: string]: DeptWithDepthAndBreadCrumb } = {}

    const setDeptInfo = (deptId: string) => {
        if (!deptId) return { depth: 0, breadCrumb: [] }

        if (deptObj[deptId] !== undefined) return deptObj[deptId]

        //@ts-ignore
        const dept = deptList.find((d: Dept) => d.deptId === deptId)
        if (!dept) return { depth: 0, breadCrumb: [] }

        //@ts-ignore
        const parentDeptInfo = setDeptInfo(dept.parentDeptId)

        //@ts-ignore
        deptObj[deptId] = {
            ...dept,
            depth: parentDeptInfo.depth + 1,
            breadCrumb: [...parentDeptInfo.breadCrumb, deptId],
        }

        return deptObj[deptId]
    }

    //@ts-ignore
    deptList = deptList.map((dept: DeptWithDepthAndBreadCrumb) => ({
        ...dept,
        ...setDeptInfo(dept.deptId),
    }))

    return { deptList, deptObj }
}

// const HP_CREATE_OR_UPDATE_TEAM_CATEGORY = async ({
//     deptList,
//     deptObj,
//     transaction,
// }: {
//     deptList: DeptWithDepthAndBreadCrumb[]
//     deptObj: { [key: string]: DeptWithDepthAndBreadCrumb }
//     transaction: Transaction
// }) => {
//     const r1 = await TeamMemberCategoryListContoller({
//         team_id: DININGBRANDS_TEAM_ID,
//         limit: 1000,
//         transaction,
//     })
//     const teamMemberCategoryList = r1.items

//     const teamMemberCategoryObj: { [key: string]: TeamMemberCategory } = {}
//     teamMemberCategoryList.forEach((category) => {
//         if (!category) return
//         if (!category.source_original_data?.deptId) return
//         const { deptId } = category.source_original_data
//         teamMemberCategoryObj[deptId] = { ...category }
//     })

//     const r2 = await TeamMemberSubcategoryListContoller({
//         team_id: DININGBRANDS_TEAM_ID,
//         limit: 1000,
//         transaction,
//     })
//     const teamMemberSubcategoryList = r2.items
//     const teamMemberSubcategoryObj: { [key: string]: TeamMemberSubcategory } = {}
//     teamMemberSubcategoryList.forEach((category) => {
//         if (!category) return
//         if (!category.source_original_data?.deptId) return
//         const { deptId } = category.source_original_data
//         teamMemberSubcategoryObj[deptId] = { ...category }
//     })

//     for (let i = 0; i < deptList.length; i++) {
//         const dept = deptList[i]
//         const { depth } = dept
//         console.log(`index:${i} ::: deptName: ${dept.deptName} ::: depth: ${depth}`)
//         if (depth === 1) continue

//         /* 부서 지정 */
//         if (depth === 2) {
//             await HP_CREATE_OR_UPDATE_TEAM_MEMBER_CATEGORY({
//                 dept,
//                 teamMemberCategoryObj,
//                 teamMemberSubcategoryObj,
//                 transaction,
//             })
//             continue
//         }

//         /* 팀 지정 - depth가 높아서 3depth 값으로 처리한다. */
//         if (depth > 2) {
//             await HP_CREATE_OR_UPDATE_TEAM_MEMBER_SUBCATEGORY({
//                 dept,
//                 deptObj,
//                 teamMemberCategoryObj,
//                 teamMemberSubcategoryObj,
//                 transaction,
//             })
//             continue
//         }
//     }

//     return { teamMemberCategoryObj, teamMemberSubcategoryObj }
// }

// const HP_CREATE_OR_UPDATE_TEAM_MEMBER_CATEGORY = async ({
//     dept,
//     teamMemberCategoryObj,
//     teamMemberSubcategoryObj,
//     transaction,
// }: {
//     dept: Dept
//     teamMemberCategoryObj: { [key: string]: TeamMemberCategory }
//     teamMemberSubcategoryObj: { [key: string]: TeamMemberSubcategory }
//     transaction: Transaction
// }) => {
//     const { deptId, deptName } = dept

//     let lawformCategory: TeamMemberCategory | null = teamMemberCategoryObj[deptId]

//     if (!lawformCategory) {
//         lawformCategory = await TeamMemberCategoryCreateContoller({
//             team_id: DININGBRANDS_TEAM_ID,
//             name: deptName,
//             source_original_data: dept,
//             transaction,
//         })
//         if (!lawformCategory) throw Error('부서 생성 실패')
//         teamMemberCategoryObj[deptId] = lawformCategory

//         /* 본부라는 팀도 만들어주어야함. */
//         const lawformSubcategory = await TeamMemberSubcategoryCreateController({
//             team_id: DININGBRANDS_TEAM_ID,
//             parent_id: lawformCategory.id,
//             name: '본부',
//             sort_id: 1,
//             source_original_data: dept,
//             transaction,
//         })
//         if (!lawformSubcategory) throw Error('본부 팀 생성 실패')
//         teamMemberSubcategoryObj[deptId] = lawformSubcategory

//         createCategoryCount++
//         return lawformCategory
//     }

//     if (!lodash.isEqual(lawformCategory.source_original_data, dept)) {
//         lawformCategory = await TeamMemberCategoryUpdateContoller({
//             id: lawformCategory.id,
//             team_id: DININGBRANDS_TEAM_ID,
//             name: deptName,
//             source_original_data: dept,
//             transaction,
//         })
//         if (!lawformCategory) throw Error('부서 수정 실패')
//         teamMemberCategoryObj[deptId] = lawformCategory
//         updateCategoryCount++
//     }

//     return lawformCategory
// }

// const HP_CREATE_OR_UPDATE_TEAM_MEMBER_SUBCATEGORY = async ({
//     dept,
//     deptObj,
//     teamMemberCategoryObj,
//     teamMemberSubcategoryObj,
//     transaction,
// }: {
//     dept: DeptWithDepthAndBreadCrumb
//     deptObj: { [key: string]: DeptWithDepthAndBreadCrumb }
//     teamMemberCategoryObj: { [key: string]: TeamMemberCategory }
//     teamMemberSubcategoryObj: { [key: string]: TeamMemberSubcategory }
//     transaction: Transaction
// }) => {
//     const { breadCrumb } = dept

//     /* 1. 부서가 있는지 먼저 확인 */
//     const parentDeptId = breadCrumb[1]
//     let lawformCategory = teamMemberCategoryObj[parentDeptId]
//     /* 1-1. 부서 카테고리가 없으면 Create */
//     if (!lawformCategory) {
//         const parentDept = deptObj[parentDeptId]
//         if (parentDept.depth !== 2) throw Error('잘못된 부서 카테고리입니다. 2뎁스가 아님.')

//         lawformCategory = await HP_CREATE_OR_UPDATE_TEAM_MEMBER_CATEGORY({
//             dept: deptObj[parentDeptId],
//             teamMemberCategoryObj,
//             teamMemberSubcategoryObj,
//             transaction,
//         })
//         teamMemberCategoryObj[parentDeptId] = lawformCategory
//     }

//     /* 2. 팀 생성 및 수정 진행 */

//     /* 최대 4뎁스 까지만 노출할 것이어서 */
//     const subBreadCrumbDeptId = breadCrumb[3] || breadCrumb[2]
//     const originDept = deptObj[subBreadCrumbDeptId]
//     let lawformSubcategory: TeamMemberSubcategory | null =
//         teamMemberSubcategoryObj[originDept.deptId]

//     const subBreadCrumb = originDept.breadCrumb.slice(2, 4)
//     const name = subBreadCrumb.map((key) => deptObj[key].deptName).join(' > ')

//     if (!lawformSubcategory) {
//         lawformSubcategory = await TeamMemberSubcategoryCreateController({
//             team_id: DININGBRANDS_TEAM_ID,
//             parent_id: lawformCategory.id,
//             name: name,
//             source_original_data: originDept,
//             sort_id: 2,
//             transaction,
//         })
//         if (!lawformSubcategory) throw Error('팀 생성 실패')
//         teamMemberSubcategoryObj[originDept.deptId] = lawformSubcategory
//         createSubCategoryCount++
//         return lawformSubcategory
//     }

//     if (!lodash.isEqual(lawformSubcategory.source_original_data, originDept)) {
//         lawformSubcategory = await TeamMemberSubcategoryUpdateController({
//             id: lawformSubcategory.id,
//             parent_id: lawformCategory.id,
//             team_id: DININGBRANDS_TEAM_ID,
//             name: name,
//             source_original_data: originDept,
//             transaction,
//         })
//         if (!lawformSubcategory) throw Error('팀 수정 실패')
//         teamMemberSubcategoryObj[originDept.deptId] = lawformSubcategory
//         updateSubCategoryCount++
//     }
//     return lawformSubcategory
// }

const HP_GET_DINING_USER = async () => {
    let userList: User[] = []

    // if (process.env.LF_IS_ANOTHER_SERVER === 'Y') userList = json_user.user
    // else
        userList = await diningBrandsDB.sequelize.query(`SELECT * FROM [user]`, {
            type: QueryTypes.SELECT,
        })

    totalCount = userList.length
    return { userList }
}

// const HP_CREATE_OR_UPDATE_USER = async ({
//     userList,
//     deptObj,
//     teamMemberCategoryObj,
//     teamMemberSubcategoryObj,
//     transaction,
// }: {
//     userList: User[]
//     deptObj: { [key: string]: DeptWithDepthAndBreadCrumb }
//     teamMemberCategoryObj: { [key: string]: TeamMemberCategory }
//     teamMemberSubcategoryObj: { [key: string]: TeamMemberSubcategory }
//     transaction: Transaction
// }) => {
//     const r = await UsersListController({ team_id: DININGBRANDS_TEAM_ID, limit: 1000, transaction })
//     const lawformUserList = r.items

//     const lawformUserObj: { [key: string]: Users } = {}
//     lawformUserList.forEach((user) => {
//         if (!user) return
//         if (!user.sso_source_data?.user_key) return
//         const { user_key } = user.sso_source_data
//         lawformUserObj[user_key] = { ...user }
//     })

//     for (let i = 0; i < userList.length; i++) {
//         const user = userList[i]
//         const { user_key, deptId, email, userName, userpw, duty, com_position, auth_type } = user

//         console.log(`${i} ::: name: ${userName} ::: email: ${email}`)

//         const dept = deptObj[deptId]
//         const { breadCrumb } = dept
//         const category = teamMemberCategoryObj[breadCrumb[1]]
//         const subcategory =
//             teamMemberSubcategoryObj[breadCrumb[3] || breadCrumb[2] || breadCrumb[1]]

//         /* 퇴사자 여부 */
//         const isQuitter = deptId === DININGBRANDS_QUITTER_DEPT_ID

//         /* 권한자 여부 */
//         const isLegal = auth_type === DININGBRANDS_AUTH_TYPE.YES

//         let lawformUser: Users | null = lawformUserObj[user_key]

//         const param: Partial<Users> & { transaction: Transaction } = {
//             transaction,
//             team_id: DININGBRANDS_TEAM_ID,
//             multi_team_enabled: CF_PROFILE_IS_MULTI_TEAM_ENABLED.NO,
//             team_member_category_id: category ? category.id : null,
//             team_member_subcategory_id: subcategory ? subcategory.id : null,
//             team_is_legal: isLegal ? CF_PROFILE_TEAM_IS_LEGAL.YES : CF_PROFILE_TEAM_IS_LEGAL.NO,
//             team_is_legal_designator: isLegal
//                 ? CF_PROFILE_TEAM_IS_LEGAL_DESIGNATOR.YES
//                 : CF_PROFILE_TEAM_IS_LEGAL_DESIGNATOR.NO,
//             team_is_active: isQuitter ? CF_TEAM_IS_ACTIVE.YES : CF_TEAM_IS_ACTIVE.NO,
//             type: CF_USER_TYPE.PERSON as string,
//             email:
//                 process.env.LF_ENV === 'master'
//                     ? email
//                     : `developer+${email.split('@')[0]}_${email
//                           .split('@')[1]
//                           .slice(0, 1)}@amicuslex.net`,
//             name: userName,
//             password: process.env.LF_ENV === 'master' ? userpw : undefined,
//             position: duty,
//             rank: com_position,
//             sso_id: user_key,
//             sso_source: 'dining_brands',
//             sso_source_data: user,
//             is_del: isQuitter ? 0 : 1,
//         }

//         if (!lawformUser) {
//             console.log('create')
//             lawformUser = await UsersCreateController(param)
//             if (!lawformUser) throw Error('users 생성 실패')

//             lawformUserObj[user_key] = lawformUser
//             createUserCount++
//             continue
//         }

//         if (!lodash.isEqual(lawformUser.sso_source_data, user)) {
//             console.log('update')
//             param.id = lawformUser.id
//             lawformUser = await UsersUpdateController(param)
//             if (!lawformUser) throw Error('users 수정 실패')
//             lawformUserObj[user_key] = lawformUser
//             udpateUserCount++
//             continue
//         }
//     }
// }
