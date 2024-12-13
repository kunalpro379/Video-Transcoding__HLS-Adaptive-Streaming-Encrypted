const { execSync } = require('child_process');
const path = require('path');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const bucket = process.env.S3_BUCKET;
const key = process.env.S3_KEY;
const videoPath = '/home/app/video.mp4';
const transcodedFolder = '/home/app/transcoded/';

const downloadFromS3 = async () => {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  
  const file = fs.createWriteStream(videoPath);
  const data = await s3Client.send(new GetObjectCommand(params));
  data.Body.pipe(file);

  return new Promise((resolve, reject) => {
    file.on('finish', resolve);
    file.on('error', reject);
  });
};

const uploadToS3 = async () => {
  const files = fs.readdirSync(transcodedFolder);
  const fileNameWithoutExt = path.basename(key, path.extname(key));

  return Promise.all(
    files.map(async (file) => {
      const filePath = path.join(transcodedFolder, file);
      const params = {
        Bucket: bucket,
        Key: `streamed/${fileNameWithoutExt}/${file}`,
        Body: fs.createReadStream(filePath),
      };

      await s3Client.send(new PutObjectCommand(params));
    })
  );
};

const main = async () => {
  try {
    console.log('Downloading video from S3...');
    await downloadFromS3();
    console.log('Download complete.');

    console.log('Starting transcoding...');
    execSync('bash /home/app/main.sh', { stdio: 'inherit' });
    console.log('Transcoding complete.');

    console.log('Uploading transcoded files to S3...');
    await uploadToS3();
    console.log('Upload complete.');

    // Step 4: Cleanup
    console.log('Cleaning up...');
    execSync('docker container rm -f $(hostname)', { stdio: 'inherit' });
    console.log('Container removed.');
    
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
};

main();
