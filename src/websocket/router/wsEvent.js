module.exports = class WSEvent {

    #server;
    #channel;
    #sender;
    #args;
    #response;
    #isAborted = false;
    #state;

    #controller;

    get isAborted() {

        return this.#isAborted;
    }

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

    get state() {

        return this.#state;
    }

    get controller() {

        return this.#controller;
    }

    constructor(_channel, _sender, {args, response, server, state}) {

        this.#channel = _channel;
        this.#sender = _sender;
        this.#args = args;
        this.#server = server;
        this.#response = response;
        this.#state = state;
    }

    /**
     * 
     * @param {any} _state 
     */
    setState(_state) {

        this.#state = _state;
    }

    setController(_controller) {

        this.#controller = _controller;
    }

    abort() {

        this.#isAborted = true;
    }
}