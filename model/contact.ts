export class Contact {
    name:string
    number:string

    constructor(name:string, number:string) {
        this.name = name;
        this.number = number;
    }

    public toString(): string {
        return this.name + ' (' + this.number + ')';
    }

    public static from(json): Contact {
        return new Contact(json.name, json.number);
    }
}
