const { S3Client } = require("@aws-sdk/client-s3");

let cachedS3Client = global.s3Client;

if (!cachedS3Client) {
  cachedS3Client = global.s3Client = null;
}

const getEnvValue = (key) => process.env[key] && process.env[key].trim();

const getS3Client = () => {
  const requiredVars = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_REGION",
    "S3_BUCKET"
  ];

  const missingVars = requiredVars.filter((key) => !getEnvValue(key));

  if (missingVars.length > 0) {
    throw new Error(`Missing S3 environment variables: ${missingVars.join(", ")}`);
  }

  if (cachedS3Client) {
    return cachedS3Client;
  }

  cachedS3Client = new S3Client({
    region: getEnvValue("S3_REGION"),
    credentials: {
      accessKeyId: getEnvValue("AWS_ACCESS_KEY_ID"),
      secretAccessKey: getEnvValue("AWS_SECRET_ACCESS_KEY")
    }
  });

  return cachedS3Client;
};

module.exports = {
  getS3Client,
  getS3Bucket: () => getEnvValue("S3_BUCKET"),
  getS3Region: () => getEnvValue("S3_REGION")
};
