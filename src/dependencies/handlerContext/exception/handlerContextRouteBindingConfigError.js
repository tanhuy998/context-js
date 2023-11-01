class HandlerContextRouteBindingConfigError extends Error {

    constructor() {

        super('Could not bind route')
    }
}

module.exports = HandlerContextRouteBindingConfigError;