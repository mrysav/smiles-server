import * as express from "express";
import * as http from "http";
import * as path from "path";
import * as io from "socket.io";

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
        const router = express.Router();
        router.get('/', (req, res) => {
            res.sendFile(path.resolve('public/index.html'));
        });
        this.express.use('/', router);
    }
    mountSockets() {
        this.io.on('connection', function (socket) {
            console.log('user connected');
            socket.on('sms', function (msg) {
                console.log('sms: ' + msg);
            });
            socket.on('disconnect', function () {
                console.log('user disconnected');
            });
        });
    }
}

exports.default = new App().http;