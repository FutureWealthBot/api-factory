import type { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const SDK_TEMPLATES_DIR = path.resolve(__dirname, '../../../../packages/admin/agent-templates/sdk');
const METADATA_FILE = path.join(SDK_TEMPLATES_DIR, 'metadata.json');

type SdkTemplateMeta = {
  id: string;
  name: string;
  language: string;
  tags: string[];
  author: string;
  votes: number;
  createdAt: string;
  file: string;
};

function readMetadata(): SdkTemplateMeta[] {
  if (!fs.existsSync(METADATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
}
function writeMetadata(data: SdkTemplateMeta[]) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2));
}

export default async function sdkTemplatesRoutes(fastify: FastifyInstance) {
  // Upload a new SDK template (JSON body, base64 file for simplicity)
  fastify.post('/sdk-templates/upload', async (request, reply) => {
    const body = request.body as Record<string, unknown> | undefined;
    const name = body?.name as string | undefined;
    const language = body?.language as string | undefined;
    const tags = body?.tags as string | undefined;
    const author = body?.author as string | undefined;
    const fileContent = body?.fileContent as string | undefined;
    const fileName = body?.fileName as string | undefined;
    if (!name || !language || !fileContent || !fileName) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }
    const safeName = name as string;
    const safeLanguage = language as string;
    const safeFileContent = fileContent as string;
    const safeFileName = fileName as string;
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const filePath = path.join(SDK_TEMPLATES_DIR, `${id}-${safeFileName}`);
    fs.writeFileSync(filePath, Buffer.from(safeFileContent, 'base64'));
    const parsedTags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [];
    const meta: SdkTemplateMeta = {
      id,
      name: safeName,
      language: safeLanguage,
      tags: parsedTags,
      author: (author as string) || 'unknown',
      votes: 0,
      createdAt,
      file: filePath,
    };
    const all = readMetadata();
    all.push(meta);
    writeMetadata(all);
    reply.send({ status: 'ok', id });
  });

  // List all SDK templates
  fastify.get('/sdk-templates', async (request, reply) => {
    const all = readMetadata();
    reply.send({ status: 'ok', templates: all });
  });

  // Upvote/downvote a template (with min 0 votes)
  fastify.post('/sdk-templates/:id/vote', async (request, reply) => {
    const params = request.params as Record<string, string> | undefined;
    const body = request.body as Record<string, unknown> | undefined;
    const id = params?.id as string | undefined;
    const delta = body?.delta as number | undefined; // +1 or -1
    const all = readMetadata();
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) return reply.status(404).send({ error: 'Not found' });
  // Guard against undefined and ensure votes is numeric
  const template = all[idx];
  if (!template) return reply.status(500).send({ error: 'Internal error' });
  template.votes = Math.max(0, (typeof template.votes === 'number' ? template.votes : 0) + (delta === -1 ? -1 : 1));
  writeMetadata(all);
  reply.send({ status: 'ok', votes: template.votes });
  });

  // Get details for a specific template
  fastify.get('/sdk-templates/:id', async (request, reply) => {
    const params = request.params as Record<string, string> | undefined;
    const id = params?.id as string | undefined;
    const all = readMetadata();
    const found = all.find(t => t.id === id);
    if (!found) return reply.status(404).send({ error: 'Not found' });
    reply.send({ status: 'ok', template: found });
  });
}
