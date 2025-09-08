// This file contains command-line interface functionalities related to the backend. 
// It may include functions to handle CLI commands.

import { program } from 'commander';

program
  .version('1.0.0')
  .description('API Factory CLI for managing backend operations');

program
  .command('start')
  .description('Start the Fastify server')
  .action(() => {
    console.log('Starting the Fastify server...');
    // Logic to start the server can be added here
  });

program
  .command('build')
  .description('Build the backend application')
  .action(() => {
    console.log('Building the backend application...');
    // Logic to build the application can be added here
  });

program.parse(process.argv);