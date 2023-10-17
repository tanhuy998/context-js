class ItemsManager {

    #list = new Map();

    constructor() {


    }

    get(_name) {

        if (!this.#list.has(_name)) {

            throw new Error(`There is no item called "${_name}"`);
        }

        this.#list.get(_name);
    }

    add(_name, _newItem) {

        if (this.#list.has(_name)) {

            throw new Error(`There is item called ${_name}, try another name`);
        }

        this.#list.set(_name, _newItem);
    }

    replace(_name, _newItem) {

        this.#list.set(_name, _newItem);
    }

    remove(_name) {

        this.#list.delete(_name);
    }
}

module.exports = ItemsManager;