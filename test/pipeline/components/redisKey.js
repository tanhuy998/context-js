const self = require("reflectype/src/utils/self");
const { CONSTRUCTOR } = require("../../../src/dependenies/constants");
const SessionCoordinator = require("../../../src/dependenies/coordinator/sessionCoordinator");
const Coordinator = require("../../../src/dependenies/coordinator/coodinator");


const redisClient = {
    cacheList: {
        'index': 'index page',
        'customers': ['alex', 'bob']
    },
    get(key) {
        
        return new Promise((resolve, resject) => {
    
            setTimeout(() => {
                
                const value = this.cacheList[key];
                resolve(value);
            }, 5000)
        })
    }
}

class Redis extends Coordinator {

    static cache = redisClient;
}


function RedisKey(_key) {

    const keyType = typeof _key;

    if (keyType !== 'string' && keyType !== 'symbol') {

        throw new TypeError('invalid key of RedisKey');
    }

    return class extends Redis {

        static key = _key;

        constructor() {

            super();

            this.field = self(this).cache;
            
            super._evaluate();

            
        }
    }
}

module.exports = RedisKey;