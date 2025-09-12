# Makefile for auto-build project

.PHONY: all build test release clean

all: build test release

build:
	@echo "Building the project..."
	./scripts/build.sh

test:
	@echo "Running tests..."
	./scripts/test.sh

release:
	@echo "Releasing the project..."
	./scripts/release.sh

clean:
	@echo "Cleaning up..."
	# Add commands to clean up build artifacts if necessary