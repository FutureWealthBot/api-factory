# API Factory Backend

This is the backend for the API Factory project, built using Fastify and TypeScript. The backend serves as the API layer for the application, handling requests and responses, and providing the necessary endpoints for the admin web application.

## Project Structure

- **src/**: Contains the source code for the backend.
  - **cli.ts**: Command-line interface functionalities related to the backend.
  - **server.ts**: Entry point for the Fastify server, initializes the server, sets up middleware, and defines routes.
  - **routes/**: Contains route definitions for the API.
    - **index.ts**: Exports functions that define the API routes.

## Getting Started

1. **Installation**: Make sure you have Node.js installed. Then, navigate to the backend directory and install the dependencies:

   ```bash
   cd backend
   npm install
   ```

2. **Running the Server**: You can start the Fastify server using the following command:

   ```bash
   npm run start
   ```

3. **CLI Commands**: If you have implemented any CLI commands in `cli.ts`, you can run them using:

   ```bash
   npm run cli
   ```

## API Documentation

Refer to the `routes/index.ts` file for the list of available API endpoints and their usage.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.