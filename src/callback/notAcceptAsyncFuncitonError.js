
module.exports = class NotAcceptAsyncFunctionError extends TypeError {

    constructor() {

        super('PreInvokeFunction does not accept async Function, use PreInvokeFunctionAsync instead');
    }
}