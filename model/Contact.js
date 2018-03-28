"use strict";
exports.__esModule = true;
var Contact = /** @class */ (function () {
    function Contact(name, number) {
        this.name = name;
        this.number = number;
    }
    Contact.prototype.toString = function () {
        return this.name + ' (' + this.number + ')';
    };
    Contact.from = function (json) {
        return new Contact(json.name, json.number);
    };
    return Contact;
}());
exports.Contact = Contact;
