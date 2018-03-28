import ES6Promise from 'es6-promise';
ES6Promise.polyfill();

import * as io from "socket.io-client";

import { SmsMessage } from '../../model/smsmessage';
import { Contact } from '../../model/contact';

import Map from 'es6-map';

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
    document.querySelector('.header').textContent = room_id;
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

document.querySelector('form').addEventListener("submit", function(e) {
    e.preventDefault();
    let mBox:HTMLInputElement = document.querySelector('#m');
    let text = mBox.value;
    send_message(text,selectedContact);
    mBox.value = '';
    let elem = document.getElementById('messages');
    elem.scrollTop = elem.scrollHeight;
})

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
    var newmsg = document.createElement('div');
    newmsg.classList.add('message');
    if (me.number === msg.sender.number) {
        newmsg.classList.add('self');
    }
    newmsg.textContent = msg.body;
    document.querySelector('#messages').appendChild(newmsg);
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

    console.log(contact);

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

    if (selectedContact === undefined) {
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
    let contactElms = document.querySelectorAll('.contact');
    for (let i = 0; i < contactElms.length; i++) {
        contactElms.item(i).classList.remove('selected');
    }
    contactCard.classList.add('selected');
    selectedContact = contacts.get(number);
}
