import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EvaluationEngine, problems, getLLMConfig } from './evaluator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 3000);
const engine = new EvaluationEngine();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.startsWith("'") && rawValue.endsWith("'")
      ? rawValue.slice(1, -1)
      : rawValue.startsWith('"') && rawValue.endsWith('"')
        ? rawValue.slice(1, -1)
        : rawValue;

    if (key) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(__dirname, '.env'));

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Request body exceeded limit.'));
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON request body.'));
      }
    });

    req.on('error', reject);
  });
}

async function handleEvaluate(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    const body = await readRequestBody(req);
    const { problemId, submissionText } = body || {};

    if (!problemId || typeof submissionText !== 'string') {
      sendJson(res, 400, { error: 'problemId and submissionText are required.' });
      return;
    }

    const problem = problems.find((entry) => entry.id === problemId) || problems[0];
    const result = await engine.evaluateWithLLM(problem, submissionText);
    sendJson(res, 200, result);
  } catch (error) {
    console.error('Evaluation failed:', error);
    const fallback = engine.evaluate(
      problems[0],
      ''
    );
    sendJson(res, 500, {
      ...fallback,
      error: 'LLM evaluation failed; fallback score returned.'
    });
  }
}

async function serveStaticFile(req, res, urlPath) {
  const safePath = path.normalize(urlPath).replace(/^\/+/, '');
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  const candidate = fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : path.join(__dirname, 'index.html');

  try {
    const file = fs.readFileSync(candidate);
    const ext = path.extname(candidate).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(file);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (requestUrl.pathname === '/api/evaluate') {
    await handleEvaluate(req, res);
    return;
  }

  if (requestUrl.pathname === '/health') {
    sendJson(res, 200, {
      ok: true,
      provider: getLLMConfig().provider,
      configured: Boolean(getLLMConfig().apiKey)
    });
    return;
  }

  await serveStaticFile(req, res, requestUrl.pathname);
});

server.listen(port, () => {
  console.log(`LLD Practice Platform running on http://localhost:${port}`);
});
