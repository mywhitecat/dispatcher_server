function PlaneClient(planeId) 
{
	this.Id = planeId;	
	this.PlaneData = null; // serialized datas from client
}

module.exports = PlaneClient;

const planeClients = [];

const PORT = process.env.PORT || 18081;

const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);


//app.use(app.static('public'));
//app.use(app.static('files'));
  //app.use((req, res) => res.sendFile('index.html') )

//const socketIO = require('socket.io');

console.log('Start');

//server.listen(PORT);

server.listen(PORT);

app.get('/', function (req, res) {
	//res.se sendFile(__dirname + '/index.html');
	var str  = 'Dispatcher server: v0.3<BR/><BR/>';

	var len = planeClients.length;	
	 
	for (var i=0; i<len; i++)
	{
		  str = str + JSON.stringify(planeClients[i]) + '<BR/>';
		  //str = str + JSON.stringify(planeDatas[i]);
		  // str = str + 'Plane ID = ' + planes[i].id +'<BR/>'; 
		  // str = str + 'latitude = ' + planes[i].lat +'<BR/>'; 
		  // str = str + 'longitude = ' + planes[i].lon +'<BR/>'; 
		  // str = str + 'altitude = ' + planes[i].alt +'<BR/>'; 
	      str = str + '<BR/><BR/>'; 
	   }
	res.send(str);	
  });

  console.log('Server listen at ' + PORT);


// Отключаем вывод полного лога - пригодится в production'е
 // io.set('log level', 1);
// Навешиваем обработчик на подключение нового клиента
io.on('connection', function (socket) {
    
	// Т.к. чат простой - в качестве ников пока используем первые 5 символов от ID сокета
	var ID = (socket.id).toString().substr(0, 5);	
	
	console.log ('client connected');
	
	planeClients.push(new PlaneClient(ID));

	console.log ('Plane with ID = '+ ID+ " was added.");

	// Посылаем клиенту сообщение о том, что он успешно подключился и его имя
	socket.json.send({'Event': 'connected', 'ID': ID});    	
	
  
	// Посылаем всем остальным пользователям, что подключился новый клиент и его имя
	// socket.broadcast.json.send({'event': 'userJoined', 'name': ID, 'time': time});
	

	// Навешиваем обработчик на входящее сообщение
	socket.on('message', function (msg) {

       // console.log(msg);
		
		// Уведомляем клиента, что его сообщение успешно дошло до сервера
		// socket.json.send({'event': 'messageSent', 'name': ID, 'text': msg, 'time': time});
		// Callback with Planes: 
		UpdatePlane(ID, msg)

		var data = [];

		var len = planeClients.length;
	 
		for (var i=0; i<len; i++)
		{
		   if (planeClients[i].PlaneData != null)
			  {			
				 data.push(planeClients[i].PlaneData);
			  }
		   }

		socket.json.send({'Event': 'messageSent', 'ID': ID, 'Data': data});
		// Отсылаем сообщение остальным участникам чата
		// socket.broadcast.json.send({'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time})
	});
	// При отключении клиента - уведомляем остальных
	socket.on('disconnect', function() {
		var time = (new Date).toLocaleTimeString();
        io.sockets.json.send({'Event': 'userSplit', 'ID': ID});
		console.log('client disconnected');
		RemovePlane(ID);
	});

	
});

function UpdatePlane(id, data)
{
	 var len = planeClients.length;
	 
	 for (var i=0; i<len; i++)
	 {
        if (planeClients[i].Id == id)
           {			
		      planeClients[i].PlaneData = data; 			 	 
			  break;
		   }
		}
}

function RemovePlane(id)
{
	 var len = planeClients.length;
	 
	 for (var i=0; i<len; i++)
	 {
        if (planeClients[i].Id == id)
           {
			  planeClients.splice(i, 1);			 
			  console.log('Plane with id='+id+' was removed.');
			  break;
		   }
		}
}