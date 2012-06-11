
/**
 * Module dependencies.
 */

// Client
  // Server
  var log = console.log;

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var io = require('socket.io').listen(app);

var chara_counter = 0;
var characters = {};

io.sockets.on('connection', function (socket) { 
	log('connected');
	socket.on('init', function (code, x, y) {
		var character = {code:code, x:x, y:y, id:chara_counter, socket:socket};
		socket.set('character', character, function () {
			socket.emit('ready', chara_counter);
			socket.broadcast.emit('new character', {code:character.code, x:character.x, y:character.y, id:character.id});		

			for(var chidx in characters){
				var ch = characters[chidx];
				socket.emit('new character', {code:ch.code, x:ch.x, y:ch.y, id:ch.id}); 
			}
		});
		characters[chara_counter] = character;
		chara_counter++;
	});
	socket.on('msg send', function (msg) {
		socket.get('character', function (err, ch) {
			if( ch ){
				socket.broadcast.emit('msg push', ch.id, msg);
			}
		});
	});
	socket.on('position send', function (x, y) {
		socket.get('character', function (err, ch) {
			if( ch ){
				socket.broadcast.emit('position push', ch.id, x, y);
				characters[ch.id].x = x;
				characters[ch.id].y = y;
			}
		});
	});
	socket.on('disconnect', function() {
		log('disconnected');
		socket.get('character', function (err, ch) {
			if( ch ){
				socket.broadcast.emit('delete character', ch.id);
				delete characters[ch.id];
			}
		});
	});
});

