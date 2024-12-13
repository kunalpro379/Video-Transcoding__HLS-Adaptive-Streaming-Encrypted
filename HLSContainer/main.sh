#!/bin/bash

if [ -z "$S3_BUCKET" ] || [ -z "$S3_KEY" ]; then
  echo "Missing S3 environment variables."
  exit 1
fi

echo "Waiting for download from S3 to be handled by Node.js..."

# Convert transcoded video to HLS format
ffmpeg -i /home/app/transcoded/video.mp4 \
       -c:v libx264 -preset veryfast -g 60 -sc_threshold 0 \
       -f hls -hls_time 4 -hls_playlist_type vod \
       /home/app/transcoded/output/playlist.m3u8

echo "Uploading HLS files to S3..."

# # Step 3: Clean up the HLS files from the container
# echo "Cleaning up HLS files..."
# rm -rf /home/app/transcoded/output

echo "Process completed!"

