import { Contact } from "./contact";

export class SmsMessage {
    body:string
    sender:Contact
    receiver:Contact
    date:Date

    constructor(body:string, sender:Contact, receiver:Contact, date:Date) {
        this.body = body;
        this.sender = sender;
        this.receiver = receiver;
        this.date = date;
    }

    public toString(): string {
        if (this.sender) {
            return '[' + this.sender.toString().toString() + ']: ' + this.body;
        } else {
            return this.body;
        }
    }

    public static from(json): SmsMessage {
        return new SmsMessage(json.body, 
            Contact.from(json.sender), 
            Contact.from(json.receiver),
            new Date(json.date));
    }
}