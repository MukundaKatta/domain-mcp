# domain-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/domain-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/domain-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: split a domain or URL using the Public Suffix List. Distinguishes
`bbc.co.uk` (registrable) from `co.uk` (public suffix) — naive string splits
on `.` get this wrong.

## Tool

### `parse`

```json
{ "input": "www.bbc.co.uk" }
```

→

```json
{
  "input": "www.bbc.co.uk",
  "hostname": "www.bbc.co.uk",
  "subdomain": "www",
  "domain": "bbc.co.uk",
  "public_suffix": "co.uk",
  "domain_without_suffix": "bbc",
  "is_ip": false,
  "is_icann": true,
  "is_private": false
}
```

Accepts a bare domain or a full URL. IPs are flagged via `is_ip`.

## Configure

```json
{ "mcpServers": { "domain": { "command": "npx", "args": ["-y", "@mukundakatta/domain-mcp"] } } }
```

## License

MIT.

## Repository Health

This repository includes a dependency-free health check for core documentation, metadata, and CI wiring. Run it locally before publishing changes:

```sh
python3 scripts/check_repository_health.py
```

The same check runs in GitHub Actions on pushes and pull requests.
