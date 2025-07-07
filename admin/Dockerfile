# Use a newer Node.js version
FROM node:20

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first
COPY package.json ./

# Install dependencies using npm ci for reproducible builds
RUN npm install

# Copy the rest of the project files
COPY . .

# Set environment variables
ENV HOST 0.0.0.0

# Expose the port (for Vite or similar)
EXPOSE 5173

# Run the development server
CMD ["npm", "run", "dev", "--", "--host"]
