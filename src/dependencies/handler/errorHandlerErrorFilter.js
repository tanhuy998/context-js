const { CONSTRUCTOR } = require("../constants.js");
const ErrorHandlerAcceptanceStrategy = require("./errorHandlerAcceptanceStrategy.js");
const { ACCEPT_ORIGIN_FIELD, ACCEPT_FIELD } = require("./constant.js");
const ContextExceptionErrorCategory = require("../errorCollector/contextExceptionErrorCategory.js");
const {EXCEPTION} = require('../errorCollector/constant.js');
const { decoratePseudoConstructor } = require("../../utils/metadata.js");
const Breakpoint = require("../pipeline/payload/breakpoint.js");
const isIterable = require("reflectype/src/utils/isIterable.js");
const { isValuable } = require("../../utils/type.js");

/**
 * @typedef {import('./errorHandler.js')} ErrorHandler
 * @typedef {import('../context/context.js')} Context
 */

const ErrorHandlerErrorFilterClass = module.exports = class ErrorHandlerErrorFilter extends ContextExceptionErrorCategory {

    static fields = [
        'accept', 'acceptOrigin'
    ];

    /**@type {ErrorHandler} */
    #breakPoint;

    #acceptList;


    #acceptOriginList;

    #exceptList;

    /**
     * @returns {boolean}
     */
    get isSelective() {

        const acceptList = this.#acceptList;
        const acceptOriginList = this.#acceptList;
        const exceptList = this.#exceptList;

        const firstCond = isValuable(exceptList);
        const secondCond = isValuable(acceptOriginList);
        const thirdCond = isValuable(acceptList);
        
        
        return firstCond || secondCond || thirdCond;
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
        const exceptions = this.#exceptList;

        this.#addToCategory(EXCEPTION, exceptions)
        this.#addToCategory(ACCEPT_ORIGIN_FIELD, acceptOriginList);
        this.#addToCategory(ACCEPT_FIELD, acceptList);
        // if (isIterable(acceptOriginList)) {
    }

    /**
     * 
     * @param {string} _category 
     * @param {Iterable} _typeList 
     */
    #addToCategory(_category, _typeList) {

        if (isIterable(_typeList)) {

            this.add(_category, ..._typeList);
        }
        else if (isValuable(_typeList)) {

            this.add(_category, _typeList);
        }
    }

    /**
     * 
     * @returns {boolean}
     */
    #checkAcceptableError() {

        const isException = this.#isException();

        if (isException) {
            
            return false;
        }

        const matchOriginAcceptable = this.#isOriginAcceptableError();

        if (matchOriginAcceptable === true) {
            
            return true;
        }

        const matchAcceptable = this.#isAcceptableError();
        
        if (matchAcceptable === true) {
            
            return true;
        }


        if (matchAcceptable === false || matchOriginAcceptable === false) {
            
            return false;
        }

        if (matchAcceptable === undefined && matchOriginAcceptable === undefined) {
            
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

        return this.#originErrorIsException() || this.#lastHandledErrorisException();
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

    setReference({accept, acceptOrigin, except} = {}) {
        
        this.#acceptList = accept

        this.#acceptOriginList = acceptOrigin

        this.#exceptList = except;
        
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

decoratePseudoConstructor(ErrorHandlerErrorFilterClass, {
    defaultParamsType: [Breakpoint]
})