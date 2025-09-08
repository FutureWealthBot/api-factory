import { FastifyInstance } from 'fastify';
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
    const { name, language, tags, author, fileContent, fileName } = request.body as any;
    if (!name || !language || !fileContent || !fileName) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const filePath = path.join(SDK_TEMPLATES_DIR, `${id}-${fileName}`);
    fs.writeFileSync(filePath, Buffer.from(fileContent, 'base64'));
    const meta: SdkTemplateMeta = {
      id, name, language, tags: tags ? tags.split(',').map((t: string) => t.trim()) : [], author, votes: 0, createdAt, file: filePath
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
    const { id } = request.params as any;
    const { delta } = request.body as any; // +1 or -1
    const all = readMetadata();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return reply.status(404).send({ error: 'Not found' });
    all[idx].votes = Math.max(0, all[idx].votes + (delta === -1 ? -1 : 1));
    writeMetadata(all);
    reply.send({ status: 'ok', votes: all[idx].votes });
  });

  // Get details for a specific template
  fastify.get('/sdk-templates/:id', async (request, reply) => {
    const { id } = request.params as any;
    const all = readMetadata();
    const found = all.find(t => t.id === id);
    if (!found) return reply.status(404).send({ error: 'Not found' });
    reply.send({ status: 'ok', template: found });
  });
}
