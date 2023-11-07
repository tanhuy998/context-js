class ItemsManager {

    #pool = new Map();

    #keysTable = new Map();

    #resolveKey(_key) {

        return this.#keysTable.has(_key) ? this.#keysTable.get(_key) : _key;
    }

    mapKey(_newKey, _targetKey) {

        const type = typeof _newKey;

        if (type !== 'string') {

            throw new TypeError('the _newKey must be type of string');
        }

        this.#keysTable.set(_newKey, _targetKey);
    }

    has(_key) {

        return this.#pool.has(_key);
    }

    get(_key) {

        _key = this.#resolveKey(_key);

        if (!this.#pool.has(_key)) {

            throw new Error(`There is no item called "${_key.description ?? _key}"`);
        }

        return this.#pool.get(_key);
    }

    save(_key, _newItem) {

        _key = this.#resolveKey(_key);

        if (this.#pool.has(_key)) {

            throw new Error(`There has item called "${_key.description ?? _key}", try another name`);
        }

        this.#pool.set(_key, _newItem);
    }

    replace(_name, _newItem) {

        _key = this.#resolveKey(_key);

        this.#pool.set(_name, _newItem);
    }

    remove(_key) {

        _key = this.#resolveKey(_key);

        this.#pool.delete(_key);
    }
}

module.exports = ItemsManager;