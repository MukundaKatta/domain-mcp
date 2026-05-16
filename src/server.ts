#!/usr/bin/env node
/**
 * domain MCP server. One tool: `parse`.
 *
 * Backed by `tldts` — uses the public-suffix list to correctly split
 * domains. `www.bbc.co.uk` parses to subdomain="www", domain="bbc.co.uk",
 * publicSuffix="co.uk", domainWithoutSuffix="bbc".
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { parse as tldParse } from 'tldts';

const VERSION = '0.1.0';

export interface DomainInfo {
  input: string;
  hostname: string | null;
  subdomain: string | null;
  domain: string | null;
  public_suffix: string | null;
  domain_without_suffix: string | null;
  is_ip: boolean;
  is_icann: boolean;
  is_private: boolean;
}

export function parse(input: string): DomainInfo {
  const r = tldParse(input);
  return {
    input,
    hostname: r.hostname,
    subdomain: r.subdomain,
    domain: r.domain,
    public_suffix: r.publicSuffix,
    domain_without_suffix: r.domainWithoutSuffix,
    is_ip: r.isIp ?? false,
    is_icann: r.isIcann ?? false,
    is_private: r.isPrivate ?? false,
  };
}

const server = new Server({ name: 'domain', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'parse',
    description:
      'Split a domain or URL using the Public Suffix List. Returns hostname, subdomain, registrable domain, public suffix, and IP flag.',
    inputSchema: {
      type: 'object',
      properties: { input: { type: 'string', description: 'Domain or URL.' } },
      required: ['input'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'parse') return errorResult('unknown tool: ' + name);
    const a = args as unknown as { input: string };
    return jsonResult(parse(a.input));
  } catch (err) {
    return errorResult('domain parse failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`domain MCP server v${VERSION} ready on stdio\n`);
}
