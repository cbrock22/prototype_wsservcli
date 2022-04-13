// get the server URL from the window.location:
// change 'wss' to 'ws' for running without SSL):
let serverURL = 'ws://' + window.location.host;
// the webSocket connection:
let socket;
// variables for the DOM elements:
let incomingSpan;
let outgoingText;
let connectionSpan;
let connectButton;
let createChat;
let connChat;
let username;
var user = null;
var chatLog = new Array;
var userLog = new Array;


function setup() {
  // get all the DOM elements that need listeners:
  createChat = document.getElementById('createChat');
  connChat = document.getElementById('chatID');
  incomingSpan = document.getElementById('incoming');
  outgoingText = document.getElementById('outgoing');
  connectionSpan = document.getElementById('connection');
  connectButton = document.getElementById('connectButton');
  username = document.getElementById('username');
  save = document.getElementById('saveButton');
  // set the listeners:
  
  outgoingText.addEventListener('change', sendMessage);
  connChat.addEventListener('change', connectToChat);
  username.addEventListener('change', checkUsername);
  connectButton.addEventListener('click', changeConnection);
  createChat.addEventListener('click', createNewChat);
  save.addEventListener('click', saveChat);
  openSocket(serverURL);
}

function saveChat(){
  //var path = require('path');
  console.log(chatLog);
  var file_name = 'test.txt';
  var file = new Blob(chatLog, {type: "text/plain;charset=utf-8"});
    if (window.navigator.msSaveOrOpenBlob) 
        window.navigator.msSaveOrOpenBlob(file, file_name);
    else { 
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = file_name;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
  
}

function openSocket(url) {
  // open the socket:
  socket = new WebSocket(url);
  socket.addEventListener('open', openConnection);
  socket.addEventListener('close', closeConnection);
  socket.addEventListener('message', readIncomingMessage);
}

function checkUsername(){
  if(user == null){
    user = username.value;
  }
  else{
    alert("You cannot change your username once it is set for security purposes.");
  }
  username.value="";
}

function changeConnection(event) {
  // open the connection if it's closed, or close it if open:
  if (socket.readyState === WebSocket.CLOSED) {
    openSocket(serverURL);
  } else {
    socket.close();
  }
}

function createNewChat() {
  //send convo id to server:
  console.log('I am in createNewChat... yay');
  socket.send('createchat')
  }

function connectToChat(){
  socket.send('connecttochat:'+connChat.value)
}

function openConnection() {
  // display the change of state:
  connectionSpan.innerHTML = "True";
  connectButton.value = "Disconnect";
}

function closeConnection() {
  // display the change of state:
  connectionSpan.innerHTML = "False";
  connectButton.value = "Connect";
}

function readIncomingMessage(event) {
  // display the incoming message:
  //incomingSpan.innerHTML = event.data;
  chatLog.push(event.data + '\n');
  var un = event.data;
  un = un.split(':');
  if(!userLog.includes(un)){userLog.push(un);}
  var tag = document.createElement("p"); 
  var text = document.createTextNode("\t> " +event.data); 
  tag.appendChild(text); 
  var element = document.getElementsByTagName("body")[0];
  element.appendChild(tag); 
}

function sendMessage() {
  //if the socket's open, send a message:
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(user + " : " + outgoingText.value);
    chatLog.push(user + " : " + outgoingText.value + '\n');
  }
  var tag = document.createElement("p"); 
  var text = document.createTextNode(outgoingText.value + " \t< You\t\t");
  tag.style.textAlign = "center"; 
  tag.appendChild(text); 
  var element = document.getElementsByTagName("body")[0];
  element.appendChild(tag);
  outgoingText.value = "";
}

// add a listener for the page to load:
window.addEventListener('load', setup);
