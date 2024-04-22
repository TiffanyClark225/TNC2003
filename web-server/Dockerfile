FROM node:20

# Create app directory
WORKDIR /usr/src/web-server

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port and start application
EXPOSE 3000
CMD [ "node", "app.js" ]
