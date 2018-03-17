export class Logger {
    public static log(socket:SocketIO.Socket, message:string): void {
        console.log("socket " + this.makeid(socket) + ": " + message)
    }
    private static makeid(socket:SocketIO.Socket): string {
        return socket.id.substr(0, 5);
    }
}
