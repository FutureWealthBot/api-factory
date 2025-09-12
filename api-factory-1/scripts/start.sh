#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")/../.."

# Build the application
./scripts/build.sh

# Start the application
node dist/index.js