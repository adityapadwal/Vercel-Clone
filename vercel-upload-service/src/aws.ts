import { S3 } from "aws-sdk";
import fs from "fs";

// Importing dotenv for the API Keys
require("dotenv").config();

// replace with your own credentials
const s3 = new S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
})

// fileName => output\\rkwl8\\src\\App.jsx
// localFilePath => A:\\Web Development\\Full Stack Projects\\Vercel Clone\\vercel\\dist\\output\\rkwl8\\src\\App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "aditya-vercel-clone",
        Key: fileName,
    }).promise();
    console.log(response); // debugging...
}