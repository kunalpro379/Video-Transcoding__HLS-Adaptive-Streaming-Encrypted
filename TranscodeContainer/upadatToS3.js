const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

 async  function uploadToS3(playlistFiles){
    for(let resolution of RESOLUTIONS){
        const hlsDir=path.resolve('transcoded', resolution.name, 'hls');
        const files=fs.readdirSync(hlsDir);
        //upload segements and playlist to s3
        for(let file of files){
            const filePath=path.join(hlsDir, file);
            const putCommand=new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: `${resolution.name}/${file}`,
                Body: fs.createReadStream(filePath)
            });
            await s3Client.send(putCommand);
            console.log(`Uploaded ${file} to S3`);
        }
    }
}
module.exports={uploadToS3};