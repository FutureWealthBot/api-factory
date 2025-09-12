#!/bin/bash

# Build the TypeScript files to JavaScript
echo "Building the application..."

# Compile TypeScript files
tsc

# Check if the build was successful
if [ $? -eq 0 ]; then
  echo "Build completed successfully."
else
  echo "Build failed."
  exit 1
fi