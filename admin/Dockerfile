# front/Dockerfile

# ---- Stage 1: Build ----
# Use an official Node.js runtime as a parent image (includes yarn)
FROM node:20-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock
# This leverages Docker cache - dependencies are only re-installed if these files change
COPY package.json ./
COPY yarn.lock ./

# Install dependencies using yarn install --frozen-lockfile (Yarn's equivalent of npm ci)
# This ensures installation strictly based on yarn.lock
RUN yarn install --frozen-lockfile 

# Copy the rest of the application source code
COPY . .

ARG VITE_API_URL
ARG VITE_CHROME_EXTENSION_ID
ARG VITE_OIDC_AUTHORITY
ARG VITE_OIDC_CLIENTID
ARG VITE_OIDC_REDIRECT_URI
ARG VITE_OIDC_POST_LOGOUT_REDIRECT_URI

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CHROME_EXTENSION_ID=${VITE_CHROME_EXTENSION_ID}
ENV VITE_OIDC_AUTHORITY=${VITE_OIDC_AUTHORITY}
ENV VITE_OIDC_CLIENTID=${VITE_OIDC_CLIENTID}
ENV VITE_OIDC_REDIRECT_URI=${VITE_OIDC_REDIRECT_URI}
ENV VITE_OIDC_POST_LOGOUT_REDIRECT_URI=${VITE_OIDC_POST_LOGOUT_REDIRECT_URI}

RUN echo "=== Env vars ===" && \
    echo "VITE_API_URL=${VITE_API_URL}" && \
    echo "VITE_CHROME_EXTENSION_ID=${VITE_CHROME_EXTENSION_ID}" && \
    echo "VITE_OIDC_AUTHORITY=${VITE_OIDC_AUTHORITY}" && \
    echo "VITE_OIDC_CLIENTID=${VITE_OIDC_CLIENTID}" && \
    echo "VITE_OIDC_REDIRECT_URI=${VITE_OIDC_REDIRECT_URI}" && \
    echo "VITE_OIDC_POST_LOGOUT_REDIRECT_URI=${VITE_OIDC_POST_LOGOUT_REDIRECT_URI}" && \
    echo "================================="

    
# Build the application using the build script from package.json
# Yarn automatically runs scripts defined in package.json
RUN yarn build 

# The build output will be in the /app/dist directory

# ---- Stage 2: Serve ----
# Use a lightweight Nginx image to serve the static files
FROM nginx:stable-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from the 'build' stage to Nginx's web root directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration file (same as before)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Command to run Nginx in the foreground when the container starts
CMD ["nginx", "-g", "daemon off;"]
