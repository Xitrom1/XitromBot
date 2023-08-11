const TelegramAPI = require('node-telegram-bot-api')
const token = '6691238663:AAHnpiG4TeNae6YaZIgtrrWtoY8PceU86OQ'
const {gameOptions, againOptions} = require('./options.js')
const bot = new TelegramAPI(token, {polling: true})

const chats = {}
let regON = false

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты попробуй отгадать)')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Готово! Попробуй отгадать.', gameOptions)
}
// pushId, pushFirst_name, pushUsername, pushIs__bot, pushreal_first_name, pushreal_last_name, pushage, pushcity, pushimg, pushtext
const pushUser = async (pushId, pushFirst_name, pushUsername, pushIs__bot) => {
    function askQuestion(chatId) {
        return new Promise(function(resolve) {
          bot.on('message', function(msg) {
            if (msg.chat.id === chatId) {
              resolve(msg.text);
            }
          });
        });
      }
    const fs = require("fs");
    let rawdata = fs.readFileSync('Users.json'); // Читаем файл. Название файла поменять на свое
    let parseddata= JSON.parse(rawdata); // парсим и получаем JS объект из строки
    // Здесь совершаем операции с объектом JS
    //Например, добавляем объект в массив
    for (let i = 0; i<parseddata.length; i++) {
        if (parseddata[i].chatId == ('"'+pushId+'"')) {
            regON=false
            return await bot.sendMessage(pushId, 'Ты уже зарегистрирован.')
        }
    }
    // bot.sendMessage(chatId, msg. first_name + ' ' + last_name+', пожалуйста, введите своё имя.')
    bot.sendMessage(pushId, 'Пожалуйста, введите своё имя.')
    const pushreal_first_name = await askQuestion(pushId);
    // bot.sendMessage(pushId, msg. first_name + 'Введите свою фамилию.')
    bot.sendMessage(pushId, 'Введите свою фамилию.')
    const pushreal_last_name = await askQuestion(pushId);
    bot.sendMessage(pushId, 'Укажите свой возраст.')
    const pushage = await askQuestion(pushId);
    bot.sendMessage(pushId, 'Укажите город проживания.')
    const pushcity = await askQuestion(pushId);
    bot.sendMessage(pushId, 'Отправьте картинку.')
    const pushimg = await askQuestion(pushId);
    bot.sendMessage(pushId, 'Напишите о себе и кого вы хотите найти.')
    const pushtext = await askQuestion(pushId);
    parseddata.push({
        "chatId": '"'+pushId+'"',
        "first_name": '"'+pushFirst_name+'"',
        "username": '"'+pushUsername+'"',
        "is__bot": '"'+pushIs__bot+'"',
        "real_first_name": '"'+pushreal_first_name+'"',
        "real_last_name": '"'+pushreal_last_name+'"',
        "age": '"'+pushage+'"',
        "city": '"'+pushcity+'"',
        "img": '"'+pushimg+'"',
        "text": '"'+pushtext+'"'
    });
    //Превращаем обратно в строку
    let data1 = JSON.stringify(parseddata);
    // Пишем в файл
    fs.writeFileSync('Users.json', data1);
    regON=false
    return await bot.sendMessage(pushId, 'Ты зарегистрирован!')
}    
const start = () => {
    //Установить информацию о командах для пользователя, которые он может просматривать, нажимая на кнопку "menu"
    bot.setMyCommands ( [
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Информация о Вас'},
        {command: '/game', description: 'Начало игры'},
        {command: '/reg', description: 'Регистрация'},
    ])

    //Получение сообщение от пользователя и его обработка
    bot.on('message', async msg => {
        console.log('{User: '+msg.from.first_name+'\nUserId: '+msg.chat.id+'\nUserMessage: '+msg.text+'}\n')
        const text = msg.text;
        const chatId = msg.chat.id;
        let first_name = msg.from.first_name
        let last_name = msg.from.last_name
        if (msg.from.first_name == undefined) first_name = '';
        if (msg.from.last_name== undefined) last_name = '';
        switch (text) {
            case '/start': return bot.sendMessage(chatId, 'Добро пожаловать!');
            case '/info': 
                return bot.sendMessage(chatId, 'Твоё имя пользователя: ' + first_name + ' ' + last_name)
            case '/game':
                return startGame(chatId)
            case '/reg':
                regON=true
                return pushUser(chatId, msg.from.first_name, msg.from.username, msg.from.is_bot);
            default: if(regON==false) return bot.sendMessage(chatId, 'Не понимаю Вас(')
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data == '/again') return startGame(chatId);
        if (data == chats[chatId]) return await bot.sendMessage(chatId, 'Поздравляю, ты угадал(а), это цифра ' + chats[chatId] + '!', againOptions);
        else return bot.sendMessage(chatId, 'К сожалению, это не та цифра, я загадал ' + chats[chatId] + '!', againOptions);
    })
}
start();