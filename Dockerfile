### STAGE 1:BUILD ###
# Extend Node's Alpine Image
FROM node:16-alpine AS build

# Create app directory
WORKDIR /usr/src/app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Initialize the Environment Argument
ARG NODE_ENV

# Build the App
RUN npm run build-${NODE_ENV}




### STAGE 2:RUN ###
# Defining nginx image to be used
FROM nginx:1.21.6-alpine

# Initialize the Argument
ARG NODE_ENV

# Copy package.json & package-lock.json
COPY package*.json ./

# Copying compiled code and nginx config to different folder
# NOTE: This path may change according to your project's output folder 
COPY --from=build /usr/src/app/dist/gui-${NODE_ENV} /usr/share/nginx/html
COPY /nginx.conf  /etc/nginx/conf.d/default.conf

# Exposing a port, here it means that inside the container 
# the app will be using Port 80 while running
EXPOSE 80