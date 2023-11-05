module.exports = class IocContainerSetDefaultInstanceError extends Error {

    constructor() {

        super('can not set default to Transient Component');
    }
}