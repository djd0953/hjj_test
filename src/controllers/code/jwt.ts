import jwt from 'jsonwebtoken';

export default async () => 
{
    const secretKey = 'secret_key';
    const data =
    {
        id: 5244,
        user_ip: '210.218.228.234',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
    };
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTI0NCwidXNlcl9pcCI6IjIxMC4yMTguMjI4LjIzNCIsInVzZXJfYWdlbnQiOiJNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF8xNV83KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTM5LjAuMC4wIFNhZmFyaS81MzcuMzYiLCJpYXQiOjE3NjQ5MTA3NzgsImV4cCI6MTc2NDkxMDgwOCwiaXNzIjoid2hvX2lzc3VlciJ9.EFOyVaDan4hVqjiBLf3BrvZEKkgLJH51uHph51PsOQc`;

    // return jwt.sign(data, secretKey, { expiresIn: '30s', issuer: 'who_issuer' });
    return await jwt.verify(token, secretKey);
};