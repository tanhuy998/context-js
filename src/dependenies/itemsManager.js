class ItemsManager {

    #list = new Map();

    constructor() {


    }

    get(_key) {
        
        if (!this.#list.has(_key)) {

            throw new Error(`There is no item called "${_key.description ?? _key}"`);
        }

        return this.#list.get(_key);
    }

    save(_key, _newItem) {

        if (this.#list.has(_key)) {

            throw new Error(`There has item called ${_key}, try another name`);
        }

        this.#list.set(_key, _newItem);
    }

    replace(_name, _newItem) {

        this.#list.set(_name, _newItem);
    }

    remove(_key) {

        this.#list.delete(_key);
    }
}

module.exports = ItemsManager;