# We use the node base image for deploying the app.
FROM node:20.19.5 AS server

# Specify the creator of the Docker image.
LABEL maintainer="Abdul Razak Subahan<arsubahan@yahoo.com>"

# Create a working directory for the container. 
WORKDIR /arcctvapp/arcctv-server

# Copy all backend dependencies into the container.
COPY package*.json ./

# Install each dependency listed in .json.
RUN npm ci --legacy-peer-deps

#RUN apk add --no-cache ffmpeg

#RUN apt-get update && apt-get install -y ffmpeg

# Install FFmpeg and necessary system dependencies
RUN apt-get update 
RUN apt-get install -y  ffmpeg 
RUN rm -rf /var/lib/apt/lists/*


#RUN  apt-get install -y ffmpeg



# After installing all dependencies, copy all files located within the backend folder to the path /app. 
COPY . .

# The application listens on port 3060, so we expose it. 
EXPOSE 3250

# Command to start the backend within the container.
CMD ["npm", "start"]
