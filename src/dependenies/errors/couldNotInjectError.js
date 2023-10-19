module.exports = class CouldNotInjectError extends Error {

    constructor() {

        super('could not inject the specified object');
    }
}