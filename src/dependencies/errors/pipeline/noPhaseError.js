module.exports = class NoPhaseError extends Error {

    constructor() {

        super('the pipeline hasn\'t been registered any phases to handle a context request');
    }
}