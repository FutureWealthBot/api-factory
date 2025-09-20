// Ambient declarations for optional Fastify OpenAPI plugins and static
// These packages are dynamically imported at runtime when USE_OPENAPI=1
// (or when USE_DEV_FALLBACKS=0 for static) and may be absent in some
// environments. Declaring them with a minimal, correct shape prevents
// TypeScript from erroring during a full `tsc` run while providing useful
// types for plugin options.

import type { FastifyPluginAsync } from 'fastify';

declare module '@fastify/swagger' {
  import type { FastifyPluginAsync } from 'fastify';

  export type SwaggerOptions = {
    routePrefix?: string;
    swagger?: Record<string, any>;
    exposeRoute?: boolean;
    openapi?: Record<string, any>;
  };

  const swagger: FastifyPluginAsync<SwaggerOptions>;
  export default swagger;
  export = swagger;
}

declare module '@fastify/swagger-ui' {
  import type { FastifyPluginAsync } from 'fastify';

  export type SwaggerUiOptions = {
    routePrefix?: string;
    uiConfig?: Record<string, any>;
    uiHooks?: Record<string, any>;
    staticCSP?: boolean;
    transformSpec?: (spec: any, req?: any, reply?: any) => any;
  };

  const swaggerUi: FastifyPluginAsync<SwaggerUiOptions>;
  export default swaggerUi;
  export = swaggerUi;
}

declare module '@fastify/static' {
  import type { FastifyPluginAsync } from 'fastify';

  // Keep options permissive since multiple plugin versions may accept
  // slightly different option shapes across environments.
  const fastifyStatic: FastifyPluginAsync<Record<string, any>>;
  export default fastifyStatic;
  export = fastifyStatic;
}
