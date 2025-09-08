# This file provides documentation for the API Factory SDK.

# API Factory SDK

The API Factory SDK is a TypeScript library designed to facilitate interaction with the API Factory service. This SDK provides a set of classes and functions that simplify the process of making API calls and handling responses.

## Installation

To install the SDK, you can use npm or yarn:

```bash
npm install @api-factory/sdk-ts
```

or

```bash
yarn add @api-factory/sdk-ts
```

## Usage

To use the SDK, import the necessary classes and functions from the package:

```typescript
import { ApiFactoryClient } from '@api-factory/sdk-ts';

// Initialize the client
const client = new ApiFactoryClient({
  apiKey: 'YOUR_API_KEY',
  // other configuration options
});

// Example: Fetch health status
async function fetchHealth() {
  const healthStatus = await client.health();
  console.log(healthStatus);
}
```

## Scripts

The SDK includes several scripts to assist with development and deployment:

- **gen**: Generates the SDK client from the OpenAPI specification.
- **build**: Compiles the TypeScript files and runs the bundling script.
- **prepublishOnly**: Ensures that the build script runs before publishing the package.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.