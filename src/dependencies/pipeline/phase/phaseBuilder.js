const Phase = require('./phase.js');
const HandlerKind = require('../handlerKind.js');
const ContextHandler = require('../../handler/contextHandler.js');

const PipablePhase = require('./PipablePhase.js');
const isPipeline = require('../isPipeline.js');
const ErrorCollector = require('../../errorCollector/errorCollector.js');
const PhaseErrorCollector = require('../errorCollector/phaseErrorCollector.js');
const ContextHandlerErrorMapper = require('../mapping/contextHandlerErrorMapper.js');


/**
 *  @typedef {import('../pipeline.js')} Pipeline
 *  @typedef {import('../../handler/errorHandler.js')} ErrorHandler
 */
module.exports = class PhaseBuilder {

    /**@type {Phase} */
    #phaseObj


    #handler;

    /**@type {Pipeline} */
    #pipeline;

    /**@returns {Pipeline} */
    get pipeline() {

        return this.#pipeline;
    }

    /**@returns {typeof ContextHandler | Function} */
    get handler() {

        return this.#handler;
    }

    /**@returns {Phase<ContextHandler | ErrorHandler | Function>} */
    get phaseObj() {

        return this.#phaseObj;
    }

    /**
     * 
     * @param {Pipeline} _pipeline 
     */
    constructor(_pipeline) {

        this.#pipeline = _pipeline;
    }
    
    /**
     * Set the handler class for the pipeline 
     * 
     * @param {typeof ContextHandler | Function} _unknown 
     */
    setHandler(_unknown) {

        this.#checkIfDisposed();

        //const hadlerKind = HandlerKind.classify(_unknown);

        if (typeof _unknown !== 'function') {

            throw new TypeError('cannot set non function as a pipeline phase handler');
        }
        
        const errorCollector = this.#prepareErrorCollectorOf(_unknown);
        
        this.#handler = _unknown;
        
        this.#phaseObj = new Phase(_unknown, errorCollector);
        
        return this;
    }

    #prepareErrorCollectorOf(_ContextHandlerClass) {

        const errorCollector = new PhaseErrorCollector();

        const contextHandlerKind = HandlerKind.classify(_ContextHandlerClass);
        
        if (contextHandlerKind === HandlerKind.REGULAR) {
            
            const errorRemapper = new ContextHandlerErrorMapper(_ContextHandlerClass)

            if (errorRemapper.hasRemap) {
                
                errorCollector.setErrorRemapper(errorRemapper);
            }
        }

        return errorCollector;
    }

    /**
     * set a Pipeline as a phase
     * 
     * @param {Pipeline} _pipeline 
     */
    use(_pipeline) {

        this.#checkIfDisposed();

        if (!isPipeline(_pipeline)) {

            throw new Error('[PhaseBuilder].use() method need an instance of [Pipeline]');
        }

        this.#handler = _pipeline;

        const errorCollector = new PhaseErrorCollector();

        this.#phaseObj = new PipablePhase(_pipeline, errorCollector);

        return this;
    }

    _dispose() {

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


    /**
     * 
     */
    build() { 

        if (typeof this.#phaseObj !== 'object') {

            throw new Error(`could not register [${this.#handler?.name ?? this.#handler}] to pipeline`);
        }

        const phase = this.#phaseObj;

        this.#pipeline.pipe(phase);

        this._dispose();
    }
}