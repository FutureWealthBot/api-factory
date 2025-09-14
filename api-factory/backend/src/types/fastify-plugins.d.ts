// Ambient declarations for optional Fastify OpenAPI plugins
// These packages are dynamically imported at runtime when USE_OPENAPI=1
// and may be absent in some environments. Declaring them prevents TypeScript
// from erroring during a full `tsc` run.

declare module '@fastify/swagger';
declare module '@fastify/swagger-ui';
