const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const RESOLUTIONS = [
    { name: "240p", width: 426, height: 240 },
    { name: "480p", width: 854, height: 480 },
    { name: "720p", width: 1280, height: 720 },
    { name: "1080p", width: 1920, height: 1080 },
  ];


 async function TranscodeToHLS(originalVideoPath,resolution){

    const transcodedDir=path.resolve("transcoded", resolution.name);

    // if(!FileSystem.existsSync(transcodedDir)) FileSystem.mkdirSync(transcodedDir, {reccursive:true});
    if (!fs.existsSync(transcodedDir)) fs.mkdirSync(transcodedDir, { recursive: true });

    const outputDir=path.join(transcodedDir, 'hls');
    if(!fs.existsSync(outputDir))fs.mkdirSync(outputDir);
    

//file segment 
const outputFilePattern = path.join(outputDir, 'segment-%03d.ts');  
      // submaster file
      const playlistFile = path.join(outputDir, 'playlist.m3u8'); 
      return new Promise((resolve, reject)=>{
            ffmpeg(originalVideoPath)
            .output(playlistFile)
            .outputOptions([
                '-hls_time 10',//segement length in seconds
                '-hls_list_size 0',//inf playlist
                '-hls_segement_filename',outputFilePattern,//setting segment filename pattern
                '-c:v libx264',
                '-b:v 1M',
                '-c:a aac',
                '-b:a 192k',
                '-f hls',//hls format
            ])
            .audioCodec('libx264')
            .size(`${resolution.width}x${resolution.height}`)
            .on("end", async () => {
          console.log(`Transcoding finished for ${resolution.name}.`);
          try {
            const putCommand = new PutObjectCommand({
              Bucket: process.env.S3_BUCKET,
              Key: `transcoded/video-${resolution.name}.mp4`,
              Body: fs.createReadStream(playlistFile),
            });
            await s3Client.send(putCommand);
            console.log(`Uploaded ${playlistFile} to S3.`);
            resolve();
          } catch (err) {
            console.error(`Error uploading ${playlistFile}:`, err);
            reject(err);
          }
        })
        .on("error", (err) => {
          console.error(`Transcoding error for : ${resolution.name}:`, err);
          reject(err);
        })
            .run();
        });
        
  try {
    await Promise.all(promises);
    console.log("Video Transcoded ... ");
  } catch (err) {
    console.error("Error transcodnig video:", err);
  }
}
module.exports={TranscodeToHLS};