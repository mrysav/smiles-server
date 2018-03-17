import { Contact } from '../model/contact';

export class ClientPair {
    
    private id:string;
    private me:Contact;
    private phoneSocket:SocketIO.Socket;
    private webSocket:SocketIO.Socket;
    private phoneConnectCallback:Function;
    private webConnectCallback:Function;

    constructor(id:string) {
        this.id = id;
    }

    public getId():string {
        return this.id;
    }

    public getMe():Contact {
        return this.me;
    }

    public setMe(me:Contact) {
        this.me = me;
    }

    public getPhoneSocket():SocketIO.Socket {
        return this.phoneSocket;
    }

    public setPhoneSocket(socket:SocketIO.Socket) {
        this.phoneSocket = socket;
        if (this.phoneConnectCallback !== undefined) {
            this.phoneConnectCallback();
        }
    }

    public getWebSocket():SocketIO.Socket {
        return this.webSocket;
    }

    public setWebSocket(socket:SocketIO.Socket) {
        this.webSocket = socket;
        if (this.webConnectCallback !== undefined) {
            this.webConnectCallback();
        }
    }

    public isInitialized() { 
        return this.phoneSocket !== undefined && this.webSocket !== undefined && this.me !== undefined;
    }

    public onPhoneConnect(callback:Function) {
        this.phoneConnectCallback = callback;
        if (this.getPhoneSocket() !== undefined) {
            this.phoneConnectCallback();
        }
    }

    public onWebConnect(callback:Function) {
        this.webConnectCallback = callback;
        if (this.getWebSocket() !== undefined) {
            this.webConnectCallback();
        }
    }
}