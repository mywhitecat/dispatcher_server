const PORT = 18081

const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

//app.use(app.static('public'));
//app.use(app.static('files'));
  //app.use((req, res) => res.sendFile('index.html') )

//const socketIO = require('socket.io');

console.log('Start');

console.log(process.env.PORT);

//server.listen(PORT);

server.listen(process.env.PORT);

app.get('/', function (req, res) {
	//res.se sendFile(__dirname + '/index.html');
	res.send('Hello World!');
  });

  console.log('listen');

// Отключаем вывод полного лога - пригодится в production'е
// io.set('log level', 1);
// Навешиваем обработчик на подключение нового клиента
io.on('connection', function (socket) {
    console.log('client connected');
	// Т.к. чат простой - в качестве ников пока используем первые 5 символов от ID сокета
	var ID = (socket.id).toString().substr(0, 5);
	var time = (new Date).toLocaleTimeString();
	// Посылаем клиенту сообщение о том, что он успешно подключился и его имя
    socket.json.send({'event': 'connected', 'name': ID, 'time': time});    
  
	// Посылаем всем остальным пользователям, что подключился новый клиент и его имя
	socket.broadcast.json.send({'event': 'userJoined', 'name': ID, 'time': time});
	// Навешиваем обработчик на входящее сообщение
	socket.on('message', function (msg) {

        console.log(msg);

		var time = (new Date).toLocaleTimeString();
		// Уведомляем клиента, что его сообщение успешно дошло до сервера
		socket.json.send({'event': 'messageSent', 'name': ID, 'text': msg, 'time': time});
		// Отсылаем сообщение остальным участникам чата
		socket.broadcast.json.send({'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time})
	});
	// При отключении клиента - уведомляем остальных
	socket.on('disconnect', function() {
		var time = (new Date).toLocaleTimeString();
        io.sockets.json.send({'event': 'userSplit', 'name': ID, 'time': time});
        console.log('client disconnected');
	});
});