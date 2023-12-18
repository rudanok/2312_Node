const express = require('express');
const fs = require('fs');

const app = express();

// Объект для хранения счетчиков
let counters = {};

// Функция загрузки данных о счетчиках из файла при запуске сервера
function loadCounters() {
    try {
        const data = fs.readFileSync('counters.json', 'utf8');
        counters = JSON.parse(data);
    } catch (err) {
        // Если файла нет или возникла ошибка, начинаем с пустого объекта
        counters = {};
    }
}

// Функция сохранения данных о счетчиках в файл
function saveCounters() {
    fs.writeFileSync('counters.json', JSON.stringify(counters), 'utf8');
}

// Миддлвэр для обновления счетчика при каждом обращении к странице
function updateCounter(req, res, next) {
    const url = req.originalUrl; // Получаем URL страницы
    if (!counters[url]) {
        counters[url] = 1; // Если счетчик для данной страницы не существует, создаем его
    } else {
        counters[url]++; // Иначе увеличиваем счетчик просмотров
    }
    saveCounters(); // Сохраняем обновленные данные в файл
    next();
}

// Загружаем счетчики при старте сервера
loadCounters();

// Миддлвэр для обновления счетчика при каждом обращении к странице
app.use(updateCounter);

// Обработчик для главной страницы
app.get('/', (req, res) => {
    res.send(`<h2>Главная страница</h2>
    <p>Количество просмотров - ${counters['/']}</p>
    <a href="/about">Cтраница about</a>`);
});

// Обработчик для страницы "about"
app.get('/about', (req, res) => {
    res.send(`<h2>Cтраница about</h2>
    <p>Количество просмотров - ${counters['/about']}</p>
    <a href="/">Главная страница</a>`);
});

// Запуск сервера на порту 3000
const server = app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});

// Обработка события завершения работы сервера
process.on('SIGINT', () => {
    saveCounters(); // При завершении работы сервера сохраняем данные
    server.close(); // Закрываем сервер
});
