# Start from a base image
FROM ubuntu:focal

# Install dependencies
RUN apt-get update && \
    apt-get install -y curl nodejs npm ffmpeg && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash && \
    apt-get install -y awscli

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for npm install
COPY package.json . 

# Install npm dependencies
RUN npm install

# Copy necessary application files
COPY index.js . 
COPY .env .env
COPY main.sh . # Ensure your shell script is copied

# Set the entrypoint to run the index.js with Node.js
ENTRYPOINT ["node", "index.js"]
