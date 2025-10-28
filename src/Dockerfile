# Use official Node.js image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your source code
COPY . .

# Define a port where the service is exposed
EXPOSE 3000

# Start the generator
CMD ["node", "api.js"]
