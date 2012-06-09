enchant();

var ChatAvatar = enchant.Class.create(enchant.Avatar, {
	initialize:function(code, x, y){
		enchant.Avatar.call(this,code);

		this.scaleX=-1;
		this.scaleY=1;

		this.char_x = x;
		this.char_y = y;
		this.to_x = x;
		this.to_y = y;

		this.offset_x = -1*this.width/2;
		this.offset_y = -1*this.height/2;

		this.updatePosition();

		this.addEventListener('enterframe',function(){
			var speed = 4; // 1フレーム当たりの移動量

			var mx = this.to_x-this.char_x;
			var my = this.to_y-this.char_y;
			if( mx != 0 || my != 0 ){
				// 移動
				if( Math.sqrt(mx*mx+my*my) < speed ){
					this.char_x = this.to_x;
					this.char_y = this.to_y;
				}else{
					var rot = Math.atan2(my,mx);
					var dx = speed * Math.cos(rot);
				this.char_x += dx;
					this.char_y += speed * Math.sin(rot);
					if( dx>0 ){
						this.right();
					}else{
						this.left();		
					}
				}
				this.updatePosition();
				this.action = "run";
			}else{
				this.action = "stop";
			}
		});
	},
	move: function(x, y)
	{
		this.to_x = x;
		this.to_y = y;
	},
	updatePosition: function()
	{
		this.x = this.char_x + this.offset_x;
		this.y = this.char_y + this.offset_y;
	},
});

var GameWorld = enchant.Class.create({
	initialize:function()
	{
		this.id = -1;
		this.characters = {};
	},

	start:function()
	{
		var self = this;

		// 背景
		game.rootScene.backgroundColor="#000000";
		var bg =new AvatarBG(1);
		bg.y=50;
		game.rootScene.addChild(bg);

		// キャラクター
		var chara = new ChatAvatar("2:2:1:2004:21230:22480", Math.floor(Math.random() * 320), Math.floor(Math.random() * 320));
		game.rootScene.addChild(chara);
		game.rootScene.addEventListener('touchstart',
			function(e){
				chara.move(e.x, e.y);
				self.send_position(e.x, e.y)
			});


		this.socket = io.connect('');
		var socket = this.socket;
		socket.on('connect', function() { 
			log('connected');
			socket.emit('init', chara.getCode(), chara.x, chara.y);

			socket.on('ready', function (id) {
				// 
				log("ready " + id);
				this.id = id;
			});
			socket.on('new character', function (character) {
				log("new charactere");
				//log(character);
				self.add_character(character);
			});
			socket.on('msg push', function (id, msg) {
				log("" + id + ": " + msg);
			});
			socket.on('position push', function (id, x, y) {
				// log("position push" + id + ": " + x + "," + y);
				self.update_position(id, x, y);
			});
		});
	},
	send_message: function(text){
		this.socket.emit('msg send', text); 
	},
	send_position: function(x,y){
		this.socket.emit('position send', x, y); 
	},

	add_character: function(ch){
		this.characters[ch.id] = ch;

		var chara = new ChatAvatar(ch.code, ch.x, ch.y);
		ch.avatar = chara;
		game.rootScene.addChild(chara);
	},
	update_position: function(id, x, y){
		var chara = this.characters[id];
		if( chara ){
			chara.avatar.move(x, y);
		}
	},
});
var world = new GameWorld();


window.onload=function(){
	game = new Game(320,320);
	game.preload('avatarBg1.png','avatarBg2.png','avatarBg3.png');
	game.onload=function(){
		world.start();
	}
	game.start();
}
