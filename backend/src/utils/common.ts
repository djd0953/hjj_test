import { API_ERROR_CODE } from "@error/constants/error.const";
import { ApiError } from "@error/services/error.service";

export const getJsonObjectOrThrow = <T>(str: unknown): T => {
    if (typeof str !== "string") throw new ApiError(API_ERROR_CODE.INVALID_JSON);

    try {
        const obj = JSON.parse(str) as T;
        return obj;
    } catch {
        throw new ApiError(API_ERROR_CODE.INVALID_JSON);
    }
};

export const getJsonObjectOrNull = <T>(str: unknown): T | null => {
    if (typeof str !== "string") return null;

    try {
        const obj = JSON.parse(str) as T;
        return obj;
    } catch {
        return null;
    }
};
