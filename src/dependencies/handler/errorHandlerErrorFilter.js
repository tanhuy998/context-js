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

const proto = module.exports = class ErrorHandlerErrorFilter extends ContextExceptionErrorCategory {

    /**
     *  This class is too hard to use code on describing what exactly it does and I'm working on it 
     *  to find a more understandable and reliable coding style.
     */

    static fields = [
        'acceptPublisher', 'accept', 'acceptOrigin'
    ];
    
    /**@type {Breakpoint} */
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

        if (this.#isException()) {

            return false;
        }
        
        if (this.#isSelectiveOn(ACCEPT_PUBLISHER)) {
            
            if (!this.#matchPublisher()) {

                return false;
            }
        }
        
        if (this.#isSelectiveOn(ACCEPT_ORIGIN_FIELD)) {
            
            if (!this.#matchOn(ACCEPT_ORIGIN_FIELD)) {

                return false;
            }
        }
        
        if (this.#isSelectiveOn(ACCEPT_FIELD)) {
            
            if (!this.#matchOn(ACCEPT_FIELD)) {

                return false;
            }
        }

        return true;
    }

    /**
     * 
     * @param {string} _field 
     * @returns {boolean}
     */
    #_checkAcceptableOn(_field = ACCEPT_FIELD) {

        const lookupFieldName = new ErrorHandlerAcceptanceStrategy(_field).lookupFieldName;
        const value = this.#breakPoint[lookupFieldName];
        console.log(['check field'], _field, lookupFieldName, value, this.#breakPoint.rollbackPoint)
        return super._check(value, _field);
    }

    #isException() {

        return this.#checkExceptionOn(ACCEPT_ORIGIN_FIELD) ||
                this.#checkExceptionOn(ACCEPT_FIELD);
    }

    #checkExceptionOn(_field) {

        const errorFieldName = new ErrorHandlerAcceptanceStrategy(_field).lookupFieldName;
        const actualError = this.#breakPoint[errorFieldName];
        
        return super._check(actualError, EXCEPTION);
    }

    #matchPublisher() {

        return this.#matchOn(ACCEPT_PUBLISHER);
    }

    #isSelectiveOn(_field) {

        return this.categories.get(_field)?.size > 0;
    }

    #matchOn(_field) {
        
        const hasField = this.categories.get(_field)?.size > 0;
        const thisFieldIsNotSelective = !hasField;

        if (thisFieldIsNotSelective) {

            return true;
        }

        return this.#_checkAcceptableOn(_field);
    }

    /**
     * 
     * @returns {boolean}
     */
    #isAcceptableError() {

        return this.#matchOn(ACCEPT_FIELD);
    }

    /**
     * 
     * @returns {boolean}
     */
    #isOriginAcceptableError() {

        return this.#matchOn(ACCEPT_ORIGIN_FIELD);
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

decoratePseudoConstructor(proto, {
    defaultParamsType: [Breakpoint]
})