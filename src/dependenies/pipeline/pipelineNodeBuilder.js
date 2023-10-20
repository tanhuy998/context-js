const PipelineNode = require('./pipelineNode.js');
const ContextHandler = require('../handler/constextHandler.js');
const Context = require('../context/context.js');

module.exports = class PipelineNodeBuilder {

    #type;

    constructor() {


    }
    
    /**
     * 
     * @param {ContextHandler} _type 
     */
    setType(_type) {

        if (!(_type.prototype instanceof ContextHandler)) {

            throw new TypeError('handlerClass must be type of ContextHandler');
        }

        this.#type = _type;

        return this;
    }

    build() { 

        const handler = new this.#type();

        return new PipelineNode(handler, this.#type);
    }
}