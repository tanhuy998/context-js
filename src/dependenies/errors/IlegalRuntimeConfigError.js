module.exports = class IlegalRuntimeConfigError extends Error {

    constructor() {

        super('cannot do config during the runtime');
    }
}