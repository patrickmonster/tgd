Element.prototype.createElement=Element.prototype.C=function(ele){var ele=document.createElement(ele);this.appendChild(ele);return ele};
window.addScript=document.addScript=function(a,b){b=document.head.C('script');b.src=a;return b};
window.addLink=document.addLink=function(a,b){b=document.head.C('link');b.src=a;return b};
window.addStyle=document.addStyle=function(a,b){b=document.head.C('style');b.innerHTML=a;return b};

window.oauth_client_id = "g1rhyzp1s7y2d755xqjn1otspdgvc3";
window.oauth_redirect_uri = "http://549.ipdisk.co.kr/chatbot/";
//채팅
let commandSant = {
	command:null,channel:null,user:{}, conn:0,chat:0,chats:[],
	onChat:0
},onStop,options;
var effect_style=document.addStyle("");

if (document.location.hash.indexOf("access_token")!=-1){
	permiss();
}else{
	const oauth = localStorage.getItem("oauth");
	load_page();
	options = getEffect({effect:"cherryblossom2",target:"#cover"});
	$.fn.effect(options);
	if(oauth){
		ChatConnect(oauth);
		connectCommand(oauth);
	}//로그인이 되지 않음
}
//=============================== 이펙트 모듈 ===============================

//이펙트 변경
function changedEffect(){
	clearEffect();
	options = getEffect({effect:document.getElementById("option1").selectedOptions[0].value,target:"#cover"});
	$.fn.effect(options);
	document.getElementById("count_selecter").value=options.count;
	document.getElementById("speed_selecter").value=options.speed;
}
function changedOptions() {
	clearEffect();
	options=getEffect(getEffectOption());
	options.target="#cover";
	$.fn.effect(options);
}

function clearEffect(){document.getElementById("cover").innerHTML=""}

function getURL(){
	var options=getEffectOption(),out=[];//https://patrickmonster.github.io/effect/v.2/?effect=
	options.color=options.color.substring(1);
	for(var i in options)
		out.push(i+"="+options[i]);
	return "https://patrickmonster.github.io/effect/v.2/?"+out.join("&");
}

function changeColor(color){
	effect_style.innerHTML='#flake{color:'+color+' !important}';
}

function getEffectOption(){
	var e={
		count:document.getElementById("count_selecter").value,
		color:document.getElementById('color_selecter').value,
		speed:document.getElementById("speed_selecter").value,
		effect: document.getElementById("option1").selectedOptions[0].value + (document.getElementById("rand").checked?"rand":""),
	};
	if(document.getElementById("rand").checked){
		e.x=document.getElementById("rand_x").value;
		e.y=document.getElementById("rand_y").value;
	}
	return e;
}

//=============================== TTS 모듈 ===============================


let voices = [],setVoiceList=()=>{
	voices=window.speechSynthesis.getVoices();
};
setVoiceList();
if (window.speechSynthesis.onvoiceschanged !== undefined){
	window.speechSynthesis.onvoiceschanged=setVoiceList;
}

function callCromarkey(name){
	commandSant.command.onSend("*"+name);
}

function removeCromarkey(name){
	delete cromarks[name];
	reCromarkey();
	commandSant.command.onSend(commandSant.channel.channel+" #영상 "+name+" \'");
	localStorage.setItem("chromakey",JSON.stringify(cromarks));
}

function addCromarkey(name,url,a){
	if(!url||a)alert("잘못된 형식");
	cromarks[name] = url;
	reCromarkey();
	commandSant.command.onSend("#영상 "+name+" "+url);
	localStorage.setItem("chromakey",JSON.stringify(cromarks));
}

//TTS용
//=============================== 채팅 모듈 ===============================
var users=["nightbot","twipkr","bbangddeock","ssakdook"],users_lenght=users.length;
var voices_user=[],cromarks=JSON.parse(localStorage.getItem("chromakey"))||{"oh":"https://cdn.discordapp.com/attachments/684630428908388352/684631231933054986/Oh_oh_oh_Chroma_Key-o7WVRrA89-s.mp4"},
	reCromarkey;
function TTS_Chatuser_add(display_id){
	commandSant.channel.getUser(display_id,function(t){
		var u=JSON.parse(t)["users"][0];
		voices_user.push([display_id,"<a onclick=''></a>"]);
	})
}


function ChatConnect(oauth){// 사용자 채널에 연결
	commandSant.channel=new chatClient({password:oauth});
	commandSant.channel.isMood=true;//매니져 권한
	commandSant.channel.onCommand=function(message,parsed){
		if(commandSant.conn)
			commandSant.conn.call(commandSant.channel,message,parsed);
	};
	commandSant.channel.onChating=function(parsed){//채팅 인식
		commandSant.chats.push({"display-name":parsed["display-name"],"display-id":parsed["display-id"],"message":parsed["message"]})
		if(commandSant.chat)
			commandSant.chat.call(commandSant.channel,parsed);
	};
	commandSant.channel.getUser(commandSant.channel.username,function(t){
		console.log(t);
		commandSant.user=JSON.parse(t)["users"][0];
		var ele =document.getElementById("login");
		voices_user.push([commandSant.user["display-id"],"<a onclick=''>"+commandSant.user["display-name"]+"</a>"]);

		users.push(commandSant.user["name"]);
		users_lenght=users.length;

		ele.innerHTML=commandSant.user["display_name"]+"님 반갑습니다";
		ele.setAttribute("onclick","");
	});
	commandSant.channel.open();
	//display-name
}

// 통신 데이터  - 사용자 _id
//{"display_name":"네오캣짱","_id":"129955642","name":"neocats_","type":"user","bio":null,
//"created_at":"2016-07-19T12:28:20.760139Z","updated_at":"2020-03-22T22:30:44.942731Z","logo":"로고"}

//명령 채널
function connectCommand(oauth){//명령 채널에 연결
	const target="recodingbot";//명령 채
	if(commandSant.command)return //commandSant.channel.close();//기존연결 해제
	commandSant.command = new chatClient({channel:target,username:commandSant.channel.username,password:oauth});
	/*
	commandSant.command.isMood=true;//매니져 권한
	commandSant.command.onCommand=function(comm,parsed){
		//동일 채널 명령이거나
		if(parsed["_id"] != commandSant.user['_id'])return;//채널명이 동일하지 않으면 제거
		delete comm[0];
		for(var i of commandSant.conn){
			if(i.hasOwnProperty("onCommand"))
				i.onCommand(comm,parsed);
		}
	}*/
	commandSant.command.open();
}

function sandCommand(comm){
	commandSant.command.onSend("#"+commandSant.user['_id']+" "+comm);
}

//=============================== 기본 모듈 ===============================
function getParams(name, address = window.location.href) {
	let url;
	let results = "";
	url = new URL(address);
	if (typeof url.searchParams === 'undefined') {
		results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(address);
		if (results == null) {
			return null;
		} else {
			return decodeURI(results[1]) || 0;
		}
	} else {
		return url.searchParams.get(name);
	}
}

//=============================== 페이지 모듈 ===============================
function load_page(){
	if(!location.hash||
			["#home","#effect","#tts","#emote","#cromark","#timmer","#question","#programmer","#donate","#discord"].indexOf(location.hash)==-1)
		location.hash="home";
	// console.log("./page/"+location.hash.substring(1)+".html");

	// document.getElementById("main").setAttribute("src","./page/"+location.hash.substring(1)+".html");
	ajax("./page/"+location.hash.substring(1)+".html",function(txt){
		let ele = document.getElementById("content");
		ele.innerHTML=txt;
		var scripts = ele.getElementsByTagName("script");
		for(var i of scripts)
			eval(i.innerHTML);
		if(location.hash=="#effect"){
			console.log(document.getElementById("option1"));
			console.log(options);
			document.getElementById("count_selecter").value=options.count;
			document.getElementById('color_selecter').value=options.color||"#ffffff";
			document.getElementById("speed_selecter").value=options.speed;

		}
	});
}

function ajax(url,f){//호출
	var xmlhttp;
	if(window.XMLHttpRequest)
		xmlhttp=new XMLHttpRequest();
	else xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			//item(JSON.parse(this.responseText),tap);
			typeof f=='function'&&f(this.responseText);
		}
	};
	xmlhttp.open("GET",url, true);
	xmlhttp.send();
}

function copyToClipboard(value) {
  var aux = document.createElement("input");
  aux.setAttribute("value", value);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
	document.body.removeChild(aux);
}
