
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

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var io = require('socket.io').listen(app);

var chara_counter = 0;

io.sockets.on('connection', function (socket) { 
	log('connected');
	socket.on('init', function (code, x, y) {
		var character = {code:code, x:x, y:y, id:chara_counter};
		socket.set('character', character, function () {
			socket.emit('ready', chara_counter);
			socket.broadcast.emit('new character', character);		
		});
		chara_counter++;
	});
	socket.on('msg send', function (msg) {
		socket.broadcast.emit('msg push', msg);
	});
	socket.on('position send', function (x, y) {
		socket.get('character', function (err, ch) {
			socket.broadcast.emit('position push', ch.id, x, y);
		});
	});
	socket.on('disconnect', function() {
		log('disconnected');
	});
});

