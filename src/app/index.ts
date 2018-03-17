import * as io from "socket.io-client";
import * as $ from "jquery";

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SmsMessage } from '../model/smsmessage';
import { Contact } from '../model/contact';

const socket = io('/');

const messages:Map<string, Array<SmsMessage>> = new Map();
const contacts:Map<string, Contact> = new Map();
let selectedContact:Contact;
let me:Contact;

socket.on('connect', function() {
    socket.emit('join', 'web');
});

socket.on('room_id', function(room_id:string) {
    console.log('got room id: ' + room_id);
    $('.header').text(room_id);
})

socket.on('me', function(server_me) {
    me = Contact.from(server_me);
    console.log('received identity: ' + me.toString());
});

socket.on('receive_message', function(msg) {
    console.log('received server message');
    console.log(msg);
    handle_message(SmsMessage.from(msg));
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
    socket.emit('send_message', text, receiver);
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

    let contact:Contact;

    if (msg.receiver.number === me.number) {
        contact = msg.sender;
    } else if (msg.sender.number === me.number) {
        contact = msg.receiver;
    } else {
        console.log('message does not appear to belong here: ' + msg.toString());
        return;
    }

    if (!messages.has(contact.number)) {
        messages.set(contact.number, new Array());
    }

    if(!contacts.has(contact.number)) {
        contacts.set(contact.number, Contact.from(contact));
    }

    messages.get(contact.number).push(msg);
    messages.get(contact.number).sort(function(a:SmsMessage,b:SmsMessage) {
        return a.date.getTime() - b.date.getTime();
    });

    if (selectedContact === null) {
        selectedContact = contact;
    }

    if (selectedContact.number === contact.number) {
        append_message(msg);
    }

    update_contacts();
}

function update_contacts() {
    contacts.forEach(function (p) {
        let contactsView = document.querySelector('#contacts-view');
        let contactCard = contactsView.querySelector('.contact[data-number="' + p.number + '"]');
        if (!contactCard) {
            let newCard = document.createElement('div');
            newCard.classList.add('contact');
            newCard.innerHTML = p.name + '<br/><div class="number">' + p.number + '</div>';
            newCard.dataset.number = p.number;
            newCard.addEventListener('click', handleClickContact);
            contactsView.appendChild(newCard);
        }
    });
}

function handleClickContact(e:MouseEvent) {
    let contactCard = e.srcElement;
    let number:string = contactCard.getAttribute('data-number');
    selectedContact = contacts.get(number);
}