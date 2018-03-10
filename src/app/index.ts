import * as io from "socket.io-client";
import * as $ from "jquery";

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SmsMessage } from '../model/smsmessage';
import { Contact } from '../model/contact';

const socket = io('/');

const messages:Map<string, Array<SmsMessage>> = new Map();
let selectedContact:Contact = new Contact('Carls Burg', '567-456-3455');
let me:Contact;

socket.on('connect', function() {
    console.log('connected');
});

socket.on('auth_me', function(server_me) {
    me = Contact.fromJSON(server_me);
    console.log('received identity: ' + me.toString());
});

socket.on('sms_receive', function(msg) {
    handle_message(SmsMessage.fromJSON(msg));
});

$('form').submit(function () {
    var text = $('#m').val().toString();
    send_message(text,selectedContact);
    $('#m').val('');
    var elem = document.getElementById('messages');
    elem.scrollTop = elem.scrollHeight;
    return false;
});

function send_message(text:string, receiver:Contact) {
    if (text === "null" || text.trim() === "") {
        return;
    }
    socket.emit('sms_send', text, receiver);
}

function append_message(msg:SmsMessage) {
    if (msg.body === "null" || msg.body === "") {
        return;
    }
    var newmsg = $('<div />');
    newmsg.addClass('message');
    if (me.number === msg.sender.number) {
        newmsg.addClass('self');
    }
    newmsg.text(msg.body);
    $('#messages').append(newmsg);
}

function handle_message(msg:SmsMessage) {
    // console.log("received: " + msg.toString());

    let numKey:string;

    if (msg.receiver.number === me.number) {
        numKey = msg.sender.number;
    } else if (msg.sender.number === me.number) {
        numKey = msg.receiver.number;
    } else {
        console.log('message does not appear to belong here: ' + msg.toString());
        return;
    }

    if (!messages.has(numKey)) {
        messages.set(numKey, new Array());
    }

    messages.get(numKey).push(msg);
    messages.get(numKey).sort(function(a:SmsMessage,b:SmsMessage) {
        return a.date.getTime() - b.date.getTime();
    });

    if (selectedContact.number === numKey) {
        append_message(msg);
    }
}