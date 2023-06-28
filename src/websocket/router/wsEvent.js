module.exports = class WSEvent {

    #server;
    #channel;
    #sender;
    #args;
    #response;

    get sender() {

        return this.#sender;
    }

    get response() {

        return this.#response;
    }

    get args() {

        return this.#args;
    }

    get channel() {

        return this.#channel;
    }

    get server() {

        return this.#server;
    }

    constructor(_channel, _sender, {args, response, server}) {

        this.#channel = _channel;
        this.#sender = _sender;
        this.#args = args;
        this.#server = server;
        this.#response = response;
    }
}