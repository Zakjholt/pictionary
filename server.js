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

var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];


var users = [];
var word;
var playersReady = 0;
//Socket Listeners
io.on('connection', function(socket) {
    users.push(socket);
    console.log('User connected. Current users: ' + users.length);
    //User Selection Phase
    function newGame() {
        word = WORDS[Math.floor(Math.random() * WORDS.length)];
        console.log('the word to guess is ' + word);

        var drawer = users[Math.floor(Math.random() * users.length)];

        drawer.emit('drawer', word);
        drawer.broadcast.emit('guesser', word);
    }

    if (users.length > 1) {
        newGame();
    }

    socket.on('new game', function() {
        playersReady++;
        if (playersReady === users.length) {
            playersReady = 0;
            newGame();
        }
    });

    socket.on('draw', function(position) {
        socket.broadcast.emit('draw', position);
    });
    socket.on('guess', function(guess) {
        socket.broadcast.emit('guess', guess);
        console.log('User made a guess: ' + guess);
    });
    socket.on('correct guess', function() {
        console.log('Some one guessed the correct word: ' + word);
        io.emit('correct guess');
    });

    socket.on('disconnect', function() {
        var index = users.indexOf(socket);
        users.splice(index, 1);
        console.log('User disconnected. Current users: ' + users.length);
        socket.broadcast.emit('user disconnected', users.length);
    });
});
