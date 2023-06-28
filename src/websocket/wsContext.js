module.exports = class WSContext {

    #eventArgs;
    #handshake;
    
    get handshake() {

        return this.#handshake;
    }

    get eventArguments() {

        return this.#eventArgs;
    }

    constructor({handshake, args}) { 

        this.#eventArgs = args;
        this.#handshake = handshake;
    }


}