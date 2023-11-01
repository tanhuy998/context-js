const { CONSTRUCTOR } = require("../../../../src/dependencies/constants");
const SessionCoordinator = require("../../../../src/dependencies/coordinator/sessionCoordinator");

module.exports = class DeliveryRequest extends SessionCoordinator {


    [CONSTRUCTOR]() {        

        this._evaluate();
    }

    // #init() {

    //     this._evaluate();
    // }
}