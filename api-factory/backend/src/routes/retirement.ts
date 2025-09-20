import { FastifyInstance } from 'fastify';

export default async function retirementRoutes(fastify: FastifyInstance) {
  fastify.post('/api/v1/retirement/estimate', {
    schema: {
      body: {
        type: 'object',
        properties: {
          age: { type: 'number' },
          income: { type: 'number' },
          savings: { type: 'number' },
          retirementAge: { type: 'number' }
        },
        required: ['age','income','savings','retirementAge']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            monthlySavingsNeeded: { type: 'number' },
            targetSavings: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { age, income, savings, retirementAge } = request.body as any;
    // simple heuristic: target = 25 * desired annual expenses (use 80% of income as estimate)
    const yearsToRetire = Math.max(0, retirementAge - age);
    const desiredAnnual = income * 0.8;
    const target = desiredAnnual * 25;
    const required = Math.max(0, target - savings);
    const months = Math.max(1, yearsToRetire * 12);
    const monthlySavingsNeeded = required / months;
    return reply.send({ monthlySavingsNeeded, targetSavings: target });
  });
}
