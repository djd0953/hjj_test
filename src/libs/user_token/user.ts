import jwt from 'jsonwebtoken'

interface userEntity 
{
    u_id: string,
    id?: number
    team_id?: number,
    multi_team_id?: number,
    base_url?: string,
    account_type?: number,
    email?: string,
    company_name: '',
    office_name: '',
    is_approved: '',

    is_admin?: number,
    admin_permission: string,
    ims_peermission: string,
    ims_permission: number

    name: string,
    type?: number
    
    team: 
    {
        id?: number,
        base_url?: string
    }
}

const getToken = (user: userEntity) => {
    const u = {
        u_id: crypto.randomUUID().split('-')[0],
        idusers: user.id,
        team_id: user.team_id,
        multi_team_id: user.multi_team_id,
        base_url: user.team?.base_url,
        username: user.name,
        account_type: user.type,
        email: user.email,
        company_name: '',
        office_name: '',
        is_approved: '',
    
        is_admin: user.is_admin === 2,
        admin_permission: user.admin_permission,
        ims_permission: user.ims_permission,
    }

    return jwt.sign(u, process.env.JWT_KEY as string, {
        expiresIn: '7d',
        issuer: 'lawform',
    })
}

const run = async () => {
    const userJson = "{\"id\":[186788],\"team_id\":[294],\"name\":[\"테스터\"],\"type\":[\"P\"],\"email\":[\"tester@amicuslex.net\"]}"
    const user = JSON.parse(userJson)
    const a = getToken(user)

    console.log(1)
}

export default run