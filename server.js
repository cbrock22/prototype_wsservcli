var express = require('express');
// a local instance of express:
var server = express();
// instance of the websocket server:
var wsServer = require('express-ws')(server);
// list of client connections:
var clients = new Array;
var chatRooms = new Array;
var chatid = 0;
// serve static files from /public:
server.use('/', express.static('public'));

class message{
  constructor(t){
    this.text = t;
  }
}

class chatRoom{
  constructor(socket){
    chatid+=1;
    this.id = chatid;
    var tempusers = new Array;
    tempusers.push(socket);
    this.users = tempusers;
    this.usernamehistory = new Array;
    this.history = new Array;
  }
  addClient(socket){
    this.users.push(socket);
  }
  removeClient(socket){
    var pos = this.users.indexOf(socket);
    this.users.splice(pos, 1);
  }
  addMessage(m){
    var tempmessage = new message(m);
    this.history.push(tempmessage.text);
  }
}




// this runs after the server successfully starts:
function serverStart() {
  var port = this.address().port;
  console.log('Server listening on port ' + port);
}

function handleClient(thisClient, request) {
  console.log("New Connection");
  clients.push(thisClient);    // add this client to the clients array

  function endClient() {
    var position = clients.indexOf(thisClient);
    for(c in chatRooms){
      if(chatRooms[c].users.includes(thisClient)){
        console.log(chatRooms[c].history);
        chatRooms[c].removeClient(thisClient);
      }
      if(chatRooms[c].users.length == 0){ //if a chat room has no users in it --> save the chat history as a txt file
        console.log("hit log function");
        logExtinctChat(chatRooms[c]);
        chatRooms.splice(c,1); //remove the chat room from the array of active chat rooms -- to avoid writing the file twice

      }
    }
    clients.splice(position, 1);
    console.log("connection closed");
  }

  function logUserName(data){
    var unarr = data.split(':');
    var name = unarr[0];
    for(c in chatRooms){
      if(chatRooms[c].users.includes(thisClient)){
        if(!chatRooms[c].usernamehistory.includes(name))
          chatRooms[c].usernamehistory.push(name);
      }
    }
  }

  function clientResponse(data) {
    logUserName(data)
    if(data.substring(0,13) == 'connecttochat'){
      connectToChat(data.substring(data.length-1));
    }
    if (data == 'createchat'){
      createChat();
    }
    else if (data != 'createchat' && data.substring(0,13) != 'connecttochat'){
      //console.log('fell into else if')
      
      broadcast(data, thisClient);}
  }

  function logExtinctChat(cr){
    var folderName = "C:/Users/coleb/Desktop/mywebsocket/ExpressWsServer/logs/";
    var now = new Date();
    var logfile_name = now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDate();
    var f = (folderName + logfile_name);
    var logfiletime = now.getHours() + "-" + now.getMinutes() + "-" + now.getSeconds() + "-chatid-" + cr.id;
    const fs = require("fs");
    if(!fs.existsSync(f)) fs.mkdirSync(f, { recursive: true})
      const file = fs.createWriteStream(folderName + logfile_name + '/' + logfiletime +'.txt');

      file.on('error', (err)=> {
        console.log(err);
      });
      file.write("User Participation in Chat Room " + cr.id + " : ");
      cr.usernamehistory.forEach((u) => {
        file.write(u + ', ')
      });
      file.write('\n');
      cr.history.forEach((v) => {
        file.write(v + '\n');
      });
    
    
    
    
    file.end();
    
  }

  function createChat(){
    var cc = new chatRoom(thisClient);
    thisClient.send("You are in chat room : " + cc.id);
    chatRooms.push(cc);
    console.log("Chat Room With ID : " + cc.id + " has been created.");
  }

  function connectToChat(cid){
    //console.log(chatRooms.length)
    for (let c in chatRooms){
      if (chatRooms[c].id == cid){
        chatRooms[c].addClient(thisClient);
        thisClient.send("Successfully added to chat room " + cid);
        console.log('New User Connected to Chat Room!')
      }
    }
  }

  function broadcast(data, thisClient) {
    //console.log(chatRooms.length);
    if(chatRooms.length > 0){
      for (let c in chatRooms) {
        if(chatRooms[c].users.includes(thisClient)){
          chatRooms[c].addMessage(data);
          for(let u in chatRooms[c].users){
            if(chatRooms[c].users[u] != thisClient){
              chatRooms[c].users[u].send(data);
            }
          }
        }
      }
    }
    else{
      thisClient.send("Chat room not found. Please try again...")
    }
  }
  
  // set up client event listeners:
  //thisClient.on('createchat', createChat);
  thisClient.on('message', clientResponse);
  thisClient.on('close', endClient);
}




// start the server:
server.listen(process.env.PORT || 3000, serverStart);
// listen for websocket connections:
server.ws('/', handleClient);
