import { deptList, deptObj, teamMemberCategoryList, teamMemberCategoryObj, teamMemberSubCategoryList, teamMemberSubCategoryObj } from "./d_dept";

const run = async () => {

    const a = 19246 + 24016;
    let b = 0;

    const isAlert = new Array(101).fill(false)
    for (let i = 1; i < isAlert.length; i *= 5) isAlert[i] = true

    const process = () => {
        b++
        const currentPercent = Math.floor((b / a) * 100)

        if (isAlert[currentPercent] && currentPercent % 5 === 0) {
            console.log(`마이그레이션 작업 현황 ${currentPercent}%`)
            isAlert[currentPercent] = false
        }

        if (a === b) clearInterval(s)
    }

    let s = setInterval(() => {
        process()
    }, 10);

    console.log(1)
}

export default run