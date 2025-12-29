import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const generatePresignedUrl = async ({ fileName, fileType }) => {
    const key = `uploads/${Date.now()}_${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
    });

    return { signedUrl, key };
};

export const getObjectStream = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });

    const { Body } = await s3Client.send(command);
    return Body;
};

export const getHeadObject = async (key) => {
    const command = new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });

    const response = await s3Client.send(command);
    return response;
};