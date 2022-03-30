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
class chatRoom{
  constructor(socket){
    chatid+=1;
    this.id = chatid;
    var tempusers = new Array;
    tempusers.push(socket);
    this.users = tempusers;
    
  }
  addClient(socket){
    this.users.push(socket);
  }
  removeClient(socket){
    var pos = users.indexOf(socket);
    users.splice(pos, 1);
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
    clients.splice(position, 1);
    console.log("connection closed");
  }

  function clientResponse(data) {
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
    console.log(chatRooms.length);
    if(chatRooms.length > 0){
      for (let c in chatRooms) {
        if(chatRooms[c].users.includes(thisClient)){
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
