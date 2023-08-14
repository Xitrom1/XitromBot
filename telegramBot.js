const TelegramAPI = require('node-telegram-bot-api')
const token = '6691238663:AAHnpiG4TeNae6YaZIgtrrWtoY8PceU86OQ'
const {gameOptions, againOptions, choiseOptions} = require('./options.js')
const bot = new TelegramAPI(token, {polling: true})

const fs = require('fs');
let rawdata = fs.readFileSync('Users.json'); // Читаем файл. Название файла поменять на свое
let parseddata= JSON.parse(rawdata); // парсим и получаем JS объект из строки


const chats = {}
let funON = false
let searchON = false

function askQuestion(chatId) {
    return new Promise(function(resolve) {
    bot.on('message', function(msg) {
        if (msg.chat.id === chatId) {
        resolve(msg);
        }
    });
    });
}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты попробуй отгадать)')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Готово! Попробуй отгадать.', gameOptions)
}
const pushUser = async (pushId, pushFirst_name, pushUsername, pushIs__bot) => {
    funON = true;
    for (let i = 0; i<parseddata.length; i++) {
        if (parseddata[i].chatId == ('"'+pushId+'"')) {
            funON=false
            return await bot.sendMessage(pushId, 'Ты уже зарегистрирован.')
        }
    }
    if (pushFirst_name != '') bot.sendMessage(pushId, pushFirst_name+', пожалуйста, введите своё имя.')
    else bot.sendMessage(pushId, 'Пожалуйста, введите своё имя.')
    const pushreal_first_name = await askQuestion(pushId);
    bot.sendMessage(pushId, 'Какого вы пола?')
    const pushgender = await askQuestion(pushId);
    bot.sendMessage(pushId, 'Кого хотите искать?')
    const pushwhoLook = await askQuestion(pushId);
    bot.sendMessage(pushId, 'Укажите свой возраст.')
    const pushage = await askQuestion(pushId);
    bot.sendMessage(pushId, 'Укажите город проживания.')
    const pushcity = await askQuestion(pushId);
    bot.sendMessage(pushId, 'Отправьте своё фото.')
    const pushimg = await askQuestion(pushId);
    let photo_id = 'not image'
    if(pushimg.photo) {
        photo_id = pushimg.photo[0].file_id;
    }
    bot.sendMessage(pushId, 'Напишите о себе.')
    const pushtext = await askQuestion(pushId);
    parseddata.push({
        "chatId": '"'+pushId+'"',
        "first_name": '"'+pushFirst_name+'"',
        "username": '"'+pushUsername+'"',
        "is__bot": '"'+pushIs__bot+'"',
        "real_first_name": '"'+pushreal_first_name.text+'"',
        "gender": '"'+pushgender.text+'"',
        "whoLook": '"'+pushwhoLook.text+'"',
        "age": '"'+pushage.text+'"',
        "city": '"'+pushcity.text+'"',
        "img": '"'+photo_id+'"',
        "text": '"'+pushtext.text+'"'
    });
    //Превращаем обратно в строку
    let data1 = JSON.stringify(parseddata);
    // Пишем в файл
    fs.writeFileSync('Users.json', data1);
    funON=false
    return await bot.sendMessage(pushId, 'Ты зарегистрирован!')
}  

const showUser = (chatId) => {
    funON = true
    let UserChatId = chatId 
    for (let i = 0; i<parseddata.length; i++) {
        if (parseddata[i].chatId == ('"'+UserChatId+'"')) {
            let photo = parseddata[i].img.replace('"', '').replace('"', '')
            let userInfo = parseddata[i].real_first_name+', '+parseddata[i].age+', '+ parseddata[i].city+ '.\n'+parseddata[i].text
            for (let j=0; j<10;j++) {
                userInfo = userInfo.replace('"', '')
            }
            funON = false
            return bot.sendPhoto(chatId, photo, { caption: userInfo });
        }
    }            
}

function sendMessageAndWaitForReply(chatId, message) {
    return new Promise((resolve) => {
    //   bot.sendMessage(chatId, message, choiseOptions) TODO
      bot.sendMessage(chatId, message)
        .then(() => {
          // Слушаем сообщения от пользователя
          bot.on('message', (msg) => {
            if (msg.chat.id === chatId && msg.text) {
              // Пользователь отправил ответ, разрешаем выполнение промиса
              resolve(msg);
            }
          });
        });
    });
  }

const start = () => {
    //Установить информацию о командах для пользователя, которые он может просматривать, нажимая на кнопку "menu"
    bot.setMyCommands ( [
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Информация о Вас'},
        {command: '/game', description: 'Начало игры'},
        {command: '/reg', description: 'Регистрация'},
        {command: '/search', description: 'Искать людей'},
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
            case '/start': if(funON==false) return bot.sendMessage(chatId, 'Добро пожаловать!');
            case '/info':
                // let UserChatId = ''
                // if (chatId == 1311752920) {
                //     bot.sendMessage(chatId, 'Введите id пользователя')
                //     UserChatId = askQuestion(chatId);
                // } else UserChatId = chatId
                return showUser(chatId)
            case '/game':
                return startGame(chatId)
            case '/reg':
                return pushUser(chatId, first_name, msg.from.username, msg.from.is_bot);
            case '/search':
                searchON=true;
                funON = true
                let countUser = 0;
                let i = 2
                let whoLook = 'Девушка';
                let age = 21;
                for (let k=0;k<parseddata.length;k++) if(parseddata[k].chatId.replace('"', '').replace('"', '')==chatId)  {
                    whoLook = parseddata[k].whoLook.replace('"', '').replace('"', '');
                    let age = Number(parseddata[k].age.replace('"', '').replace('"', ''));
                }
                function showUserOnce(i) {
                    let photo = parseddata[i].img.replace('"', '').replace('"', '')
                    if (photo == 'not image') photo = 'AgACAgIAAxkBAAIKaWTZ3M6ByQABvtiVvtqA9V8c3ipvswACCswxG_vl0EodqI_LC_HufAEAAwIAA3MAAzAE'
                    let userInfo = parseddata[i].real_first_name+', '+parseddata[i].age+', '+ parseddata[i].city+ '.\n'+parseddata[i].text
                    for (let j=0; j<10;j++) userInfo = userInfo.replace('"', '')
                    bot.sendPhoto(chatId, photo, {caption: userInfo});
                }
                let No1 = false;
                if (
                    parseddata[1].chatId.replace('"', '').replace('"', '')!=chatId && 
                    whoLook==parseddata[1].gender.replace('"', '').replace('"', '') &&
                    Number(parseddata[1].age.replace('"', '').replace('"', '')) < age+3 &&
                    age-3 < Number(parseddata[1].age.replace('"', '').replace('"', ''))
                ) {countUser==0;showUserOnce(1);}        
                else No1 = true;
                let iwhile=true
                let resolve = '>'
                while (iwhile==true) {
                    if (i<parseddata.length) {
                        if (
                            parseddata[i].chatId.replace('"', '').replace('"', '')!=chatId && 
                            whoLook==parseddata[i].gender.replace('"', '').replace('"', '')  &&
                            Number(parseddata[i].age.replace('"', '').replace('"', '')) < age+3 &&
                            age-3 < Number(parseddata[i].age.replace('"', '').replace('"', ''))
                            ) {
                            if (i!=2 && No1==false){
                                let resolveFun = await sendMessageAndWaitForReply(chatId, 'Вам нравится анкета? (1=Да, 0=нет)');
                                resolve = resolveFun.text
                            }
                            if (resolve == '1' || resolve == '0')  {countUser++; showUserOnce(i);}
                        }     
                        i++;
                        No1=false
                    }
                    else iwhile=false
                }
                funON = false;
                searchON=false;
                if (countUser==0)  return bot.sendMessage(chatId, 'Под Вас никого не нашли(')
                else return bot.sendMessage(chatId, 'Конец поиска.')

            default: if(funON==false) return bot.sendMessage(chatId, 'Не понимаю Вас(')
        }
    })

    bot.on('callback_query', async msg => {
        if (searchON==false) {
            const data = msg.data;
            const chatId = msg.message.chat.id;
            if (data == '/again') return startGame(chatId);
            if (data == chats[chatId]) return await bot.sendMessage(chatId, 'Поздравляю, ты угадал(а), это цифра ' + chats[chatId] + '!', againOptions);
            else return bot.sendMessage(chatId, 'К сожалению, это не та цифра, я загадал ' + chats[chatId] + '!', againOptions);
        }
        else {//TODO
        }
    })
}
start();

process.on('uncaughtException', function (error) {
	console.log("\x1b[31m", "Exception: ", error, "\x1b[0m");
});

process.on('unhandledRejection', function (error, p) {
	console.log("\x1b[31m","Error: ", error.message, "\x1b[0m");
}); 