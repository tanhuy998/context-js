const Phase = require('./phase.js');
const HandlerKind = require('./handlerKind.js');
const ContextHandler = require('../handler/constextHandler.js');

module.exports = class PhaseBuilder {

    #handler;
    #kind;
    #pipeline;

    constructor(_pipeline) {

        this.#pipeline = _pipeline;
    }
    
    /**
     * 
     * @param {ContextHandler} _type 
     */
    setHandler(_unknown) {

        this.#kind = HandlerKind.classify(_unknown);

        this.#handler = _unknown;

        return this;
    }

    #_dispose() {

        this.#handler = undefined;
        this.#pipeline = undefined;
    }

    build() { 

        const phase =  new Phase(this.#handler, this.#kind);

        this.#pipeline.pipe(phase);

        this.#_dispose();
    }
}