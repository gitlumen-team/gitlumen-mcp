#!/usr/bin/env node
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createGitLumenMcpServer } from './mcpServer.js';

const port = Number(process.env.PORT || 3333);
const host = process.env.HOST || '0.0.0.0';
const authToken = process.env.MCP_AUTH_TOKEN || '';

const sessions = new Map();

function sendJsonRpcError(res, statusCode, message, id = null) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message
    },
    id
  }));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function getSessionIdFromHeaders(req) {
  const header = req.headers['mcp-session-id'];
  if (Array.isArray(header)) return header[0];
  return header;
}

function isInitializeRequest(body) {
  return Boolean(body && typeof body === 'object' && body.method === 'initialize');
}

function isAuthorized(req) {
  if (!authToken) return true;
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  const [scheme, token] = authHeader.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token === authToken;
}

async function parseJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return undefined;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getOrCreateTransport(req, res, parsedBody) {
  const sessionId = getSessionIdFromHeaders(req);

  if (sessionId && sessions.has(sessionId)) {
    return sessions.get(sessionId).transport;
  }

  if (!sessionId && req.method === 'POST' && isInitializeRequest(parsedBody)) {
    const record = { server: null, transport: null, sessionId: null };

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        record.sessionId = sid;
        sessions.set(sid, record);
      }
    });

    transport.onclose = async () => {
      if (record.sessionId) sessions.delete(record.sessionId);
      if (record.server) {
        await record.server.close();
      }
    };

    record.transport = transport;
    record.server = createGitLumenMcpServer();

    await record.server.connect(transport);
    return transport;
  }

  sendJsonRpcError(res, 400, 'Bad Request: No valid session ID provided');
  return null;
}

async function handleMcpRequest(req, res) {
  if (!isAuthorized(req)) {
    sendJsonRpcError(res, 401, 'Unauthorized');
    return;
  }

  const method = req.method || 'GET';
  if (!['GET', 'POST', 'DELETE'].includes(method)) {
    sendJsonRpcError(res, 405, 'Method not allowed');
    return;
  }

  let parsedBody;
  if (method === 'POST') {
    parsedBody = await parseJsonBody(req);
    if (parsedBody === null) {
      sendJsonRpcError(res, 400, 'Bad Request: Request body must be valid JSON');
      return;
    }
  }

  try {
    const transport = await getOrCreateTransport(req, res, parsedBody);
    if (!transport) return;
    await transport.handleRequest(req, res, parsedBody);
  } catch (error) {
    console.error('[gitlumen-mcp-server:http] request error:', error);
    if (!res.headersSent) {
      sendJsonRpcError(res, 500, 'Internal server error');
    }
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJsonRpcError(res, 400, 'Bad Request');
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    sendJson(res, 200, {
      ok: true,
      service: 'gitlumen-mcp-server',
      transport: 'streamable-http',
      auth: authToken ? 'bearer' : 'disabled',
      activeSessions: sessions.size
    });
    return;
  }

  if (url.pathname === '/mcp') {
    await handleMcpRequest(req, res);
    return;
  }

  sendJsonRpcError(res, 404, 'Not Found');
});

server.listen(port, host, () => {
  console.log(`[gitlumen-mcp-server:http] listening on http://${host}:${port}`);
  console.log('[gitlumen-mcp-server:http] endpoint: /mcp');
  console.log(`[gitlumen-mcp-server:http] auth: ${authToken ? 'enabled (bearer token)' : 'disabled'}`);
});

process.on('SIGINT', async () => {
  console.log('[gitlumen-mcp-server:http] shutting down...');
  for (const record of sessions.values()) {
    if (record.transport) await record.transport.close();
  }
  server.close(() => process.exit(0));
});
