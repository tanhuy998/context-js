const { CONSTRUCTOR } = require("../constants.js");
const ErrorHandlerAcceptanceStrategy = require("./errorHandlerAcceptanceStrategy.js");
const { ACCEPT_ORIGIN_FIELD, ACCEPT_FIELD, ACCEPT_PUBLISHER } = require("./constant.js");
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

    /**
     *  This class is too hard to use code to describe what exactly it does and I'm working on it 
     *  to find a more understandable and reliable coding style.
     */

    static fields = [
        'acceptPublisher', 'accept', 'acceptOrigin'
    ];
    
    /**@type {ErrorHandler} */
    #breakPoint;

    #acceptPublisher;

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
        const fourthCond = isValuable(this.#acceptPublisher);
        
        return firstCond || secondCond || thirdCond || fourthCond;
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

        const acceptPublisherList = this.#acceptPublisher;
        const acceptList = this.#acceptList;
        const acceptOriginList = this.#acceptOriginList;
        const exceptions = this.#exceptList;

        this.#addToCategory(ACCEPT_PUBLISHER, acceptPublisherList);
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
            console.log(1)
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

        // // the following logic will be removed because of the invalid result
        // if (matchAcceptable === false || matchOriginAcceptable === false) {
        //     console.log(4, matchAcceptable, matchOriginAcceptable)
        //     return false;
        // }

        if (this.#acceptList === undefined && 
        this.#acceptOriginList === undefined) {
            
            return true;
        }
    }

    /**
     * 
     * @param {string} _field 
     * @returns {boolean}
     */
    #_checkAcceptableFrom(_field = ACCEPT_FIELD) {

        const errorFieldName = new ErrorHandlerAcceptanceStrategy(_field).lookupFieldName;
        const actualError = this.#breakPoint[errorFieldName];
        
        return super._check(actualError, _field);
    }

    #isException() {

        //return this.#originErrorIsException() || this.#lastHandledErrorisException();
        return this.#checkExceptionOn(ACCEPT_ORIGIN_FIELD) ||
                this.#checkExceptionOn(ACCEPT_FIELD);
    }

    #checkExceptionOn(_field) {

        const errorFieldName = new ErrorHandlerAcceptanceStrategy(_field).lookupFieldName;
        const actualError = this.#breakPoint[errorFieldName];
        
        return super._check(actualError, EXCEPTION);
    }

    // #lastHandledErrorisException() {

    //     const breakPoint = this.#breakPoint;
    //     const lastErrorField = new ErrorHandlerAcceptanceStrategy(ACCEPT_FIELD).lookupFieldName;
    //     const lastError = breakPoint[lastErrorField];

    //     return super._check(lastError, EXCEPTION);
    // }

    // #originErrorIsException() {

    //     const breakPoint = this.#breakPoint;
    //     const originErrorField = new ErrorHandlerAcceptanceStrategy(ACCEPT_ORIGIN_FIELD).lookupFieldName;
    //     const originError = breakPoint[originErrorField];

    //     return super._check(originError, EXCEPTION);
    // }

    #matchPublisher() {

        return this.#matchOn(ACCEPT_PUBLISHER);
    }

    #matchOn(_field) {

        const hasField = this.categories.get(_field)?.size > 0;

        return (!hasField || this.#_checkAcceptableFrom(ACCEPT_FIELD));
    }

    #check(_field) {

        return this.#matchPublisher() &&
                this.#matchOn(_field);
    }

    /**
     * 
     * @returns {boolean}
     */
    #isAcceptableError() {
        
        // return this.#_checkAcceptableFrom(ACCEPT_FIELD) || 
        //         this.#acceptList === undefined;

        return this.#check(ACCEPT_FIELD);
    }

    /**
     * 
     * @returns {boolean}
     */
    #isOriginAcceptableError() {
        
        // return this.#_checkAcceptableFrom(ACCEPT_ORIGIN_FIELD) ||
        //         this.#acceptOriginList === undefined;

        return this.#check(ACCEPT_ORIGIN_FIELD);
    }

    setReference({accept, acceptOrigin, except, acceptPublisher} = {}) {

        this.#acceptList = accept
        this.#acceptOriginList = acceptOrigin
        this.#exceptList = except;
        this.#acceptPublisher = acceptPublisher;
        
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
        console.log(['matcth'], lookupResult)
        return lookupResult;
    }
}

decoratePseudoConstructor(ErrorHandlerErrorFilterClass, {
    defaultParamsType: [Breakpoint]
})