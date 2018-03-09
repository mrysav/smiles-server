import * as io from "socket.io-client";
import * as $ from "jquery";

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io('/');

console.log('connecting...');

socket.on('connect', function() {
    console.log('connected');
});

socket.on('sms', function(msg) {
    console.log(msg);
});

$('form').submit(function () {
    var text = $('#m').val().toString();
    new_message(text);
    $('#m').val('');
    var elem = document.getElementById('messages');
    elem.scrollTop = elem.scrollHeight;
    return false;
});

function new_message(text:String) {
    if (text === "null" || text === "") {
        return;
    }
    socket.emit('sms', text);
    var newmsg = $('<div />');
    newmsg.addClass('message self');
    newmsg.text(text.toString());
    $('#messages').append(newmsg);
}