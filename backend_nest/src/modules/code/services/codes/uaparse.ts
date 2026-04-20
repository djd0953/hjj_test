import * as uaParser from "ua-parser-js";

export const uaparse = () => {
    const ua =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

    // const parser = new uaParser.UAParser();
    // parser.setUA(ua);

    return { ua };
};
