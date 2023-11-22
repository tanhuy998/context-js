const { property_metadata_t } = require("reflectype/src/reflection/metadata");
const metadata = require("../../../utils/metadata");
const ContextExceptionErrorCategory = require("../../errorCollector/contextExceptionErrorCategory");
const { getListOfHandleError } = require("../../../utils/decorator/handleError.util");
const isIterable = require("reflectype/src/utils/isIterable");
const { EXCEPTION } = require("../../errorCollector/constant");
const ContextHandler = require("../../handler/contextHandler");
const HandlerKind = require("../handlerKind");
const self = require("reflectype/src/utils/self");

/**
 * @typedef {import("../../handler/contextHandler")} ContextHandler
 * @typedef {import('reflectype/src/reflection/metadata').property_metadata_t} property_metadata_t
 */

module.exports = class ContextHandlerErrorMapper extends ContextExceptionErrorCategory {

    #contextHandlerClass

    /**@type {WeakMap<any, Set<Function>>} */
    #mappingTable = new WeakMap();

    #hasRemap = false;

    get hasRemap() {

        return this.#hasRemap;
    }

    /**
     * 
     * @param {ContextHandler} _ContextHadnlerCLass 
     */
    constructor(_HadnlerCLass) {

        super();

        this.#contextHandlerClass = _HadnlerCLass;

        this.#init();
    }

    #init() {
        
        if (HandlerKind.classify(this.#contextHandlerClass) !== HandlerKind.REGULAR) {
            
            return;
        }
        
        const prototype = this.#contextHandlerClass.prototype;
        
        /**
         * because of babel transpilation so cannot use for in here
         */
        for (const name of Object.getOwnPropertyNames(prototype)) {
            
            if (name === 'constructor') continue;

            try {
                /**
                 * babel will tranpile attribute field as private, so error caused when accessing non function properties
                 */
                const method = prototype[name]; // error throw here because of babel properties transpilation

                if (typeof method !== 'function') {

                    continue;
                }

                this.#mapError(method, name);
            }
            catch {

                continue;
            }
        }
    }

    /**
     * 
     * @param {Function} _func 
     * @param {string} name 
     */
    #mapError(_func, name) {

        /**@type {property_metadata_t} */
        const propMeta = metadata.getTypeMetadata(_func);
        
        if (!(propMeta instanceof property_metadata_t)) {

            return;
        }
        
        const handleErrorList = getListOfHandleError(propMeta);
        
        if (!isIterable(handleErrorList)) {

            return;
        }

        for (const Type of handleErrorList ?? []) {

            const isException = super.match(Type, EXCEPTION);

            if (isException) {

                continue;
            }

            this.#register(Type, _func);
        }
    }

    /**
     * 
     * @param {any} _errorType 
     * @param {Function} _func 
     */
    #register(_errorType, _func) {

        const mappingTable = this.#mappingTable;

        if (!mappingTable.has(_errorType)) {

            mappingTable.set(_errorType, new Set());
        }

        mappingTable.get(_errorType).add(_func);

        this.#hasRemap ||= true;
    }

    /**
     * 
     * @param {any} _errorType 
     * 
     * @returns {Array<string>}
     */
    getMethods(_error) {

        const errorPrimitivetype = typeof _error;

        let Type;

        switch(errorPrimitivetype) {
            case 'object':
                Type = _error.constructor;
                break;
            case 'function':
            case 'undefined':
            case 'null':
            default:
                Type = _error;
                break;
        }

        return this.#mappingTable.get(Type);
    }

    /**
     * 
     * @param {ContextHandler} _contextHandlerObject 
     * @returns 
     */
    redirectError(_contextHandlerObject) {
        
        // if (!(_contextHandlerObject instanceof ContextHandler)) {

        //     return;
        // }

        const _class = self(_contextHandlerObject);
        
        const kind = HandlerKind.classify(_class);
        
        if (kind !== HandlerKind.REGULAR) {

            return;
        }
        
        this.#wrappContextHanlderMethod(_contextHandlerObject);
    }

    /**
     * 
     * @param {ContextHandler} _contextHandlerObject 
     */
    #wrappContextHanlderMethod(_contextHandlerObject) {

        const handleMethod = _contextHandlerObject.handle;

        const errorMapper = this;

        _contextHandlerObject.handle = function handle() {

            try {
                
                return handleMethod.call(_contextHandlerObject);
            }
            catch (error) {
                console.log(2, error)
                const methods = errorMapper.getMethods(error);

                if (!isIterable(methods)) {

                    throw error;
                }

                for (const fn of methods) {

                    fn.call(_contextHandlerObject);
                }
            }
        }
    }
}