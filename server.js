var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

server.listen(process.env.PORT || 8080, function() {
    console.log("Server is running at http://localhost:8080");
});

//Socket Listeners

io.on('draw', function(position) {
    console.log("Someone is drawing");
    io.broadcast.emit('draw', position);
});
