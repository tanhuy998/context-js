const { CONSTRUCTOR } = require("../../dependenies/constants");
const SessionCoordinator = require("../../dependenies/coordinator/sessionCoordinator");
const subCoordination = require("../../dependenies/proxyTraps/subCoordination");

class Session extends SessionCoordinator {


    #storage;

    #value;

    get value() {

        return this.#value;
    }

    constructor() {


    }

    _evaluate(_key) {

        if (_key === undefined || _key === null) {

            this.#value = this.context.session;
        }
        else {

            this.#value = this.context.session.get(_key);
        }
    }
}

module.exports = new Proxy(Session, subCoordination);