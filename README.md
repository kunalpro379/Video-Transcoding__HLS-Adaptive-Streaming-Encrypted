# DRM protected Video Transcoding and HLS Streaming 

![WhatsApp Image 2024-12-13 at 05 53 06_707ea432](https://github.com/user-attachments/assets/9fe98287-1705-424d-bdaf-864b58766043)

## Overview
This project automates the video transcoding process by downloading videos from AWS S3, converting them to multiple resolutions, and uploading the transcoded files back to S3. It supports creating multiple video formats including MP4 and HLS (HTTP Live Streaming).



# Video Processing and Streaming Pipeline

This document outlines the **video processing and streaming pipeline** used to handle raw video uploads, video encoding, segmentation, encryption, and delivery through a Content Delivery Network (CDN). The process leverages AWS S3, SQS, FFMPEG, and HLS for efficient video management and adaptive streaming.

## Pipeline Workflow

### 1. Admin Uploads Raw Video
- **Admin Interface**: An administrator uploads a raw video file to an AWS **Temp Bucket** (temporary storage on S3).
- **Temp Bucket**: This bucket temporarily stores the raw video before any processing begins.

### 2. SQS Event Trigger
- **SQS (Simple Queue Service)**: Once the raw video is uploaded to the temp bucket, it triggers an event to a **process queue** (likely an SQS queue). This queue holds tasks or jobs for processing the video.

### 3. Video Processing Queue
- **Process Queue**: The SQS queue holds a task for processing the uploaded video. This task is picked up by the **Consumers** that are responsible for processing videos.

### 4. Consumers Poll the Queue
- **Consumers**: These are microservices or containers that constantly poll the process queue for new tasks. Each consumer fetches the video processing job, which can involve tasks like validation, encoding, and transformations.
- **Validations**: The consumer checks the uploaded video file for correctness (file type, no corruption, etc.).

### 5. Spinning Up FFMPEG for Video Processing
- **FFMPEG**: FFMPEG (a multimedia framework) is used to encode the video into multiple resolutions (360p, 420p, 720p, etc.) for adaptive streaming. Each resolution is converted into an M3U8 playlist file.
- **Node.js**: The video processing happens inside a Docker container with a Node.js environment (`node:18-alpine`).
- **FFMPEG Commands**: FFMPEG is used to process the video into different quality levels (e.g., 360p, 420p, 720p, 1080p), storing them as M3U8 files (a format used for HLS - HTTP Live Streaming).

### 6. Video Segmentation
- After encoding, FFMPEG splits the video into smaller chunks (e.g., `segment_001.ts`, `segment_002.ts`). These small segments are crucial for **adaptive bitrate streaming**, allowing users to switch between video qualities based on their network speed.

### 7. Production Bucket
- **Production Bucket**: After encoding and segmentation, the final video and its segments are stored in the **Production Bucket** on S3.
- This bucket holds all processed videos and files that are ready for delivery to users.

### 8. Master Index and HLS
- **Master Index**: A master playlist file that references all the different quality levels (360p, 420p, 720p, 1080p, etc.) and segments. This file serves as a central point for adaptive streaming.
- **HLS (HTTP Live Streaming)**: HLS is a streaming protocol that serves video content over HTTP. The M3U8 playlist file, along with the video segments, are essential for HLS delivery. The master index file is used by the client to determine which video segment to download based on the user's network speed.

### 9. Encryption
- **Encryption**: Before the video content is delivered, it may be encrypted for secure distribution. This process typically involves the use of encryption keys, often managed by AWS KMS (Key Management Service).

### 10. Content Delivery Network (CDN)
- **CDN**: The processed video files and segments are distributed through a **CDN** for efficient content delivery to end users. The CDN caches content in edge locations near the user, ensuring fast and low-latency video streaming.

### 11. User Content Viewer
- **User Interface**: End users access the videos through a content viewer. The videos are fetched from the CDN, which retrieves the appropriate video file or segment from the **Production Bucket**.

### 12. Admin Management
- **Admin Interface**: The admin interface allows administrators to manage and monitor the entire video processing pipeline. This includes tasks such as uploading new videos, tracking the status of the processing queue, and ensuring smooth operation.
