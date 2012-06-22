var io = require('socket.io-client')
	 , opts = require('opts')
	 , tty = require('tty');
var log = console.log;
opts.parse([
    {
        'short': 'n',
        'long': 'number',
        'description': 'Start Client Number',
        'value': true,
        'required': false
    },
]);
var client_number = opts.get("number")||0;
for( var i=0;i<client_number;i++){
	create_client();
}


process.stdin.resume();
tty.setRawMode(true);
process.stdin.on('keypress', function(char, key) {
	if (key && key.ctrl && key.name == 'c') {
		process.exit()
	}else{
		log("create_client");
		create_client();
	}
});

function create_client()
{
	var socket = io.connect('http://localhost:3000/', 
		{'force new connection': true});
	socket.on('connect', function () {
		log("connect");

		var x = Math.floor(Math.random() * 320);
		var y = Math.floor(Math.random() * 320);
		socket.emit('init', '2:2:1:2004:21230:22480', x, y);

	});
	socket.on('ready', function (id) {
		log("ready "+id);

		this.chara_id = id;

		this.startPositionTimer();
		this.startMessageTimer();

	});
	socket.startMessageTimer = function()
	{
		var self = this;
		setTimeout(function(){
			var message = "";
			for(var i=0;i<Math.floor(Math.random()*10) +2;i++){
				message += String.fromCharCode("a".charCodeAt(0)+Math.floor(Math.random()*28));
			}

			self.emit('msg send', message); 

			self.startMessageTimer();
			
		}, Math.floor(Math.random() * 20*1000)+5*1000);
	}
	socket.startPositionTimer = function()
	{
		var self = this;
		setTimeout(function(){
			var x = Math.floor(Math.random() * 320);
			var y = Math.floor(Math.random() * 320);
			self.emit('position send', x, y); 

			self.startPositionTimer();
			
		}, Math.floor(Math.random() * 5*1000)+2*1000);
	}

	return socket;
}


