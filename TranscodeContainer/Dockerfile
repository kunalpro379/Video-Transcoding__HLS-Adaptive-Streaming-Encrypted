FROM node:18-alpine AS base

RUN apk update && apk upgrade

RUN apk add --no-cache ffmpeg curl
# RUN apt-get update && apt-get install -y \
#     yasm \
#     pkg-config \
#     libx264-dev \
#     libx265-dev \
#     libvpx-dev \
#     && rm -rf /var/lib/apt/lists/*
# RUN apk update && apk upgrade && apk add --no-cache \
#     ffmpeg \
#     ffmpeg-dev \
#     curl \
#     yasm \
#     pkgconfig \
#     libvpx-dev \
#     libx264 \
#     libx265-dev \
#     && rm -rf /var/cache/apk/*

# RUN /user/bin/apt-get install -y curl 
# RUN curl -sL https://deb.nodesource.com/setup_18.x | bash
# RUN /usr/bin/apt-get update
# RUN /usr/bin/apt-get upgrade -y 
# RUN /usr/bin/apt-get install -y nodejs ffmpeg
# RUN apk add --no-cache \
#     ffmpeg \
#     ffmpeg-dev \
#     curl \
#     yasm \
#     pkgconfig \
#     libvpx-dev \
#     bash \
#     && apk add --no-cache --virtual .build-deps \
#     gcc \
#     g++ \
#     make \
#     && apk add --no-cache libx264
WORKDIR /app
COPY videos ./videos
COPY transcoded ./transcoded

COPY package.json . 
COPY package-lock.json .

RUN npm install

COPY index.js .
COPY upadatToS3.js .
COPY VideoTranscodeAndHLS.js .
COPY .env .env

CMD ["npm", "start"]
# ENTRYPOINT [ "bash" ]
