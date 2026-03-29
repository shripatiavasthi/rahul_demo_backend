const {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { getS3Client, getS3Bucket, getS3Region } = require("../config/s3");

const buildPublicUrl = (key) =>
  `https://${getS3Bucket()}.s3.${getS3Region()}.amazonaws.com/${encodeURIComponent(key).replace(/%2F/g, "/")}`;

const normalizeFolder = (value = "uploads") =>
  value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "") || "uploads";

const listFiles = async (req, res) => {
  try {
    const s3 = getS3Client();
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: getS3Bucket(),
        MaxKeys: 50
      })
    );

    return res.status(200).json({
      success: true,
      message: "Files fetched successfully",
      data: response.Contents || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch files from S3",
      error: error.message
    });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { fileName, content, contentType, folder } = req.body;

    if (!fileName || !content) {
      return res.status(400).json({
        success: false,
        message: "fileName and content are required"
      });
    }

    const s3 = getS3Client();
    const buffer = Buffer.from(content, "base64");
    const key = `${normalizeFolder(folder)}/${Date.now()}-${fileName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: getS3Bucket(),
        Key: key,
        Body: buffer,
        ContentType: contentType || "application/octet-stream"
      })
    );

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        key,
        bucket: getS3Bucket(),
        region: getS3Region(),
        url: buildPublicUrl(key)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload file to S3",
      error: error.message
    });
  }
};

const getFileUrl = async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "key query parameter is required"
      });
    }

    const s3 = getS3Client();
    const command = new GetObjectCommand({
      Bucket: getS3Bucket(),
      Key: key
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return res.status(200).json({
      success: true,
      message: "Signed URL generated successfully",
      data: {
        key,
        url
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate signed URL",
      error: error.message
    });
  }
};

module.exports = {
  listFiles,
  uploadFile,
  getFileUrl
};
