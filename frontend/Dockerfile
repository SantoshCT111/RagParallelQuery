# File: frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with CI=false to avoid treating warnings as errors
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Generate the Tailwind CSS
RUN npx tailwindcss -i ./src/tailwind.css -o ./src/tailwind.output.css

# Add a build script to rebuild Tailwind CSS on start
RUN echo '#!/bin/sh\nnpx tailwindcss -i ./src/tailwind.css -o ./src/tailwind.output.css\nnpm start' > /app/start.sh && \
    chmod +x /app/start.sh

# Expose the port the React app runs on
EXPOSE 3000

# Start the application with our custom script
CMD ["/app/start.sh"]
