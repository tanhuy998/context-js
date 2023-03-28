const { get } = require("http");
const { type } = require("os");

class EndpointExistError extends Error {

    constructor(endpoint) {

        super(`Routing Error: Declaring Endpoint '${endpoint}', could not duplicate Endpoints`);
    }
}

module.exports = class GroupManager {

    #list = {};
    #endpoints = new Set();

    constructor() {

        
    }

    get list() {

        return this.#list;
    }

    save(_context, _groupPath, _endpoint = undefined) {

        if (!this.#list[_context]) {

            this.#list[_context] = new Set();
        }

        this.#list[_context].add(_groupPath);        

        if (_endpoint) {

            const {method, path} = _endpoint;

            const endpointToSave = this.#EndpointStringify(method, _groupPath + path);

            const report = this.analyze(_groupPath, _endpoint);

            this.#endpoints.add(endpointToSave)

            return report;
        }
    }

    #EndpointStringify(method, path) {

        return `${method.toUpperCase()} ${path}`;
    }

    has(_context, _groupPath) {

        if (!this.#list[_context]) return false;

        const temp = this.#list[_context].filter(element => {
            
            return (element == _groupPath); 
        });

        return (temp.length > 0);
    }

    //remove(_context, _path)

    getByContext(_context) {

        return this.#list[_context];
    }

    statistic() {

        return this.#endpoints;
    }

    analyze(_groupPath, {method, path, throwError}) {

        const report = {
            groups: [],
            endpoints: '',
            hasEndpoint: false,
        };

        if (method && path) {

            const endpointToSave = this.#EndpointStringify(method, _groupPath + path);

            
            if (this.#endpoints.has(endpointToSave)) {

                if (throwError) {

                    throw new EndpointExistError(endpointToSave);
                }

                report.hasEndpoint = true;
            }
        }
        
        return report;
    }
}

