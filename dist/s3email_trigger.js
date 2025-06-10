"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const https = __importStar(require("https"));
const url = __importStar(require("url"));
//const https = require('https');
//const url = require('url');
//import axios from './node_modules/axios'
//const axios = require('axios');
//const axios = require('axios');
console.log('Loading function');
const s3 = new client_s3_1.S3();
const URL = "https://milk.api.lfdev.io/api/clm_log/create/email_reply";
const handler = async (event) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    try {
        const { Body } = await s3.getObject(params);
        console.log(await s3.getObject(params), "objecParam");
        const bodyContents = await streamToString(Body);
        // console.log(bodyContents, "bodyContents")
        const clm_id = getCLM_Id(bodyContents);
        const content = getEmailContent(bodyContents);
        console.log("clmId: ", clm_id, "\nemailContent: ", content);
        /* api call to insert a record in clm_log */
        const r = await logPost({ apiUrl: URL, clm_id, content: bodyContents })
            .then(result => console.log("api result = ", result))
            .catch(error => console.error(`${key} object from bucket ${bucket} shows ${error} and clm_id is ${clm_id} and content is ${content}`));
        return "success get key and object";
    }
    catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
exports.handler = handler;
const getCLM_Id = (bodyContents) => {
    const subjectPrefixStr = 'Subject: ';
    const subjectPrefixPos = bodyContents.lastIndexOf(subjectPrefixStr);
    const subjectSuffixStr = "\n";
    const subjectSuffixPos = bodyContents.indexOf(subjectSuffixStr, subjectPrefixPos);
    const subjectUTF8 = bodyContents.substring(subjectPrefixPos + subjectPrefixStr.length, subjectSuffixPos);
    const subjectUTF8_temp = subjectUTF8.replace(/^=\?UTF-8\?B\?|\?=$/g, '');
    const subjectBase64 = Buffer.from(subjectUTF8_temp, "base64").toString('utf8');
    const clmIdPrefixStr = ' [로폼 CLM] ';
    const clmIdPrefixPos = subjectBase64.lastIndexOf(clmIdPrefixStr);
    const clmIdSuffixStr = ' ';
    const clmIdSuffixPos = subjectBase64.indexOf(clmIdSuffixStr, clmIdPrefixPos + clmIdPrefixStr.length);
    const clmIdStr = subjectBase64.substring(clmIdPrefixPos + clmIdPrefixStr.length, clmIdSuffixPos);
    // 05.20 clm id 가 잘못 출력되고 있어 수정함 (sunwoo)
    const businesIdPrefixStr = '.business.';
    const businesIdPrefixPos = bodyContents.lastIndexOf(businesIdPrefixStr);
    const businesIdSuffixStr = ' ';
    const businesIdSuffixPos = bodyContents.indexOf(businesIdSuffixStr, businesIdPrefixPos);
    const businesIdUTF8 = bodyContents.substring(businesIdPrefixPos + businesIdPrefixStr.length, businesIdSuffixPos - 1);
    const businessId = businesIdUTF8.split('/')?.slice(-1)?.[0];
    console.log(businessId);
    // return clmIdStr;
    return businessId;
};
const getEmailContent = (bodyContents) => {
    const boundaryPreffixStr = "boundary=";
    const boundaryPreffixPos = bodyContents.indexOf(boundaryPreffixStr);
    const boundarySuffixStr = "\n";
    const boundarySuffixPos = bodyContents.indexOf(boundarySuffixStr, boundaryPreffixPos);
    const boundary = "--" + bodyContents.substring(boundaryPreffixPos + boundaryPreffixStr.length + 1, boundarySuffixPos - 2);
    const firstBoundaryPos = bodyContents.indexOf(boundary, boundarySuffixPos);
    const secondBoundaryPos = bodyContents.indexOf(boundary, firstBoundaryPos + boundary.length);
    const encodedContent = bodyContents.substring(firstBoundaryPos + boundary.length, secondBoundaryPos);
    const { encoding, content: pureEncodingContent } = getTransferEncoding(encodedContent);
    if (!encoding)
        return pureEncodingContent;
    const content = Buffer.from(pureEncodingContent, encoding).toString('utf8');
    return content;
};
const getTransferEncoding = (encodedContent) => {
    const encodingStr = "Content-Transfer-Encoding: ";
    const encodingStrPos = encodedContent.indexOf(encodingStr);
    if (encodingStrPos === -1) {
        return { encoding: '', content: encodedContent.substring(encodedContent.indexOf("\n"), encodedContent.length - 1) };
    }
    const encodingEndStr = "\n";
    const encodingEndPos = encodedContent.indexOf(encodingEndStr, encodingStrPos + encodingStr.length);
    const encoding = encodedContent.substring(encodingStrPos + encodingStr.length, encodingEndPos - 1);
    const pureEncodingContent = encodedContent.substring(encodingStrPos + encodingStr.length + encoding.length, encodedContent.length - 1);
    return { encoding, content: pureEncodingContent };
};
function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}
;
/*
const logPost = ({apiUrl, clm_id, content}) => {
    let headers = {
        'Content-Type': 'application/json',
    }
    let payload = { clm_id, content }
    return axios
        .post(apiUrl, JSON.stringify(payload), { headers: headers })
        .then((res) => {
            return { ...res.data, prob: false }
        })
        .catch((e) => console.error(e, clm_id, content))

}
*/
const logPost = ({ apiUrl, clm_id, content }) => {
    return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(apiUrl);
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const payload = JSON.stringify({ clm_id, content });
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ ...jsonData, prob: false });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
        req.on('error', (error) => {
            console.error(error, clm_id, content);
            reject(error);
        });
        req.write(payload);
        req.end();
    });
};
