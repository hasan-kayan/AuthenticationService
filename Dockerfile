# This is a Dockerfile for micro service application.
# Base image
FROM node:18.18.0-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . ./

# Run app
CMD [ "node", "index.js" ]