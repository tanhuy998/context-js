const self = require("reflectype/src/utils/self.js");
const { CONSTRUCTOR, DISMISS_ERROR_PHASE } = require("../constants");
const ErrorHandlerConventionError = require("../errors/pipeline/errorHandlerConventionError.js");
const ErrorHandlerAcceptanceStrategy = require("./errorHandlerAcceptanceStrategy.js");
const matchType = require("reflectype/src/libs/matchType.js");
const ComponentCategory = require("../category/componentCategory.js");
const { ACCEPT_ORIGIN_FIELD, ACCEPT_FIELD } = require("./constant.js");
const ConventionError = require("../errors/conventionError.js");
const ContextExceptionErrorCategory = require("../errorCollector/contextExceptionErrorCategory.js");
const {EXCEPTION} = require('../errorCollector/constant.js');
const { decoratePseudoConstructor } = require("../../utils/metadata.js");
const Breakpoint = require("../pipeline/payload/breakpoint.js");

/**
 * @typedef {import('./errorHandler.js')} ErrorHandler
 * @typedef {import('../context/context.js')} Context
 */

const ErrorHandlerAcceptanceMatcherClass = module.exports = class ErrorHandlerAcceptanceMatcher extends ContextExceptionErrorCategory {

    static fields = [
        'accept', 'acceptOrigin'
    ];

    /**@type {ErrorHandler} */
    #breakPoint;

    #acceptList;

    #acceptOriginList;

    /**
     * @returns {boolean}
     */
    get isSelective() {

        const acceptList = this.#acceptList;
        const acceptOriginList = this.#acceptList;

        const firstCond = acceptList === undefined || acceptList === null;
        const secondCond = acceptOriginList === undefined || acceptOriginList === null;
        
        return !(firstCond && secondCond);
    }

    /**
     * 
     * @param {BreakPoint} _breakPoint 
     * @param {Context} context
     */
    [CONSTRUCTOR](_breakPoint, context) {

        this.#breakPoint = _breakPoint;

        this.setContext(context);

        this.#init();
    }

    #init() {

        if (!this.isSelective) {

            return;
        }

        this.#initCategories();
    }

    #initCategories() {

        const acceptList = this.#acceptList;
        const acceptOriginList = this.#acceptOriginList;

        if (Array.isArray(acceptOriginList)) {

            this.add(ACCEPT_ORIGIN_FIELD, new Set(acceptOriginList));
        }

        if (Array.isArray(acceptList)) {

            this.add(ACCEPT_FIELD, new Set(acceptList));
        }
    }

    /**
     * 
     * @returns {boolean}
     */
    #checkAcceptableError() {

        const isException = this.#isException();

        if (isException) {
            console.log(1)
            return false;
        }

        const matchOriginAcceptable = this.#isOriginAcceptableError();

        if (matchOriginAcceptable === true) {
            console.log(2)
            return true;
        }

        const matchAcceptable = this.#isAcceptableError();
        
        if (matchAcceptable === true) {
            console.log(3)
            return true;
        }


        if (matchAcceptable === false || matchOriginAcceptable === false) {
            console.log(4);
            return false;
        }

        if (matchAcceptable === undefined && matchOriginAcceptable === undefined) {
            console.log(5)
            return true;
        }
    }

    /**
     * 
     * @param {string} _field 
     * @returns {boolean}
     */
    #_checkAcceptableFrom(_field = ACCEPT_FIELD) {

        const errorFieldName = new ErrorHandlerAcceptanceStrategy(_field).errorFieldName;
        
        const actualError = this.#breakPoint[errorFieldName];

        return super._check(actualError, _field);
    }

    #isException() {

        if (this.#originErrorIsException() || this.#lastHandledErrorisException()) {

            return true;
        }

        return false;
    }

    #lastHandledErrorisException() {

        const breakPoint = this.#breakPoint;

        const lastErrorField = new ErrorHandlerAcceptanceStrategy(ACCEPT_FIELD).errorFieldName;

        const lastError = breakPoint[lastErrorField];

        return super._check(lastError, EXCEPTION);
    }

    #originErrorIsException() {

        const breakPoint = this.#breakPoint;

        const originErrorField = new ErrorHandlerAcceptanceStrategy(ACCEPT_ORIGIN_FIELD).errorFieldName;

        const originError = breakPoint[originErrorField];

        return super._check(originError, EXCEPTION);
    }

    /**
     * 
     * @returns {boolean}
     */
    #isAcceptableError() {
        
        return this.#_checkAcceptableFrom(ACCEPT_FIELD);
    }

    /**
     * 
     * @returns {boolean}
     */
    #isOriginAcceptableError() {
        
        return this.#_checkAcceptableFrom(ACCEPT_ORIGIN_FIELD);
    }

    setReference({accept, acceptOrigin} = {}) {

        this.#acceptList = Array.isArray(accept) ? accept : undefined;

        this.#acceptOriginList = Array.isArray(acceptOrigin) ? acceptOrigin : undefined;

        this.#initCategories();
    }

    /**
     * 
     * @returns {boolean}
     */
    match() {
        
        if (!this.isSelective) {
        
            return true;
        }
        
        const lookupResult = this.#checkAcceptableError();

        return lookupResult;
    }
}

decoratePseudoConstructor(ErrorHandlerAcceptanceMatcherClass, {
    defaultParamsType: [Breakpoint]
})