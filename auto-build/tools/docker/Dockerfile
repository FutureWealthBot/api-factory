FROM ubuntu:24.04

# Set the working directory
WORKDIR /app

# Copy the package.json and install dependencies
COPY package.json ./
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code
COPY . .

# Set the entry point for the application
ENTRYPOINT ["bash", "src/main.sh"]