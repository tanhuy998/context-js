
module.exports = class NamespaceManager {

    #namespaces = new Map;

    constructor() {


    }

    addNamespace(_nsp) {

        if (this.#namespaces.has(_nsp)) {

            return;
        }

        this.#namespaces.set(_nsp, new Set());
    }

    addGroup(_group, _nsp = '/') {

        this.addNamspace(_nsp);

        if (this.#namespaces.get(_nsp).has(_group)) {

            return new Error(`cannot duplicate group '${_group}' of '${_nsp}' namespace`);
        } 

        this.#namespaces.get(_nsp).add(_group);
    }
}