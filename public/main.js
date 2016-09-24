var socket = io();

var pictionary = function() {
    var canvas, context;
    var drawing = false;
    var drawer = false;
    var mysteryWord;
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y, 6, 0, 2 * Math.PI);
        context.fill();
    };

    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;

    canvas.on('mousemove', function(event) {
        if (drawer) {
            canvas.on('mousedown', function() {
                drawing = true;
            });
            canvas.on('mouseup', function() {
                drawing = false;
            });
            if (drawing) {
                var offset = canvas.offset();
                var position = {
                    x: event.pageX - offset.left,
                    y: event.pageY - offset.top
                };
                draw(position);
                socket.emit('draw', position);
            }
        }
    });
    socket.on('draw', draw);

    ////Guess box
    var guessBox;

    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }
        var guess = guessBox.val();

        if (guess.toLowerCase() === mysteryWord) {
            socket.emit('correct guess');
            guessBox.val('');
        } else {
            socket.emit('guess', guess);
            $('#guesses').prepend('<li>' + guess + '</li>');
            guessBox.val('');
        }
    };

    socket.on('guess', function(guess) {
        $('#guesses').prepend('<li>' + guess + '</li>');
    });

    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);

    //Drawer Decision
    socket.on('drawer', function(word) {
        $('.waiting').hide();
        $('#word-space').show();
        $('#word').text(word);
        drawer = true;
        mysteryWord = word;
    });

    //Guesser Decision
    socket.on('guesser', function(word) {
        $('.waiting').hide();
        $('#guess').show();
        mysteryWord = word;
    });

    //End Game
    socket.on('correct guess', function() {
        drawer = false;
        $('.magic-word').text(mysteryWord);
        $('.end-game').show();
        $('#word-space').hide();
        $('#guess').hide();
    });

    //New Game
    $('.new-game').click(function() {
        socket.emit('new game');
        $('.end-game').hide();
        $('.waiting').show();
    });
};

$(document).ready(function() {
    pictionary();

});
