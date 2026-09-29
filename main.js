import { getData, sendData } from './api.js';

export async function start() {
  const status = document.querySelector('#status');
  const sourceData = document.querySelector('#source-data');
  const sentData = document.querySelector('#sent-data');

  try {
    status.textContent = 'Получаем данные из db.json…';
    const data = await getData('./db.json');
    sourceData.textContent = JSON.stringify(data, null, 2);

    status.textContent = 'Отправляем полученные данные…';
    const answer = await sendData('https://jsonplaceholder.typicode.com/posts', data);
    sentData.textContent = JSON.stringify(answer, null, 2);
    status.textContent = 'Готово: данные получены и отправлены';
  } catch (error) {
    status.classList.add('error');
    status.textContent = `Ошибка: ${error.message}`;
    sentData.textContent = 'Отправка не завершена';
  }
}

// Модуль загружается после разметки: запуск происходит при открытии страницы.
if (typeof document !== 'undefined') start();
