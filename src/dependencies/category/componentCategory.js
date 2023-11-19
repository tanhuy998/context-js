const ContextLockable = require("../lockable/contextLockable");
const matchType = require("reflectype/src/libs/matchType.js");

module.exports = class ComponentCategory extends ContextLockable {

    lockActions = ['add'];

    /**@type {Map<string, Set>} */
    #categories = new Map();

    get categories() {

        return this.#categories;
    }

    constructor(_context) {

        super(_context);

        this.#init();
    }

    #init() {
    
    }

    /**
     * 
     * @param {string} _field 
     * @returns {boolean}
     */
    _check(value, _field = 'default') {

        const targetCategoriesSet = this.#categories.get(_field);
        
        if (!targetCategoriesSet) {
        
            return false;
        }

        if (targetCategoriesSet.has(value)) {
            /**
             *  when actualError matches an immediate value
             */
            return true;
        }

        return this.#lookupType(value, targetCategoriesSet);
    }

    
    /**
     * find best match error types, check on inheritance (classes and interfaces)
     * 
     * @param {any} _value 
     * @param {Iterable<any>} _acceptanceList 
     * @returns {boolean}
     */
    #lookupType(_value, list = []) {

        for (const Type of list) {

            const matchOptionalPattern = this.#checkOptionalPattern({
                expect: Type, 
                object: _value
            });

            if (matchOptionalPattern) {

                return true;
            }

            if (typeof Type !== 'function') {

                continue;
            }

            const match = matchType(Type, _value);

            if (match) {

                return true;
            }
        }

        return false;
    }

    #checkOptionalPattern({expect, object}) {

        // if (typeof expect === 'function') {

        //     return false;
        // }
        console.log(expect)
        return this.#likable({expect, object});
    }

    #likable({expect, object}) {

        if (typeof expect !== 'object' || typeof object !== 'object') {

            return false;
        }
        
        const expectPropNames = Object.getOwnPropertyNames(expect);
        const expectAcceptances = expectPropNames.map(_name => expect[_name]);

        const errorFilteredPropNames = Object.getOwnPropertyNames(object).filter(_name => expectPropNames.includes(_name));

        if (expectPropNames.length > errorFilteredPropNames.length) {

            return false;
        }
        
        for (const propName of errorFilteredPropNames) {

            const prop = object[propName]

            const matchType = this.#lookupType(prop, expectAcceptances);

            if (!matchType) {

                return false;
            }
        }

        return true;
    }

    add(_category, _type) {

        const categories = this.#categories;

        if (!categories.has(_category)) {

            categories.set(_category, new Set([_type]));

            return;
        }

        categories.get(_category).add(_type);
    }

    /**
     * 
     * @param {any} _value 
     * @param {string} _category 
     * 
     * @returns {boolean}
     */
    match(_value, _category) {

        return this._check(_value, _category);
    }
}