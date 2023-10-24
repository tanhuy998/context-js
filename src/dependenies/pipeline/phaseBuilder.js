const Phase = require('./phase.js');
const HandlerKind = require('./handlerKind.js');
const ContextHandler = require('../handler/constextHandler.js');

const SubPipeline = require('./subpipeline.js');
const isPipeline = require('./isPipeline.js');


/**
 *  @typedef {import('./pipeline.js')} Pipeline
 */
module.exports = class PhaseBuilder {

    #phaseObj

    #handler;

    #pipeline;

    constructor(_pipeline) {

        this.#pipeline = _pipeline;
    }
    
    /**
     * 
     * @param {ContextHandler.constructor | Object.constructor | Function} _type 
     */
    setHandler(_unknown) {

        this.#checkIfDisposed();

        const hadlerKind = HandlerKind.classify(_unknown);

        this.#handler = _unknown;

        this.#phaseObj = new Phase(_unknown, hadlerKind);

        return this;
    }

    /**
     * 
     * @param {Pipeline} _pipeline 
     */
    use(_pipeline) {

        this.#checkIfDisposed();

        if (!isPipeline(_pipeline)) {

            throw new Error('[PhaseBuilder].use() method need an instance of [Pipeline]');
        }

        this.#handler = _pipeline;

        this.#phaseObj = new SubPipeline(undefined, _pipeline);
    }

    #_dispose() {

        this.#phaseObj = undefined;
        this.#handler = undefined;
        this.#pipeline = undefined;
    }

    #checkIfDisposed() {

        const pipeline = this.#pipeline;

        if (!isPipeline(pipeline)) {

            throw new Error('the phase builder is disposed, try another one');
        }
    }

    #isRegistered() {

        const phaseInstance = this.#phaseObj;

        if (!(phaseInstance instanceof Phase)) {

            throw new Error('');
        }

        return true;
    }

    build() { 

        if (typeof this.#phaseObj !== 'object') {

            throw new Error(`could not register [${this.#handler?.name ?? this.#handler}] to pipeline`);
        }

        const phase = this.#phaseObj;

        this.#pipeline.pipe(phase);

        this.#_dispose();
    }
}