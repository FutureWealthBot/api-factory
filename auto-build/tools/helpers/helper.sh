#!/bin/bash

# Helper functions for auto-build scripts

function log_info() {
    echo "[INFO] $1"
}

function log_error() {
    echo "[ERROR] $1" >&2
}

function check_command() {
    command -v "$1" >/dev/null 2>&1 || { log_error "$1 is not installed."; exit 1; }
}

function wait_for_process() {
    local pid=$1
    wait "$pid"
    local status=$?
    if [ $status -ne 0 ]; then
        log_error "Process $pid failed with status $status."
        exit $status
    fi
}