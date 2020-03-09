const dgram = require('dgram');
const server = dgram.createSocket('udp4');
var express = require('express');
var app = express();
app.use('/', express.static('public'))
app.listen(9010);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

var clientsTotal = 0;
wss.on('connection', function connection(ws) {
	console.log("Client connected", clientsTotal++)
})

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  //console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
	//parse
	var splitMessage = msg.toString().split(",")
	var tx = {hash: splitMessage[0], trunkTransaction: splitMessage[1], branchTransaction: splitMessage[2], value: parseInt(splitMessage[3]), address: splitMessage[6]}

	//send
	// console.log("Broadcasting tx: ", tx);
	wss.broadcast(JSON.stringify(tx));
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});
server.bind(16501);
