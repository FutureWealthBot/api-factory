#!/bin/bash

# Utility functions for the auto-build project

# Function to print a message in green
print_success() {
    echo -e "\033[0;32m$1\033[0m"
}

# Function to print a message in red
print_error() {
    echo -e "\033[0;31m$1\033[0m"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create a directory if it doesn't exist
create_directory() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        print_success "Created directory: $1"
    else
        print_error "Directory already exists: $1"
    fi
}

# Function to copy a file if it doesn't exist
copy_file_if_not_exists() {
    if [ ! -f "$2" ]; then
        cp "$1" "$2"
        print_success "Copied $1 to $2"
    else
        print_error "File already exists: $2"
    fi
}