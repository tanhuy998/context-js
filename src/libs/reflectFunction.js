class ReflectionParameter {

    #origin;
    #name;
    #defaultValue;
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
    }
}

class ReflectionFunction {

    #target;
    #params = [];
    #isArrow
    #isAsync
    #name
    #isAnnonymous

    get target() {

        return this.#target;
    }

    get params() {

        return this.#params;
    }

    get isArrow() {

        return this.#isArrow;
    }

    get isAsync() {

        return this.#isAsync;
    }

    get name() {

        return this.#name;
    }

    get isAnnonymous() {

        return this.#isAnnonymous;
    }

    constructor(_targetFunction) {

        if (typeof _targetFunction != 'function') throw new Error('ReflectionFunction Error: invalid instance');

        this.#target = _targetFunction;

        this.#Init();
    }

    #Init() {

        this.#reflect();
    }

    #reflect() {

        //const detecFunction = /^(async){0,1}(\s|\t)*(function){0,1}(\s|\t)*(\w(\w)*)*(\s|\t)*\((\s|\t)*(\w*((\s|\t)*\,(\s|\t)*\w+)*)(\s|\t)*\)/;
    
        const test = /^(async){0,1}(\s|\t)*(function){0,1}(\s|\t)*(\w*)*(\s|\t)*\((\s|\t)*((\w*(\s|\t)*(\=(\s|\t)*(((\'|\"|\`){0,1})(\w*)\15))*)((\s|\t)*\,(\s|\t)*(\w*(\s|\t)*(\=(\s|\t)*(((\'|\"|\`){0,1})(\w*)\15))*))*)*(\s|\t)*\)/;
    //const type = 1, name = 3, params = 7;
        const type = 3, name = 5 , params = 8;

        const _function = this.#target;

        const meta = _function.toString()
                    .match(test);
        
        //if (meta == null) return undefined;

        this.#reflectParams(meta);

        this.#isArrow = (!meta[type]);
        this.#isAsync = (meta[1]) ? true : false;
        this.#name = meta[name];
        this.#isAnnonymous = (!this.#name || this.#name == '');
    }

    #reflectParams(meta) {
        
        const paramIndex = 8;

        if (!meta[paramIndex]) return;

        const rawParams = meta[paramIndex].split(/(\s|\t)*\,(\s|\t)*/).filter((value) => {

            return (value != ' ' && value != undefined && value != '');
        })

        this.#params = rawParams.map((rawParam) => {
            
            return new ReflectionParameter(rawParam, this.#target);

        }, this)
    }
}


module.exports = function reflectFunction(_function) {

    return new ReflectionFunction(_function);
}





