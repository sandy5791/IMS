FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build the application
COPY . .
RUN npx ng build --configuration production

# Serve with Nginx for single page apps
FROM nginx:alpine
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy compiled Angular app from build stage
COPY --from=build /app/dist/ims/browser /usr/share/nginx/html
# Copy custom nginx configuration for Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
