/**
 * @typedef {import('./coodinator.js')} Coordinator
 */

const { CONSTRUCTOR } = require('../constants.js');

/**
 * 
 * @param {Coordinator} _Coordinator 
 * @param {string | Symbol} _subField 
 * @returns 
 */
function sub_coordinator(_Coordinator, _subField) {

    return class extends _Coordinator {

        [CONSTRUCTOR]() {

            this.#init();
        }

        #init() {

            this._evaluate(_subField);
        }
    }
}

module.exports = sub_coordinator;