import * as express from "express";
import * as http from "http";
import * as io from "socket.io";
import * as path from "path";
import { Contact } from "../model/Contact";
import { SmsMessage } from '../model/smsmessage';

class App {

    private express;
    private io:SocketIO.Server;

    public http;

    constructor() {
        this.express = express();
        this.http = new http.Server(this.express);
        this.io = io(this.http);
        this.mountRoutes();
        this.mountSockets();
    }
    mountRoutes() {
        this.express.use(express.static('public'));
        this.express.get('/bundle.js', function(req:express.Request, res:express.Response) {
            res.sendFile(path.resolve('dist/bundle.js'));
        });
    }
    mountSockets() {
        this.io.on('connection', function (socket:SocketIO.Socket) {

            let me:Contact = new Contact('Other Dude', '123-456-1234');
            let miranda:Contact = new Contact('Miranda Montez', '123-456-5555');
            let carl:Contact = new Contact('Carls Burg', '567-456-3455');

            let mock_messages = [
                'This is a test message, doofus',
                '1234 test',
                'Hi love!',
                'Another test'
            ];

            socket.emit('auth_me', me);

            console.log('user connected');
            socket.on('sms_send', function (msg:string, receiver:string) {
                // wrap self message in an SmsMessage
                let recv:Contact = Contact.fromJSON(receiver);
                let snt:SmsMessage = new SmsMessage(msg, me, recv, new Date());
                socket.emit('sms_receive', snt);

                // send a mock response
                let snd:SmsMessage = new SmsMessage(mock_messages[(Math.random() * 3).toFixed(0)], recv, me, new Date());
                socket.emit('sms_receive', snd);
            });

            socket.on('disconnect', function () {
                console.log('user disconnected');
            });
        });
    }
}

exports.default = new App().http;