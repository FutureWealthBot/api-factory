module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'], // Replace with your image domains
  },
  env: {
    CUSTOM_API_URL: process.env.CUSTOM_API_URL, // Example of custom environment variable
  },
  async rewrites() {
    return [
      {
        source: '/api/usage',
        destination: 'http://localhost:3001/api/usage',
      },
      {
        source: '/api/usage/:key',
        destination: 'http://localhost:3001/api/usage/:key',
      },
    ];
  },
};