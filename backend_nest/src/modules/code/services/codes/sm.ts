import { SMService } from "@lib/aws/services/sm.service";

export const smTest = async (smService: SMService) => {
    await smService.load();
    return null;
};
