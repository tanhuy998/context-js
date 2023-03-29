const ControllerState = require('./controller/controllerState.js');

module.exports = class HttpContext {

    #request;
    #response;
    #currntRoute;
    #parentRoute;
    #next;

    #contorllerState;

    get controllerState() {

        return this.#contorllerState;
    }

    get request() {

        return this.#request;
    }

    get response() {

        return this.#response;
    }

    get nextMiddleware() {

        return this.#next;
    }

    get currentRoute() {

        return this.#currntRoute;
    }

    get parentRoute() {

        return this.#parentRoute;
    }

    get config() {

        return new Proxy(this.config, {
            get: function(target, prop) {

                return target[prop];
            },
            set: () => {
                return false;
            }
        })
    }

    constructor(req, res, next) {

        this.#request = req;
        this.#response = res;
        this.#next = next;
        //this.#config = config;

        this.#Init();
    }

    #Init() {

        this.#currntRoute = this.#request.path;
        this.#parentRoute = this.#request.baseUrl;
    }

    // setConfig(_config) {

    //     this.#config = _config;
    // }
}