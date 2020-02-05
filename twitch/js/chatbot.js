/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
    
    This file is what connects to chat and parses messages as they come along. The chat client connects via a 
    Web Socket to Twitch chat. The important part events are onopen and onmessage.
*/

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
/* This is an example of a leaderboard scoring system. When someone sends a message to chat, we store 
   that value in local storage. It will show up when you click Populate Leaderboard in the UI. 
*/
chatClient.prototype.onMessage = function onMessage(message){
    if(message !== null){
        var parsed = this.parseMessage(message.data);
		//console.log(parsed);
        if(parsed !== null){
            if(parsed.command === "PRIVMSG") {
                userPoints = localStorage.getItem(parsed.username);
                //if(userPoints === null)localStorage.setItem(parsed.username, 10);
                //else localStorage.setItem(parsed.username, parseFloat(userPoints) + 0.25);// 포인트 제도
				if (parsed["emotes"]){
					var img = "http://static-cdn.jtvnw.net/emoticons/v1/";
					var emotes = parsed["emotes"].split("/");
					for(var i in emotes){// 이모티콘 리스트
						var index = emotes[i].indexOf(":")+1;
						for(var j =0 ; j< emotes[i].substring(index).split(",").length; j++)
							this.onEmotes(img+emotes[i].substring(0,index-1)+"/3.0");
					}
				}else if (parsed["msg-id"] == "highlighted-message")
					this.onHighlighted(parsed.message);
				else {
					//console.log(parsed['display-name'] + ":"+parsed.message);
				}
            } else if(parsed.command === "PING" || parsed["PING"]) {
                this.webSocket.send("PONG :" + parsed['PING']);
				//this.onCommand("PONG :" + parsed['PING']);
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

chatClient.prototype.onOpen = function onOpen(){
    var socket = this.webSocket;
    if (socket !== null && socket.readyState === 1) {
        console.log('Connecting and authenticating...');
        socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
        socket.send('PASS ' + this.password);
        socket.send('NICK ' + this.username);
        socket.send('JOIN ' + this.channel);
		this.onCommand("Connecting!");
    }
};

chatClient.prototype.onCommand = function(message){
	console.log(message);
}

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
		console.log(rawMessage)
		parsedMessage['PING'] = rawMessage.substring(rawMessage.indexOf(":")+1);
		console.log(parsedMessage['PING'])
	}else {
		for (var i = 0; i < data.length; i++){
			var d = data[i].split("=");
			parsedMessage[d[0]] = d[1];
		}
		if (parsedMessage.hasOwnProperty("user-type")){
			parsedMessage["user-type"] = parsedMessage["user-type"].split(":");
			parsedMessage["user-type"].splice(0, 1);
			
			parsedMessage["command"] = parsedMessage["user-type"][0].split(" ")[1]
			if (parsedMessage["user-type"].length > 1)
				parsedMessage["message"] = parsedMessage["user-type"][1]
		}
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
