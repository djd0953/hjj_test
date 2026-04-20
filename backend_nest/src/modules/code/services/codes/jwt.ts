import * as jwt from "jsonwebtoken";

interface JwtTemplateData {
    id: number;
    user_ip: string;
    user_agent: string;
}

export const jwtVerify = () => {
    const secretKey = "secret_key";
    const data: JwtTemplateData = {
        id: 5244,
        user_ip: "210.218.228.234",
        user_agent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
    };

    try {
        const token = jwt.sign(data, secretKey);
        const decodeToken = jwt.verify(token, secretKey);

        return { token, data: decodeToken };
    } catch (err) {
        console.log(err);
        return null;
    }
};
