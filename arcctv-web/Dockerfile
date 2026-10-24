## First stage where we provide the base image to use as 'build-stage'.
FROM node:20.19.5  AS build-stage

# Label set by the Dockerfile creator.
LABEL mantainer="Abdul Razak Subahan <arsubahan@yahoo.com>"

# Create the container's working directory.
WORKDIR /arcctvapp/arcctv-web

# Install Angular CLI globally
RUN npm install -g @angular/cli@18

# Copy project dependencies for Angular. 
COPY package*.json ./


# Execute dependencies within the container. 
#RUN npm cache clean --force

# Install each dependency listed in .json.
RUN npm ci --legacy-peer-deps

# Copy all frontend files.
COPY . .

# Build the Angular arcctvapp for production

# Build the Angular arcctvapp for production
#RUN ng build  --configuration=development

# Command to build the arcctvapplication within the container.
RUN npm run build

RUN apt-get update && apt-get upgrade -y 

# Install FFmpeg and necessary system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

 RUN  apt-get install -y ffmpeg

# Second stage where we use the nginx base image to create a proxy for request redirection.
FROM nginx:1.29.2

# Copy the output from the first scenario, containing static HTML pages for nginx.
COPY --chown=nginx:nginx --from=build-stage /arcctvapp/arcctv-web/dist/arcctv-web/ /usr/share/nginx/html


# Copy the 'nginx.conf' file to the specified path.
 COPY nginxcctv.conf /etc/nginx/conf.d/nginxcctv.conf
 COPY nginx.conf /etc/nginx/nginx.conf



 EXPOSE 80
 EXPOSE 3200

 #CMD ["ng", "serve", "--host", "0.0.0.0"]
#CMD ["nginx", "-g", "daemon off;"]
# Start Nginx directly with custom config
#ENTRYPOINT ["nginx", "-c", "conf.d/nginx.conf"]
#CMD ["-g", "daemon off;"]
