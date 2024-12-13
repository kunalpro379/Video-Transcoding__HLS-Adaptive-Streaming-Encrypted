//downlaod the original video
//start thje transcoder
//upload the video
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const ffmpeg = require("fluent-ffmpeg");
const path = require('path');
const util = require('util'); // For promisifying
require('dotenv').config();
const { finished } = require('stream'); // Import finished from stream

const RESOLUTIONS = [
  { name: "240p", width: 426, height: 240 },
  { name: "480p", width: 854, height: 480 },
  { name: "720p", width: 1280, height: 720 },
  { name: "1080p", width: 1920, height: 1080 },
  { name: "1440p", width: 2560, height: 1440 },
];

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'ap-south-1',
});

async function init() {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: process.env.S3_KEY,
  });
  const originalFileName = path.basename(process.env.S3_KEY);

  const result = await s3Client.send(command);
  const originalFilePath = `./${originalFileName}`;

  const transcodedDir = path.resolve("transcoded");
  if (!fs.existsSync(transcodedDir)) {
    fs.mkdirSync(transcodedDir, { recursive: true });
  }

  // Write the video to a file
  const fileStream = fs.createWriteStream(originalFilePath);
  result.Body.pipe(fileStream);

  await util.promisify(finished)(fileStream);

  console.log("Downloaded video successfully...");
  const originalVideoPath = path.resolve(originalFilePath);

  // Start the transcoding process
  const promises = RESOLUTIONS.map((resolution) => {
    // const output = path.join(transcodedDir, `video-${resolution.name}.mp4`);
    const output = path.join(transcodedDir, `${originalFileName}-${resolution.name}.mp4`);

    return new Promise((resolve, reject) => {
      ffmpeg(originalVideoPath)
        .output(output)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(`${resolution.width}x${resolution.height}`)
        .on("end", async () => {
          console.log(`Transcoding finished for ${resolution.name}.`);
          try {
            const putCommand = new PutObjectCommand({
              Bucket: process.env.TRANSCODED_S3_BUCKET,
              Key: `transcoded/${originalFileName}/${originalFileName}-${resolution.name}.mp4`,
              Body: fs.createReadStream(output),
            });
            await s3Client.send(putCommand);
            console.log(`Uploaded ${output} to S3.`);
            resolve();
          } catch (err) {
            console.error(`Error uploading ${output}:`, err);
            reject(err);
          }
        })
        .on("error", (err) => {
          console.error(`Transcoding error for : ${resolution.name}:`, err);
          reject(err);
        })
        .run();
    });
  });

  try {
    await Promise.all(promises);
    console.log("All transcoded videos uploaded successfully.");
  } catch (err) {
    console.error("Error during transcoding/upload process:", err);
  } finally {
    // Clean up local files if needed
    fs.rmSync(originalFilePath, { force: true });
    fs.rmSync(transcodedDir, { recursive: true, force: true });
  }
}

init().catch((err) => {
  console.error("Error...", err);
});


/*

//downlaod the original video
//start thje transcoder
//upload the video

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const ffmpeg = require("fluent-ffmpeg");
const path = require('path');
const util = require('util'); // For promisifying
require('dotenv').config();
const { finished } = require('stream'); // Import finished from stream

const { uploadToS3 } = require('./upadatToS3.js');
const { TranscodeToHLS } = require('./VideoTranscodeAndHLS.js');

const RESOLUTIONS = [
  { name: "240p", width: 426, height: 240 },
  { name: "480p", width: 854, height: 480 },
  { name: "720p", width: 1280, height: 720 },
  { name: "1080p", width: 1920, height: 1080 },
  { name: "1440p", width: 2560, height: 1440 },
];

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'ap-south-1',
});

async function init() {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: process.env.S3_KEY,
  });

  const result = await s3Client.send(command);
  const originalFilePath = `original-video.mp4`;

  const transcodedDir = path.resolve("transcoded");
  if (!fs.existsSync(transcodedDir)) {
    fs.mkdirSync(transcodedDir, { recursive: true });
  }

  // Write the video to a file
  const fileStream = fs.createWriteStream(originalFilePath);
  result.Body.pipe(fileStream);

  await util.promisify(finished)(fileStream);

  console.log("Downloaded video successfully...");
  const originalVideoPath = path.resolve(originalFilePath);

  // Start the transcoding and hls process
  const promises = RESOLUTIONS.map((resolution) => {
    const output = path.join(transcodedDir, `video-${resolution.name}.mp4`);
   
   
            return TranscodeToHLS(originalVideoPath,resolution);

    });
    try{
        const playlistFiles=await Promise.all(promises);
        console.log("HLS playlist generated for all resolutions....", playlistFiles);
        await uploadToS3(playlistFiles);
    }catch(e){
        console.log("Error in transcoding and hls process",e);
    }
}


init().catch((err) => {
  console.error("Error...", err);
});


*/