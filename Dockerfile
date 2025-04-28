# Use the official Nginx image
FROM nginx:alpine

# Set a label (optional)
LABEL maintainer="yourname@example.com"

# Remove the default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy your static files into the nginx html folder
COPY ./html /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
