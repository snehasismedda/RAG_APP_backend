import { generatePresignedUrl } from '../services/aws_service/s3Service.js';

export const getPresignedUrl = async (req, res) => {
    const { fileName, fileType } = req.body;
    const userId = req.user.id;

    if (!fileName || !fileType) {
        return res.status(400).json({ error: 'fileName and fileType are required' });
    }

    try {
        const data = await generatePresignedUrl({ fileName, fileType, userId });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};