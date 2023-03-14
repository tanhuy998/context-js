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


/**
 *  ReflectionFunction just reflect object that is function (typeof returns 'function')
 */
class ReflectionFunction {

    #target;
    #params = [];
    #isArrow;
    #isAsync;
    #name;
    #isAnnonymous;

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
    
        //const test = /(\/*(\s|\t)*\w*(\s|\t)*)(async){0,1}(\s|\t)*(function){0,1}(\s|\t)*(\w*)*(\s|\t)*\((\s|\t)*((\w*(\s|\t)*(\=(\s|\t)*(((\'|\"|\`){0,1})(\w*)\15))*)((\s|\t)*\,(\s|\t)*(\w*(\s|\t)*(\=(\s|\t)*(((\'|\"|\`){0,1})(\w*)\15))*))*)*(\s|\t)*\)/g;
        //const test = /(\/\/*(\s|\t)*)*((\s|\t)*\w+)*(\s|\t)*\((\s|\t)*((\w*(\s|\t)*(\=(\s|\t)*(((\'|\"|\`){0,1})(\w*)\13))*)((\s|\t)*\,(\s|\t)*(\w*(\s|\t)*(\=(\s|\t)*(((\'|\"|\`){0,1})(\w*)\24))*))*)*(\s|\t)*\)(\s|\t)*(\=\>)*/g;
        //const test = /(\/\/*\s*)*((\s)*\w+)*(\s)*\((\s)*((\w*(\s)*(\=(\s)*(((\'|\"|\`){0,1})(\w*)\13))*)((\s)*\,(\s)*(\w*(\s)*(\=(\s)*(((\'|\"|\`){0,1})(\w*)\24))*))*)*(\s)*\)(\s)*(\=\>)*/g
        const test = /(\/\/*\s*)*((\s)*(\w+))*(\s)*\(((\s|\w|\'|\"|\`|\=|\,)*)*\)(\s)*(\=\>)*/g;
        const _function = this.#target.toString();

        const isClass = (_function.match(/^class/) != null) ? true : false;

        const meta = _function
                    .matchAll(test);
        
        const matches = [...meta];

        if (matches.length == 0) {

            this.#name = this.#target.name;
            
            return;
        }
        else {

            this.#findBestMatch(matches, isClass);
        }
    }

    #findBestMatch(_list, _isClass = false) {

        const name = 4, params = 6, isCommented = 1, isArrow = 9;

        let meta;
        //console.log(_list)
        if (!_isClass) {

            meta = _list[0];
        }
        else {

            this.#name = this.#target.name;

            for (const match of _list) {
                
                if (match[isCommented]) continue;
                
                if (match[name].match(/constructor/)) {
                    
                    meta = match;

                    break;
                }
            }
        }

        if (meta) {
            // when there's no constructor in class definition
            
            this.#reflectParams(meta);
        }
        

        this.#isArrow = (meta[isArrow]) ? true : false;
       
        this.#isAnnonymous = (((meta[name] || '').match(/async|function/)) != null);

        if (!_isClass && !this.#isAnnonymous) {
            
            this.#name = meta[name];
        }

        switch(this.#target.constructor.name) {
            case 'Function':

                this.#isAsync = false;
                break;

            case 'AsyncFunction':

                this.#isAsync = true;
                break;

            default:
                break;
        }


    }

    #reflectParams(meta) {
            
        const paramIndex = 6;

        if (!meta[paramIndex]) return;

        const rawParams = meta[paramIndex].split(/(\s|\t)*\,(\s|\t)*/).filter((value) => {

            return (value != ' ' && value != undefined && value != '');
        })

        this.#params = rawParams.map((rawParam) => {
            
            return new ReflectionParameter(rawParam, this.#target);

        }, this)
    }
}

module.exports = ReflectionFunction;