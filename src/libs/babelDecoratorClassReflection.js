class NotBabelDecoratorClassError extends Error {

    constructor(_targetFunciton) {

        super(_targetFunciton + ' is not Babel Decorator class');
    }
}


class ReflectionBabelDecoratorClass_Stage_0 {
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

        const test = /_classCallCheck/;

        const _function = this.#target.toString();
        
        const match = _function.match(test);
        
        if (match != null) {

            this.#reflectParams(_function);
        }
        else {

            throw new NotBabelDecoratorClassError(this.#target);
        }
    }

    #reflectParams(meta) {
            
        const paramReg = /var (\w+) \=( .+)*( (.+))\;/g;

        const matches = [...meta.matchAll(paramReg)];

        const name = 1, defaultValue = 4;

        this.#params = matches.map((rawParam) => {
        
            const isString = (rawParam[defaultValue]) ? (rawParam[defaultValue].match(/(\'|\"|\`)\w*\1/) != null) : false;

            const result = {
                origin: this.#target,
                name: rawParam[name] || undefined,
                defaultValue: rawParam[defaultValue] || undefined,
                isTypeOfString: isString,
            };

            return new Proxy(result, {
                get(target, prop) {

                    return target[prop];
                },
                set() {

                    return false;
                }
            });
        }, this)
    }
}


class ReflectionBabelDecoratorClass_Stage_3 {
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

        const test = /_classCallCheck/;

        const _function = this.#target.toString();
        
        const match = _function.match(test);
        
        if (match != null) {

            this.#reflectParams(_function);
        }
        else {

            throw new NotBabelDecoratorClassError(this.#target);
        }
    }

    #reflectParams(meta) {
            
        const paramReg = /var (\w+) \=( .+)*( (.+))\;/g;

        const matches = [...meta.matchAll(paramReg)];

        const name = 1, defaultValue = 4;

        this.#params = matches.map((rawParam) => {
        
            const isString = (rawParam[defaultValue]) ? (rawParam[defaultValue].match(/(\'|\"|\`)\w*\1/) != null) : false;

            const paramDefaultValue = (rawParam[defaultValue]) ? rawParam[defaultValue].replace(/^_/, '') : undefined;

            const result = {
                origin: this.#target,
                name: rawParam[name] || undefined,
                defaultValue: paramDefaultValue,
                isTypeOfString: isString,
            };

            return new Proxy(result, {
                get(target, prop) {

                    return target[prop];
                },
                set() {

                    return false;
                }
            });
        }, this)
    }
}

module.exports = {ReflectionBabelDecoratorClass_Stage_0, ReflectionBabelDecoratorClass_Stage_3};
// reflection parameter interface

// get origin() {

//     return this.#origin;
// }

// get name() {

//     return this.#name;
// }

// get defaultValue() {

//     return this.#defaultValue;
// }

// get isTypeOfString() {

//     return this.#isString;
// }