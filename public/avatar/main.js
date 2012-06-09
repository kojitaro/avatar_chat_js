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
	}
});
var world = new GameWorld();

var socket = io.connect('');
socket.on('connect', function() { 
	log('connected');
	socket.emit('msg send', 'data');
	socket.on('msg push', function (msg) {
    log(msg);
  });
});

function send_message(text){
  socket.emit('msg send', text); 
}

window.onload=function(){
	game = new Game(320,320);
	game.preload('avatarBg1.png','avatarBg2.png','avatarBg3.png');
	game.onload=function(){

		game.rootScene.backgroundColor="#000000";
		var bg =new AvatarBG(1);
		bg.y=50;
		game.rootScene.addChild(bg);
		
		var chara = new ChatAvatar("2:2:1:2004:21230:22480", 50, 100);
		game.rootScene.addChild(chara);
		game.rootScene.addEventListener('touchstart',
			function(e){
				chara.move(e.x, e.y);
			});
	}

	game.start();
}
