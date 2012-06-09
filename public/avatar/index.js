var logDiv;
var gameFrame;
var log = function(){
	console.log(arguments);
	logDiv.innerHTML+=arguments[0]+"<BR>";
}
function gameFrame_init()
{
	logDiv = document.getElementById("log");
  	gameFrame = document.getElementById('gameFrame').contentWindow;

	gameFrame.focus();


	gameFrame.log = log;
}

function send_message(){
  var text = document.getElementById("text").value;
  gameFrame.send_message(text);
}
