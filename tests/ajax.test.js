import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { start } from '../main.js';

const data = JSON.parse(await readFile(new URL('../db.json', import.meta.url), 'utf8'));

function page() {
  const elements = {
    '#status': { textContent: '', classList: { add(name) { this.error = name; } } },
    '#source-data': { textContent: '' },
    '#sent-data': { textContent: '' },
  };
  return { elements, querySelector: (selector) => elements[selector] };
}

test('при загрузке сначала GET, затем POST того же объекта', async () => {
  const calls = [];
  globalThis.document = page();
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) {
      return { ok: true, json: async () => data };
    }
    return { ok: true, json: async () => ({ ...data, id: 101 }) };
  };

  try {
    await start();
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, './db.json');
    assert.equal(calls[0].options, undefined);
    assert.equal(calls[1].url, 'https://jsonplaceholder.typicode.com/posts');
    assert.equal(calls[1].options.method, 'POST');
    assert.equal(calls[1].options.headers['Content-Type'], 'application/json; charset=UTF-8');
    assert.deepEqual(JSON.parse(calls[1].options.body), data);
    assert.deepEqual(JSON.parse(document.elements['#source-data'].textContent), data);
    assert.match(document.elements['#status'].textContent, /Готово/);
  } finally {
    delete globalThis.document;
    delete globalThis.fetch;
  }
});

test('ошибка GET не запускает POST', async () => {
  let requests = 0;
  globalThis.document = page();
  globalThis.fetch = async () => {
    requests++;
    return { ok: false, status: 404 };
  };

  try {
    await start();
    assert.equal(requests, 1);
    assert.match(document.elements['#status'].textContent, /HTTP 404/);
    assert.equal(document.elements['#status'].classList.error, 'error');
  } finally {
    delete globalThis.document;
    delete globalThis.fetch;
  }
});

test('ошибочный JSON и ошибка POST показываются на странице', async () => {
  globalThis.document = page();
  globalThis.fetch = async () => ({ ok: true, json: async () => { throw Error('bad JSON'); } });
  try {
    await start();
    assert.match(document.elements['#status'].textContent, /корректным JSON/);

    let requests = 0;
    globalThis.document = page();
    globalThis.fetch = async () => {
      requests++;
      return requests === 1
        ? { ok: true, json: async () => data }
        : { ok: false, status: 503 };
    };
    await start();
    assert.equal(requests, 2);
    assert.match(document.elements['#status'].textContent, /HTTP 503/);
  } finally {
    delete globalThis.document;
    delete globalThis.fetch;
  }
});
