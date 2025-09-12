#!/bin/bash

# Main script for orchestrating the execution of other scripts and tasks

# Source helper functions
source ../tools/helpers/helper.sh

# Function to run the build process
run_build() {
    echo "Starting build process..."
    ./scripts/build.sh
}

# Function to run tests
run_tests() {
    echo "Running tests..."
    ./scripts/test.sh
}

# Function to handle release
run_release() {
    echo "Starting release process..."
    ./scripts/release.sh
}

# Main execution flow
case "$1" in
    build)
        run_build
        ;;
    test)
        run_tests
        ;;
    release)
        run_release
        ;;
    *)
        echo "Usage: $0 {build|test|release}"
        exit 1
        ;;
esac

exit 0