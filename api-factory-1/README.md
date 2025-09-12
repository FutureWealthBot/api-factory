# API Factory

## Overview
API Factory is a TypeScript-based application designed to provide a robust and scalable API. This project serves as a template for building RESTful APIs with a clear separation of concerns, utilizing controllers, services, models, and middleware.

## Project Structure
The project is organized into the following directories:

- **src/**: Contains the source code of the application.
  - **controllers/**: Handles incoming requests and responses.
  - **services/**: Contains business logic and data manipulation.
  - **models/**: Defines the structure of the data used in the application.
  - **routes/**: Sets up the API routes and connects them to controllers.
  - **middlewares/**: Contains middleware functions for request processing.
  - **config/**: Holds configuration settings for the application.

- **scripts/**: Contains scripts for building and starting the application.
  - **build.sh**: Compiles TypeScript files to JavaScript.
  - **start.sh**: Runs the compiled JavaScript files.

- **tests/**: Contains test cases for the API endpoints.

- **.devcontainer/**: Configuration for the development container.

- **Dockerfile**: Instructions for building a Docker image for the application.

- **package.json**: Lists dependencies and scripts for the project.

- **tsconfig.json**: TypeScript compiler options and file inclusion.

- **.env.example**: Example of environment variables used in the application.

## Getting Started

### Prerequisites
- Node.js and npm installed on your machine.
- Docker (if you plan to use the Dockerfile).

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd api-factory
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the Application
To build and start the application, you can use the provided scripts:

- To build the application:
  ```
  ./scripts/build.sh
  ```

- To start the application:
  ```
  ./scripts/start.sh
  ```

### Testing
To run the tests, execute:
```
npm test
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.