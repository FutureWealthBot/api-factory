#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")/../.."

# Set the version number (this can be modified as needed)
VERSION="1.0.0"

# Create a release directory if it doesn't exist
RELEASE_DIR="release"
mkdir -p "$RELEASE_DIR"

# Package the application (this example assumes a tarball)
tar -czf "$RELEASE_DIR/myapp-$VERSION.tar.gz" -C src .

# Optionally, publish to a repository (this is a placeholder)
# echo "Publishing to repository..."
# ./publish.sh "$RELEASE_DIR/myapp-$VERSION.tar.gz"

echo "Release package created at $RELEASE_DIR/myapp-$VERSION.tar.gz"