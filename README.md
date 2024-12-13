Video Transcoding and S3 Upload Automation
Overview
This project automates the video transcoding process by downloading videos from AWS S3, converting them to multiple resolutions, and uploading the transcoded files back to S3. It supports creating multiple video formats including MP4 and HLS (HTTP Live Streaming).
Features

Download videos from AWS S3
Transcode videos to multiple resolutions:

240p
480p
720p
1080p
1440p


Convert videos to HLS format
Automatic upload of transcoded files to S3
Cleanup of temporary local files

Prerequisites
Before getting started, ensure you have the following:

AWS Account
AWS S3 Bucket for source and transcoded videos
Node.js (v18.x or above)
NPM
FFmpeg
AWS CLI (optional, but recommended)

Installation

Clone the repository:
bashCopygit clone <your-repo-url>
cd <project-directory>

Install dependencies:
bashCopynpm install


Configuration
Create a .env file in the project root with the following environment variables:
envCopyAWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET=your_source_bucket_name
TRANSCODED_S3_BUCKET=your_transcoded_bucket_name
S3_KEY=path/to/your/source/video.mp4
AWS S3 Setup

Create two S3 buckets:

One for source videos
One for transcoded videos


Configure IAM Permissions:
Create an IAM policy with the following permissions:

s3:GetObject
s3:PutObject



Docker Support
A Dockerfile is provided to containerize the application. To build and run:
bashCopy# Build the Docker image
docker build -t video-transcoder .

# Run the container
docker run -env-file .env video-transcoder
Transcoding Process
The script performs the following steps:

Download video from S3
Transcode video to:

Multiple MP4 resolutions
HLS format


Upload transcoded files to S3
Clean up temporary local files

Troubleshooting
Common Issues

FFmpeg Errors: Verify FFmpeg installation
bashCopyffmpeg -version

AWS Credentials: Ensure correct environment variables
Permissions: Check IAM user S3 bucket permissions

Technologies Used

Node.js
AWS SDK
FFmpeg
Docker

Contributing

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request


Convert videos to HLS format
Automatic upload of transcoded files to S3
Cleanup of temporary local files

Prerequisites
Before getting started, ensure you have the following:

AWS Account
AWS S3 Bucket for source and transcoded videos
Node.js (v18.x or above)
NPM
FFmpeg
AWS CLI (optional, but recommended)

Installation

Clone the repository:
bashCopygit clone <your-repo-url>
cd <project-directory>

Install dependencies:
bashCopynpm install


Configuration
Create a .env file in the project root with the following environment variables:
envCopyAWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET=your_source_bucket_name
TRANSCODED_S3_BUCKET=your_transcoded_bucket_name
S3_KEY=path/to/your/source/video.mp4
AWS S3 Setup

Create two S3 buckets:

One for source videos
One for transcoded videos


Configure IAM Permissions:
Create an IAM policy with the following permissions:

s3:GetObject
s3:PutObject



Docker Support
A Dockerfile is provided to containerize the application. To build and run:
bashCopy# Build the Docker image
docker build -t video-transcoder .

# Run the container
docker run -env-file .env video-transcoder
Transcoding Process
The script performs the following steps:

Download video from S3
Transcode video to:

Multiple MP4 resolutions
HLS format


Upload transcoded files to S3
Clean up temporary local files

Troubleshooting
Common Issues

FFmpeg Errors: Verify FFmpeg installation
bashCopyffmpeg -version

AWS Credentials: Ensure correct environment variables
Permissions: Check IAM user S3 bucket permissions

Technologies Used

Node.js
AWS SDK
FFmpeg
Docker

Contributing

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request