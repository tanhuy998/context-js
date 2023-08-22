module.exports = class AbortRouterException extends Error {

    constructor(msg = '') {

        super(msg);
    }
}