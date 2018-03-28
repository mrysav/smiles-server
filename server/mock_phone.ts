import * as io from "socket.io-client";
import * as readline from "readline";
import { Contact } from "../model/contact";
import { SmsMessage } from "../model/smsmessage";

const socket = io('http://localhost:3000/');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let me:Contact = new Contact('Mitchell Rysavy', '123-456-1234');

let mock_contacts = [
    new Contact('Other Dude', '123-456-5555'),
    new Contact('Carls Burg', '567-456-3455')
]

let mock_messages = [
    'This is a test message, doofus',
    '1234 test',
    'Another test'
];

function getRandomContact():Contact {
    return mock_contacts[(Math.random() * (mock_contacts.length - 1)).toFixed(0)];
}

function getRandomMessage(sender:Contact, receiver:Contact):SmsMessage {
    let rndMsg:string = mock_messages[(Math.random() * (mock_messages.length - 1)).toFixed(0)];
    return new SmsMessage(rndMsg, sender, receiver, new Date());
}

socket.on('connect', function () {
    console.log('connected to server');

    rl.question('enter a room id ', (answer) => {
        rl.close();
        socket.emit('join', 'android', answer);
        socket.emit('me', me);
        socket.emit('receive_message', getRandomMessage(getRandomContact(), me));
        socket.emit('receive_message', getRandomMessage(getRandomContact(), me));
        socket.emit('receive_message', getRandomMessage(getRandomContact(), me));
    });
});

socket.on('send_message', function(smsMessage) {
    let msg = SmsMessage.from(smsMessage);
    console.log('message to send received: ' + msg.toString());
    socket.emit('receive_message', getRandomMessage(msg.sender, me));
});

socket.on('error', function(msg) {
    console.log(msg);
});

