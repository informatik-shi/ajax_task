import { getData } from './api.js';

const statusLabels = {
  alive: 'Жив',
  deceased: 'Погиб',
  destroyed: 'Уничтожен',
  unknown: 'Неизвестно',
};

export function getMovieNames(heroes) {
  const movies = heroes.flatMap((hero) => Array.isArray(hero.movies) ? hero.movies : [])
    .map((movie) => movie.trim())
    .filter(Boolean);
  return [...new Set(movies)].sort((a, b) => a.localeCompare(b));
}

export function filterHeroes(heroes, movie) {
  if (!movie) return heroes;
  return heroes.filter((hero) => Array.isArray(hero.movies) &&
    hero.movies.some((title) => title.trim() === movie));
}

function addFact(list, label, value) {
  if (!value) return;
  const row = document.createElement('div');
  row.className = 'fact';
  const title = document.createElement('dt');
  title.textContent = label;
  const description = document.createElement('dd');
  description.textContent = value;
  row.append(title, description);
  list.append(row);
}

export function createHeroCard(hero) {
  const card = document.createElement('article');
  card.className = 'hero-card';

  const image = document.createElement('img');
  image.className = 'hero-photo';
  image.src = hero.photo;
  image.alt = `Фото: ${hero.name}`;
  image.loading = 'lazy';
  card.append(image);

  const content = document.createElement('div');
  content.className = 'card-content';
  const heading = document.createElement('h2');
  heading.textContent = hero.name;
  const status = document.createElement('span');
  status.className = `hero-status status-${hero.status}`;
  status.textContent = statusLabels[hero.status] || hero.status;
  content.append(heading, status);

  const mainFacts = document.createElement('dl');
  mainFacts.className = 'facts';
  addFact(mainFacts, 'Настоящее имя', hero.realName || 'Не указано');
  content.append(mainFacts);

  const moviesTitle = document.createElement('h3');
  moviesTitle.textContent = 'Фильмы';
  content.append(moviesTitle);

  if (Array.isArray(hero.movies) && hero.movies.length > 0) {
    const movieList = document.createElement('ul');
    movieList.className = 'movie-list';
    hero.movies.forEach((movie) => {
      const item = document.createElement('li');
      item.textContent = movie.trim();
      movieList.append(item);
    });
    content.append(movieList);
  } else {
    const noMovies = document.createElement('p');
    noMovies.className = 'no-movies';
    noMovies.textContent = 'Не указаны';
    content.append(noMovies);
  }

  const extra = document.createElement('details');
  extra.className = 'extra-details';
  const summary = document.createElement('summary');
  summary.textContent = 'Дополнительные сведения';
  const extraFacts = document.createElement('dl');
  extraFacts.className = 'facts';
  addFact(extraFacts, 'Актёр', hero.actors);
  addFact(extraFacts, 'Вид', hero.species);
  addFact(extraFacts, 'Гражданство', hero.citizenship);
  addFact(extraFacts, 'Пол', hero.gender);
  addFact(extraFacts, 'Год рождения', hero.birthDay);
  addFact(extraFacts, 'Год смерти', hero.deathDay);
  extra.append(summary, extraFacts);
  content.append(extra);
  card.append(content);
  return card;
}

export async function startHeroes() {
  const select = document.querySelector('#movie-filter');
  const count = document.querySelector('#result-count');
  const error = document.querySelector('#load-error');
  const grid = document.querySelector('#hero-cards');

  try {
    const heroes = await getData('./dbHeroes.json');
    if (!Array.isArray(heroes)) throw new Error('Файл должен содержать список героев');

    getMovieNames(heroes).forEach((movie) => {
      const option = document.createElement('option');
      option.value = movie;
      option.textContent = movie;
      select.append(option);
    });

    const cards = heroes.map(createHeroCard);
    grid.replaceChildren(...cards);
    select.disabled = false;

    function applyFilter() {
      const visible = new Set(filterHeroes(heroes, select.value));
      cards.forEach((card, index) => { card.hidden = !visible.has(heroes[index]); });
      count.textContent = `Показано ${visible.size} из ${heroes.length}`;
    }

    select.addEventListener('change', applyFilter);
    applyFilter();
  } catch (problem) {
    count.textContent = 'Не удалось загрузить героев';
    error.textContent = `Ошибка: ${problem.message}`;
    error.hidden = false;
  }
}

if (typeof document !== 'undefined') startHeroes();
