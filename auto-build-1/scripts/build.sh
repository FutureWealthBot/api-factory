#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")/../.."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Check for build success
if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
fi

echo "Build completed successfully!"