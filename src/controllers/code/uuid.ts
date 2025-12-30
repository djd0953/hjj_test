import { randomUUID } from "crypto";

export default async () => 
{
    const uuidv4 = randomUUID();
    return uuidv4;
};