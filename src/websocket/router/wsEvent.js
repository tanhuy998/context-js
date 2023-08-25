const { Socket } = require("socket.io");

/**
 *  @global
 * 
 *  @typedef {import('socket.io').Server} IOServer
 *  @typedef {import('../controller/wsController')} WSController
 *  @typedef {import('socket.io').Socket} IOSocket
 */

module.exports = class WSEvent {

    /** @type {IOServer} */
    #server;

    /** @type {string} */
    #channel;

    /** @type {IOSocket} */
    #sender;

    /** @type {Array<any>} */
    #args;

    /** @type {?Function} */
    #response;

    /** @type {boolean} */
    #isAborted = false;

    #state;

    /** @type {WSController} */
    #controller;

    /** @type {boolean} */
    get isAborted() {

        return this.#isAborted;
    }

    /** @type {IOSocket} */
    get sender() {

        return this.#sender;
    }

    /** @type {?Function} */
    get response() {

        return this.#response;
    }

    /** @type {Array<any>} */
    get args() {

        return this.#args;
    }

    /** @type {string} */
    get channel() {

        return this.#channel;
    }

    /** @type {IOServer} */
    get server() {

        return this.#server;
    }

    /** @type {any} */
    get state() {

        return this.#state;
    }

    /** @type {WSController} */
    get controller() {

        return this.#controller;
    }

    /**
     * 
     * @param {string} _channel 
     * @param {IOSocket} _sender 
     * @param {Object} _payload
     * @param {Array<any>} _payload.args
     * @param {?Function} _payload.response
     * @param {IOServer} _payload.server
     * @param {any} _payload.state
     */
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

    /**
     * 
     * @param {WSController} _controller 
     */
    setController(_controller) {

        this.#controller = _controller;
    }

    abort() {

        this.#isAborted = true;
    }
}