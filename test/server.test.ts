import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { parse } from '../src/server.js';

test('parses a simple two-label domain', () => {
  const r = parse('example.com');
  assert.equal(r.domain, 'example.com');
  assert.equal(r.public_suffix, 'com');
  assert.equal(r.domain_without_suffix, 'example');
  assert.equal(r.subdomain, '');
});

test('parses subdomain', () => {
  const r = parse('www.example.com');
  assert.equal(r.subdomain, 'www');
  assert.equal(r.domain, 'example.com');
});

test('handles multi-level suffix (co.uk)', () => {
  const r = parse('www.bbc.co.uk');
  assert.equal(r.subdomain, 'www');
  assert.equal(r.domain, 'bbc.co.uk');
  assert.equal(r.public_suffix, 'co.uk');
  assert.equal(r.domain_without_suffix, 'bbc');
});

test('accepts a full URL', () => {
  const r = parse('https://user:pw@www.example.com:8080/path?q=1');
  assert.equal(r.hostname, 'www.example.com');
  assert.equal(r.domain, 'example.com');
});

test('flags IP addresses', () => {
  const r = parse('http://1.2.3.4/');
  assert.equal(r.is_ip, true);
});

test('handles unknown TLD gracefully', () => {
  const r = parse('foo.bar.invalid');
  // tldts treats unknown TLDs as private suffixes.
  assert.ok(r.hostname === 'foo.bar.invalid' || r.hostname === null);
});
