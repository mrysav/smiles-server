import * as express from "express";
import * as http from "http";
import * as SocketIO from "socket.io";
import * as path from "path";
import { Contact } from "../model/Contact";
import { SmsMessage } from '../model/smsmessage';
import { Logger } from './logger';
import { ClientPair } from './client_pair';

class app {

    private express;
    private io:SocketIO.Server;
    public http;

    private clients:Map<string,ClientPair> = new Map();

    constructor() {
        this.express = express();
        this.http = new http.Server(this.express);
        this.io = SocketIO(this.http);
        this.mountRoutes();
        this.mountSockets();
    }

    mountRoutes() {
        this.express.use(express.static('wwwroot'));
    }

    mountSockets() {
        let app:app = this;

        this.io.on('connection', function (socket:SocketIO.Socket) {
            Logger.log(socket, 'connected');
            socket.on('join', function(type:string,roomId:string) {
                if (type === 'web') {
                    Logger.log(socket, 'identified as web client');
                    app.mountWebClientSockets(socket, roomId);
                } else if (type === 'android') {
                    Logger.log(socket, 'identified as android client');
                    app.mountAndroidClientSockets(socket, roomId);
                }
            });

            socket.on('disconnect', function () {
                console.log('user disconnected');
            });
        });
    }

    mountWebClientSockets(socket:SocketIO.Socket,roomId:string) {

        console.log('socket: ' + socket.id + ', roomid: ' + roomId);
        let clientPair:ClientPair;
        let id = roomId;
        if (id !== undefined) {
            clientPair = this.clients.get(id);
        } else {
            id = socket.id.substr(0,6);
        }
        console.log('id: ' + id);

        if (clientPair === undefined) {
            clientPair = new ClientPair(id);
            this.clients.set(id, clientPair);
        }
        console.log('clientpair: ' + clientPair);

        clientPair.setWebSocket(socket);

        socket.emit('room_id', clientPair.getId());

        clientPair.onPhoneConnect(() => {
            clientPair.getPhoneSocket().on('me', function(me) {
                let m:Contact = Contact.from(me);
                console.log('phone sent identity: ' + m.toString());
                clientPair.setMe(m);
                clientPair.getWebSocket().emit('me', m);
            });
            clientPair.getPhoneSocket().on('receive_message', function(smsMessage) {
                if (clientPair.isInitialized()) {
                    console.log('phone sent message ');
                    console.log(smsMessage);
                    clientPair.getWebSocket().emit('receive_message', smsMessage);
                }
            })
            clientPair.getWebSocket().on('send_message', function(msg, receiver) {
                if (clientPair.isInitialized()) {
                    let sent = new SmsMessage(msg, clientPair.getMe(), Contact.from(receiver), new Date());
                    console.log('web sent message');
                    console.log(sent);
                    clientPair.getPhoneSocket().emit('send_message', msg);
                }
            });
        });
    }

    mountAndroidClientSockets(socket:SocketIO.Socket,roomId:string) {

        let clientPair:ClientPair;
        if (roomId !== undefined) {
            clientPair = this.clients.get(roomId);
        }
        if (clientPair === undefined) {
            socket.emit('error', 'room ID not found on server');
            socket.disconnect();
            return;
        }

        clientPair.setPhoneSocket(socket);
    }
}

exports.default = new app().http;