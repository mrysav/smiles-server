import * as io from "socket.io-client";
import * as $ from "jquery";

const socket = io('/');

console.log('connecting...');

socket.on('connect', function() {
    console.log('connected');
});

$('form').submit(function () {
    socket.emit('sms', $('#m').val());
    $('#m').val('');
    return false;
});

socket.on('sms', function(msg) {
    console.log(msg);
});