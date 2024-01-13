/**
 * @typedef {import('../context/context.js')} Context
 * @typedef {import('../component/scope.js')} Scope
 */

module.exports = {
    ioc_seed_t
}

function ioc_seed_t() {
    /**
     * @type {Context}
     */
    this.context;

    /**
     * @type {Scope}
     */
    this.scope;
}