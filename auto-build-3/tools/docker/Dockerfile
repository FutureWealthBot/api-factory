FROM ubuntu:24.04

# Set the working directory
WORKDIR /app

# Copy the necessary files
COPY ./src /app/src
COPY ./scripts /app/scripts
COPY ./package.json /app/package.json

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install npm dependencies
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs && \
    npm install

# Expose the necessary port (if applicable)
# EXPOSE 3000

# Command to run the application
CMD ["bash", "/app/scripts/build.sh"]