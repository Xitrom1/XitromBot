const TelegramAPI = require('node-telegram-bot-api')
const token = '6691238663:AAHnpiG4TeNae6YaZIgtrrWtoY8PceU86OQ'
const {gameOptions, againOptions} = require('./options.js')
const bot = new TelegramAPI(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты попробуй отгадать)')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Готово! Попробуй отгадать.', gameOptions)
}

const start = () => {
    //Установить информацию о командах для пользователя, которые он может просматривать, нажимая на кнопку "menu"
    bot.setMyCommands ( [
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Информация о Вас'},
        {command: '/game', description: 'Начало игры'},
    ])

    //Получение сообщение от пользователя и его обработка
    bot.on('message', async msg => {
        console.log('{User: '+msg.from.first_name+'\nUserId: '+msg.chat.id+'\nUserMessage: '+msg.text+'}')
        const text = msg.text;
        const chatId = msg.chat.id;
        switch (text) {
            case '/start': return bot.sendMessage(chatId, 'Добро пожаловать!');
            case '/info': 
                let first_name = msg.from.first_name
                let last_name = msg.from.last_name
                if (msg.from.first_name == undefined) first_name = '';
                if (msg.from.last_name== undefined) last_name = '';
                return bot.sendMessage(chatId, 'Твоё имя пользователя: ' + first_name + ' ' + last_name)
            case '/game':
                return startGame(chatId)
            default: return bot.sendMessage(chatId, 'Не понимаю Вас(')
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