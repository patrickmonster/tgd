  var chatClient = function chatClient(options){
    this.username = options.username;
    this.password = options.password;
    this.channel = "#"+options.channel;
    this.server = 'irc-ws.chat.twitch.tv';
    this.port = 443;
}

chatClient.prototype.open = function open(){
    this.webSocket = new WebSocket('wss://' + this.server + ':' + this.port + '/', 'irc');
    this.webSocket.onmessage = this.onMessage.bind(this);
    this.webSocket.onerror = this.onError.bind(this);
    this.webSocket.onclose = this.onClose.bind(this);
    this.webSocket.onopen = this.onOpen.bind(this);
};

chatClient.prototype.onError = function onError(message){
    console.log('Error: ' + message);
};
chatClient.prototype.onMessage = function onMessage(message){
    if(message !== null){
        var parsed = this.parseMessage(message.data);
		//console.log(parsed);
        if(parsed !== null){
    			switch(parsed.command){
    				case "JOIN":
    				case "USERSTATE"://사용자 참여

    					break;
    				case "PING":
    					this.webSocket.send("PONG :" + parsed['PING']);
    				case "USERNOTICE"://구독/팔로/레이드

    					break;
    				case "PRIVMSG":
    					// userPoints = localStorage.getItem(parsed.username);
              console.log(parsed);
    					//if(userPoints === null)localStorage.setItem(parsed.username, 10);
    					//else localStorage.setItem(parsed.username, parseFloat(userPoints) + 0.25);// 포인트 제도
    					if (parsed["@ban-duration"])return;//벤 유저
    					if (parsed["emotes"]){
    						var img = "http://static-cdn.jtvnw.net/emoticons/v1/";
    						var emotes = parsed["emotes"].split("/");
    						for(var i in emotes){// 이모티콘 리스트
    							var index = emotes[i].indexOf(":")+1;
    							for(var j =0 ; j< emotes[i].substring(index).split(",").length; j++)
    								this.onEmotes(img+emotes[i].substring(0,index-1)+"/3.0");
    						}

    					}
    					if (parsed["bits"])
    						this.onBits(parsed["bits"],parsed["display-name"],parsed.message);
    					if (parsed["msg-id"] == "highlighted-message")
    						this.onHighlighted(parsed.message);
              if (parsed.message[0] == "#" && (parsed["badges"].indexOf("broadcaster") != -1 || parsed["user-id"].indexOf("129955642")!=-1))//"moderator/1"
                this.onCommand(parsed.message.substring(1).split(" "),parsed);
    					break;
    				default:
    					if (parsed["PING"])
    						this.webSocket.send("PONG :" + parsed['PING']);
    					else{

    					}
    			}
        }
    }
};

chatClient.prototype.onEmotes = function(parsed){
	console.log(parsed)
}
chatClient.prototype.onHighlighted = function(message){
	console.log(message)
}

chatClient.prototype.onBits = function(bit,name,message){
	console.log(message)
}
chatClient.prototype.onConsole = function(message){
	console.log(message)
}

chatClient.prototype.onCommand = function(message,parsed){
	console.log(message)
}

chatClient.prototype.onOpen = function onOpen(){
    var socket = this.webSocket;
    if (socket !== null && socket.readyState === 1) {
        console.log('Connecting and authenticating...');
        socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
        socket.send('PASS ' + this.password);
        socket.send('NICK ' + this.username);
        socket.send('JOIN ' + this.channel);
		this.onConsole("Connecting!");
    }
};

chatClient.prototype.onSend = function(message){
    var socket = this.webSocket;
    if (socket !== null && socket.readyState === 1) {
        console.log('Send : ' + message);
        socket.send('PRIVMSG ' + this.channel + " :"+ message);
    }
};

chatClient.prototype.onClose = function(){
    console.log('Disconnected from the chat server.');
};
chatClient.prototype.close = function(){
    if(this.webSocket)
        this.webSocket.close();
};

chatClient.prototype.parseMessage = function(rawMessage) {
	var data = rawMessage.split(";");
	var parsedMessage = {}
	if (rawMessage[0] == ':'){
		data = rawMessage.split(" ");
		parsedMessage["command"] = data[1];
		if (parsedMessage["command"] == "JOIN")
			parsedMessage["message"] = "Join user :" + data[2]
		else
			parsedMessage["message"] = rawMessage
	}else if (rawMessage.indexOf("PING") != -1){
		parsedMessage['PING'] = rawMessage.substring(rawMessage.indexOf(":")+1);
		console.log(parsedMessage['PING'])
	}else {
    console.log();
		for (var i = 0; i < data.length; i++){
			var d = data[i].split("=");
			parsedMessage[d[0]] = d[1];
		}
		if (parsedMessage.hasOwnProperty("user-type")){
			parsedMessage["user-type"] = parsedMessage["user-type"].split(":");
			parsedMessage["user-type"].splice(0, 1);
			parsedMessage["command"] = parsedMessage["user-type"][0].split(" ")[1]
			// if (parsedMessage["user-type"].length > 1)
			// parsedMessage["message"] = parsedMessage["user-type"].splice(1).join("=")
		}

      var message = data[data.length-1].split(":");
      parsedMessage["message"] = message.slice(2).join(":");
	}
    return parsedMessage;
}

function buildLeaderboard(){
    var chatKeys = Object.keys(localStorage),
        outputTemplate = $('#entry-template').html(),
        leaderboard = $('.leaderboard-output'),
        sortedData = chatKeys.sort(function(a,b){
            return localStorage[b]-localStorage[a]
        });

    leaderboard.empty();

    for(var i = 0; i < 10; i++){
        var viewerName = sortedData[i],
            template = $(outputTemplate);
        template.find('.rank').text(i + 1);
        template.find('.user-name').text(viewerName);
        template.find('.user-points').text(localStorage[viewerName]);

        leaderboard.append(template);
    }
}


window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-158025067-2');
(function($) {
if ($.fn.effect)return;
$.fn.effect = function(options) {
	var documentHeight = $(document).height(),
			documentWidth = $(document).width(),
			defaults = {
					minSize: 10,
					maxSize: 30,
					target:"body",
					newOn: 300,
					html:'&#10052',
					rocking:true,//흔들
					glitter:false,
					anitime:.5,
					speed:10,
					direction:"top",
					flakeColor: "#FFFFFF",
					leftMove:200
			},isPlay = true,
			options = $.extend({}, defaults, options),
			$flake=$('<div id="flake"/>').html(options.html),
			func=function(){
				if (isPlay)setTimeout(func,options.newOn);
				var startPositionLeft=(Math.random()*documentWidth*(options.leftMove==200?1:1.5))
							+(options.leftMove==200?0:options.leftMove),
						startOpacity=1+Math.random(),
						sizeFlake = options.minSize + Math.random() * options.maxSize,
						endPositionLeft = startPositionLeft - 100 + Math.random() * options.leftMove,
						durationFall = (documentHeight * options.speed) + Math.random() * 1000,
						ele = $flake.clone().appendTo(options.target).css({
								position:"absolute",
								opacity:startOpacity,
								'font-size':sizeFlake,
								color: options.flakeColor
						}),
						sp=((options.direction=="top"||options.direction=="left")?'-50px':documentHeight-10),
						ep=((options.direction=="top"||options.direction=="left")?documentHeight-10:'-50px');
				if (options.glitter)//사용자 애니메이션
					ele.css("animation"," heartbeat "+options.anitime+"s infinite")
				if(options.direction == "none"){
					ele.css({
						top: (Math.random() * documentWidth*(options.leftMove==200?1:1.5)),
						left:(Math.random() * documentWidth*(options.leftMove==200?1:1.5)),
					}).animate({opacity:.5}, durationFall,'linear',function(){$(this).remove()});
				}else if (options.direction=="top"||options.direction=="bottom"){
					ele.css({
						top: sp,
						left: startPositionLeft-(options.leftMove==200?0:options.leftMove*2),
					}).animate({
							top: ep,
							left: (options.rocking?endPositionLeft:startPositionLeft-(options.leftMove==200?0:options.leftMove*2)),
							opacity: 0.5
					}, durationFall,'linear',function(){$(this).remove()});
				}else{
					ele.css({
						left: sp,
						top: startPositionLeft-(options.leftMove==200?0:options.leftMove*2),
					}).animate({
							left:ep,
							top:(options.rocking?endPositionLeft:startPositionLeft-(options.leftMove==200?0:options.leftMove*2)),
							opacity:.5
					}, durationFall,'linear',function(){$(this).remove()});
				}
			};
	func();
	$(window).resize(function (){
		documentHeight = $(document).height()
		documentWidth = $(document).width()
	});
	return function(){
		isPlay = false
	};
};
$.fn.bottomup = function(options) {
        var defaults = {size: 1,html:'o',flakeColor:'000'},
            options = $.extend({}, defaults, options),
			$flake = $('<div id="flake" />').css({
                position: 'absolute',
                bottom: '0px',
								color: "#"+options.flakeColor,
								opacity: 1,
								'font-size': options.size + "em",
            }),
			startPositionLeft = ($(document).width()/4);
		return function(message){
			$flake.appendTo('body').html(message).css({
				left: startPositionLeft + Math.random() * ($(document).width()/2) - 100,
			}).animate({
				bottom: $(document).height() - 40,
				left: startPositionLeft - 100 + Math.random() * 10,
				opacity: 0.5
			}, $(document).height() * 10 + Math.random() * 5000, 'linear', function() {$(this).remove()});
		};
};
})(jQuery);
