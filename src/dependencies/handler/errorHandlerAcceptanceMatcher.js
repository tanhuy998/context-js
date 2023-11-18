const self = require("reflectype/src/utils/self.js");
const { CONSTRUCTOR, DISMISS_ERROR_PHASE } = require("../constants");
const ErrorHandlerConventionError = require("../errors/pipeline/errorHandlerConventionError.js");
const ErrorHandlerAcceptanceStrategy = require("./errorHandlerAcceptanceStrategy.js");
const matchType = require("reflectype/src/libs/matchType.js");
const ComponentCategory = require("../category/componentCategory.js");
const { ACCEPT_ORIGIN_FIELD, ACCEPT_FIELD } = require("./constant.js");
const ConventionError = require("../errors/conventionError.js");
const ContextExceptionErrorCategory = require("../errorCollector/contextExceptionErrorCategory.js");
const {EXCEPTION} = require('../errorCollector/constant.js')

/**
 * @typedef {import('./errorHandler.js')} ErrorHandler
 * @typedef {import('../context/context.js')} Context
 */

module.exports = class ErrorHandlerAcceptanceMatcher extends ContextExceptionErrorCategory {

    static fields = [
        'accept', 'acceptOrigin'
    ];

    /**@type {ErrorHandler} */
    #handlerObject;

    /**
     * @returns {boolean}
     */
    get isSelective() {

        const acceptList = this.#handlerObject?.accept;
        const acceptOriginList = this.#handlerObject?.acceptOrigin;

        const firstCond = acceptList === undefined || acceptList === null;
        const secondCond = acceptOriginList === undefined || acceptOriginList === null;
        
        return !(firstCond && secondCond);
    }

    /**
     * 
     * @param {ErrorHandler} _errorHanlderObj 
     * @param {Context} context
     */
    [CONSTRUCTOR](_errorHanlderObj, context) {

        this.#handlerObject = _errorHanlderObj;

        this.setContext(context);

        this.#init();
    }

    #init() {

        if (!this.isSelective) {

            return;
        }

        const errorHanlderObj = this.#handlerObject;

        const acceptList = errorHanlderObj?.accept ?? [];
        const acceptOriginList = errorHanlderObj?.acceptOrigin ?? [];

        this.add(ACCEPT_ORIGIN_FIELD, new Set(acceptOriginList));
        this.add(ACCEPT_FIELD, new Set(acceptList));
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
        
        const actualError = this.#handlerObject[errorFieldName];

        console.log([_field], actualError)
        console.log(this.categories.get(_field))
        return super._check(actualError, _field);
    }

    #isException() {

        const handlerObject = this.#handlerObject;

        const originErrorField = new ErrorHandlerAcceptanceStrategy(ACCEPT_ORIGIN_FIELD).errorFieldName;

        const originError = handlerObject[originErrorField];

        const  originErrorMatchExceptionError = super._check(originError, EXCEPTION);

        if (originErrorMatchExceptionError) {

            return true;
        }

        const lastErrorField = new ErrorHandlerAcceptanceStrategy(ACCEPT_FIELD).errorFieldName;

        const lastError = handlerObject[lastErrorField];

        const lastErrorMatchExceptionError = super._check(lastError, EXCEPTION);

        if (lastErrorMatchExceptionError) {

            return true;
        }

        return false;
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

    /**
     * 
     * @returns {boolean}
     */
    match() {

        if (!this.isSelective) {
            
            return true;
        }

        const lookupResult = this.#checkAcceptableError();

        console.log('check accept', lookupResult)

        return lookupResult;
    }
}