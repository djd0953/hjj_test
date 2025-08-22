let jwt = require('jsonwebtoken')

export default async () => {
    const secretKey = 'dininglawform';
    const data =
    {
        id: 5244,
        user_ip: '210.218.228.234',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
    };

    console.time('aa')
    const token = jwt.sign(data, secretKey, {expiresIn: '7d', issuer: 'dining_brands'});
    const sso = await jwt.verify(token, 'dininglawform')

    console.timeEnd('aa')


    console.log(1);
}