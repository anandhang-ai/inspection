FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
