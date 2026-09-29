import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { getMovieNames, filterHeroes, startHeroes } from '../heroes.js';

const heroes = JSON.parse(await readFile(new URL('../dbHeroes.json', import.meta.url), 'utf8'));

function makeElement(tag = 'div') {
  const listeners = {};
  return {
    tag, children: [], listeners, value: '', textContent: '', hidden: false, disabled: false,
    append(...items) { this.children.push(...items); },
    replaceChildren(...items) { this.children = items; },
    addEventListener(name, callback) { listeners[name] = callback; },
    fire(name) { listeners[name]?.(); },
  };
}

function page() {
  const elements = {
    '#movie-filter': makeElement('select'),
    '#result-count': makeElement('p'),
    '#load-error': makeElement('p'),
    '#hero-cards': makeElement('div'),
  };
  elements['#movie-filter'].disabled = true;
  elements['#load-error'].hidden = true;
  return {
    elements,
    querySelector: (selector) => elements[selector],
    createElement: makeElement,
  };
}

test('JSON содержит 50 героев, а каждое фото существует', async () => {
  assert.equal(heroes.length, 50);
  for (const hero of heroes) {
    assert.equal(typeof hero.name, 'string');
    assert.equal(typeof hero.status, 'string');
    await access(new URL(`../${hero.photo}`, import.meta.url));
  }
  assert.equal(getMovieNames(heroes).length, 23);
  assert.equal(getMovieNames(heroes).filter((movie) => movie === 'Thor: Ragnarok').length, 1);
  assert(filterHeroes(heroes, 'Thor: Ragnarok').some((hero) => hero.name === 'Odin'));
});

test('AJAX создаёт одну карточку на героя и фильтрует по фильму', async () => {
  globalThis.document = page();
  globalThis.fetch = async () => ({ ok: true, json: async () => heroes });

  try {
    await startHeroes();
    const { elements } = document;
    const cards = elements['#hero-cards'].children;
    const select = elements['#movie-filter'];
    assert.equal(cards.length, 50);
    assert.equal(select.children.length, 23);
    assert.equal(select.disabled, false);
    assert.equal(elements['#result-count'].textContent, 'Показано 50 из 50');

    const movie = 'Avengers: Endgame';
    select.value = movie;
    select.fire('change');
    const expected = filterHeroes(heroes, movie).length;
    assert.equal(cards.filter((card) => !card.hidden).length, expected);
    assert.equal(elements['#result-count'].textContent, `Показано ${expected} из 50`);

    select.value = '';
    select.fire('change');
    assert.equal(cards.filter((card) => !card.hidden).length, 50);

    const firstCard = cards[0];
    assert.equal(firstCard.children[0].tag, 'img');
    assert.equal(firstCard.children[0].src, heroes[0].photo);
    assert.equal(firstCard.children[1].children[0].textContent, heroes[0].name);
  } finally {
    delete globalThis.document;
    delete globalThis.fetch;
  }
});

test('ошибка загрузки показывается на странице', async () => {
  globalThis.document = page();
  globalThis.fetch = async () => ({ ok: false, status: 404 });

  try {
    await startHeroes();
    assert.equal(document.elements['#load-error'].hidden, false);
    assert.match(document.elements['#load-error'].textContent, /HTTP 404/);
    assert.equal(document.elements['#movie-filter'].disabled, true);
  } finally {
    delete globalThis.document;
    delete globalThis.fetch;
  }
});
