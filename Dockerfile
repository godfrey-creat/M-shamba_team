FROM nginx:alpine

# Create a non-root user to own the files and run our server
RUN adduser -D -u 1000 appuser

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY ./paste.txt index.html

# Make sure files are owned by the non-root user
RUN chown -R appuser:appuser /usr/share/nginx/html

# Configure nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]