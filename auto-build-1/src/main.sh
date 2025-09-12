#!/bin/bash

# Main entry point for the application

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | xargs)
fi

# Execute tasks
source ./tasks/index.sh

# Call build script
./scripts/build.sh

# Call test script
./scripts/test.sh

# Call release script
./scripts/release.sh

echo "Build, test, and release process completed."