const {Type, reflectParameterType} = require('./type.js');

class ReflectionParameter {

    #origin;
    #name;
    #defaultValue;
    #defaultValueType;
    #isString;

    #raw;

    get origin() {

        return this.#origin;
    }

    get name() {

        return this.#name;
    }

    get defaultValue() {

        return this.#defaultValue;
    }

    get defaultValueType() {

        return this.#defaultValueType;
    }

    get isTypeOfString() {

        return this.#isString;
    }

    constructor(_rawParam, _origin) {

        this.#origin = _origin;
        this.#raw = _rawParam;

        this.#Init();
    }

    #Init() {

        this.#reflect();
    }

    #reflect() {

        const tokens = this.#raw.split(/(\s|\t)*\=(\s|\t)*/);
        
        if (tokens == null) throw new Error('ReflectionParameter Error: invalid value');

        const last = tokens.length - 1;

        this.#name = tokens[0];

        if (tokens.length > 1) {

            this.#isString = (tokens[last].match(/(\'|\"|\`)\w*\1/) != null);

            this.#defaultValue = (this.#isString) ? tokens[last].replace(/(\'|\"|\`)/g, '') : tokens[last];
        }
        else {
            
            this.#isString = false;
            this.#defaultValue = undefined;
        }

        const defaultValue = this.#defaultValue;

        const reflectionDefaultValue = reflectParameterType(defaultValue);

        this.#defaultValueType = reflectionDefaultValue.type;
    }
}

module.exports = ReflectionParameter;