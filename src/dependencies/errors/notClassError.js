module.exports = class NotClassError extends TypeError {

    constructor() {

        super('the specified object can not be instantiate');
    }
}