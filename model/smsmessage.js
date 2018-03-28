"use strict";
exports.__esModule = true;
var contact_1 = require("./contact");
var SmsMessage = /** @class */ (function () {
    function SmsMessage(body, sender, receiver, date) {
        this.body = body;
        this.sender = sender;
        this.receiver = receiver;
        this.date = date;
    }
    SmsMessage.prototype.toString = function () {
        if (this.sender) {
            return '[' + this.sender.toString().toString() + ']: ' + this.body;
        }
        else {
            return this.body;
        }
    };
    SmsMessage.from = function (json) {
        return new SmsMessage(json.body, contact_1.Contact.from(json.sender), contact_1.Contact.from(json.receiver), new Date(json.date));
    };
    return SmsMessage;
}());
exports.SmsMessage = SmsMessage;
