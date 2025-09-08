# API Factory

## Overview
The API Factory project consists of a backend application built with Fastify and a frontend admin interface developed using Vite, React, and TypeScript. This project structure allows for a clear separation of concerns between the backend API and the frontend user interface.

## Project Structure
```
api-factory
├── backend          # Contains the Fastify backend application
│   ├── src         # Source files for the backend
│   │   ├── cli.ts  # Command-line interface functionalities
│   │   ├── server.ts # Entry point for the Fastify server
│   │   └── routes   # API route definitions
│   │       └── index.ts
│   ├── package.json # Backend dependencies and scripts
│   ├── tsconfig.json # TypeScript configuration for the backend
│   └── README.md    # Documentation for the backend
├── admin           # Contains the Vite + React + TypeScript admin application
│   ├── src         # Source files for the admin application
│   │   ├── main.tsx # Entry point for the React application
│   │   ├── App.tsx  # Main application component
│   │   └── components # Various React components
│   │       └── index.tsx
│   ├── public      # Public assets for the admin application
│   │   └── index.html # Main HTML file for the React application
│   ├── package.json # Admin application dependencies and scripts
│   ├── tsconfig.json # TypeScript configuration for the admin application
│   ├── vite.config.ts # Vite configuration for the admin application
│   └── README.md    # Documentation for the admin application
└── README.md        # Documentation for the overall project
```

## Getting Started

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies using:
   ```
   npm install
   ```
3. Start the Fastify server:
   ```
   npm run start
   ```

### Admin
1. Navigate to the `admin` directory.
2. Install dependencies using:
   ```
   npm install
   ```
3. Start the Vite development server:
   ```
   npm run dev
   ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.