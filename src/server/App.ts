import * as express from "express";
import * as http from "http";
import * as io from "socket.io";
import * as path from "path";

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
        this.io.on('connection', function (socket) {

            var mock_messages = [{
                    'name': 'Mitchell Rysavy',
                    'number': '123-456-1234',
                    'picture': '',
                    'message': 'This is a test message, doofus',
                    'date': '1'
                }, {
                    'name': 'Mitchell Rysavy',
                    'number': '123-456-1234',
                    'picture': '',
                    'message': '1234 Test',
                    'date': '2'
                }, {
                    'name': 'Miranda Montez',
                    'number': '123-456-5555',
                    'picture': '',
                    'message': 'Hi love!',
                    'date': '3'
                }, {
                    'name': 'Mitchell Rysavy',
                    'number': '123-456-1234',
                    'picture': '',
                    'message': 'Another test',
                    'date': '4'
                }]

            console.log('user connected');
            socket.on('sms', function (msg) {
                console.log('sms: ' + msg);
                socket.emit('sms', msg);
            });
            socket.on('disconnect', function () {
                console.log('user disconnected');
            });
            socket.on('recent_messages', function() {
                socket.emit('recent_messages', mock_messages);
            })
        });
    }
}

exports.default = new App().http;