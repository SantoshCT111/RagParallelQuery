# File: frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the port the React app runs on
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "start"]
