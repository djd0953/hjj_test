import { randomUUID } from "crypto";

export const uuid = () => {
    const uuidv4 = randomUUID();
    return uuidv4;
};
