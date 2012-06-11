enchant();

var ChatAvatar = enchant.Class.create(enchant.Avatar, {
	initialize:function(code, x, y){
		enchant.Avatar.call(this,code);

		this.message_label = null;
		this.message_counter = 0;

		this.scene = new Scene();
		this.scene.addChild(this);

		this.scaleX=-1;
		this.scaleY=1;

		this.char_x = x;
		this.char_y = y;
		this.to_x = x;
		this.to_y = y;

		this.x = -1*this.width/2;
		this.y = -1*this.height/2;

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

			if( this.message_label ){
				this.message_counter--;
				if( this.message_counter < 0 ){
					this.scene.removeChild(this.message_label);
					this.message_label = null;
				}
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
		this.scene.x = this.char_x;
		this.scene.y = this.char_y;
	},
	showMessage: function(message)
	{
		var label = new Label();
		label.text = message;
		label.x = -20;
		label.y = -50;
		this.scene.addChild(label);

		this.message_label = label;
		this.message_counter = 20;

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
		function random_code()
		{
			function ri(min, max)
			{
				return Math.floor(Math.random() * (max-min))+min;
			}
			return ri(1,2)+":"+ri(0,5)+":"+ri(1,10)
				+":"+weaponArray[ri(0,weaponArray.length)][1]
				+":"+armorArray[ri(0,armorArray.length)][1]
				+":"+headArray[ri(0,headArray.length)][1];
		}
		var x = Math.floor(Math.random() * 320);
		var y = Math.floor(Math.random() * 320);
		var chara = new ChatAvatar(random_code(), x, y);
		this.player = chara;
		game.rootScene.addChild(this.player.scene);

		
		var label = new Label();
		label.text = "Now Loading!";
		label.x = 100;
		label.y = 160;
		game.rootScene.addChild(label);



		this.socket = io.connect('');
		var socket = this.socket;
		socket.on('connect', function() { 
			//log('connected');
			socket.emit('init', chara.getCode(), chara.scene.x, chara.scene.y);

			socket.on('ready', function (id) {
				// 
				//log("ready " + id);
				this.id = id;
				game.rootScene.addEventListener('touchstart',
					function(e){
						self.player.move(e.x, e.y);
						self.send_position(e.x, e.y)
					});
				game.rootScene.removeChild(label);
			});
			socket.on('new character', function (character) {
				//log("new character");
				self.add_character(character);
			});
			socket.on('msg push', function (id, msg) {
				//log("" + id + ": " + msg);
				self.update_message(id, msg);
			});
			socket.on('position push', function (id, x, y) {
				// log("position push" + id + ": " + x + "," + y);
				self.update_position(id, x, y);
			});
			socket.on('delete character', function (id) {
				//log("delete character");
				self.remove_character(id);
			});
		});
	},
	send_message: function(text){
		this.socket.emit('msg send', text); 
		this.player.showMessage(text);
	},
	send_position: function(x,y){
		this.socket.emit('position send', x, y); 
	},

	add_character: function(ch){
		this.characters[ch.id] = ch;

		//log("x="+ch.x+ " y=" +  ch.y);

		var chara = new ChatAvatar(ch.code, ch.x, ch.y);
		ch.avatar = chara;
		game.rootScene.addChild(chara.scene);
	},
	remove_character: function(id){
		var chara = this.characters[id];
		if( chara ){
		//log("remove_character="+id);
			game.rootScene.removeChild(chara.avatar.scene);
			delete this.characters[id];
		}
	},
	update_position: function(id, x, y){
		var chara = this.characters[id];
		if( chara ){
			chara.avatar.move(x, y);
		}
	},
	update_message: function(id, message){
		var chara = this.characters[id];
		if( chara ){
			chara.avatar.showMessage(message);
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
