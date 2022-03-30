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

function setup() {
  // get all the DOM elements that need listeners:
  createChat = document.getElementById('createChat');
  connChat = document.getElementById('chatID');
  incomingSpan = document.getElementById('incoming');
  outgoingText = document.getElementById('outgoing');
  connectionSpan = document.getElementById('connection');
  connectButton = document.getElementById('connectButton');
  // set the listeners:
  
  outgoingText.addEventListener('change', sendMessage);
  connChat.addEventListener('change', connectToChat);
  connectButton.addEventListener('click', changeConnection);
  createChat.addEventListener('click', createNewChat);
  openSocket(serverURL);
}

function openSocket(url) {
  // open the socket:
  socket = new WebSocket(url);
  socket.addEventListener('open', openConnection);
  socket.addEventListener('close', closeConnection);
  socket.addEventListener('message', readIncomingMessage);
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
  var tag = document.createElement("p"); 
  var text = document.createTextNode("> " +event.data); 
  tag.appendChild(text); 
  var element = document.getElementsByTagName("body")[0];
  element.appendChild(tag); 
}

function sendMessage() {
  //if the socket's open, send a message:
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(outgoingText.value);
  }
}

// add a listener for the page to load:
window.addEventListener('load', setup);
