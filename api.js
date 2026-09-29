async function readJson(response, action) {
  if (!response.ok) {
    throw new Error(`${action}: сервер ответил HTTP ${response.status}`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`${action}: ответ не является корректным JSON`);
  }
}

export async function getData(url) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Не удалось получить данные из db.json');
  }
  return readJson(response, 'Получение данных');
}

export async function sendData(url, data) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error('Не удалось отправить данные');
  }
  return readJson(response, 'Отправка данных');
}
