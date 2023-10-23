const { CONSTRUCTOR } = require("../../../src/dependenies/constants");
const SessionCoordinator = require("../../../src/dependenies/coordinator/sessionCoordinator");

module.exports = class DeliveryRequest extends SessionCoordinator {


    [CONSTRUCTOR]() {        

        this._evaluate();
    }

    // #init() {

    //     this._evaluate();
    // }
}