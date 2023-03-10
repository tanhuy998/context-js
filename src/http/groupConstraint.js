module.exports = class GroupConstraint {

    #isInitialized = false;
    #groupInstance;
    #middlewareBefore = [];
    #middlewareAfter = []; 

    before(...middleware) {

        const temp = this.#middlewareBefore;

        this.#middlewareBefore = [...middleware, ...temp];

        return this;
    }

    after(...middleware) {

        const temp = this.#middlewareAfter;

        this.#middlewareAfter = [...temp, ...middleware];

        return this;
    }

    group(routerInstance) {

        this.#groupInstance = routerInstance;

        return this;
    }

    get middlewareBefore() {

        return this.#middlewareBefore;
    }

    get middlewareAfter() {

        return this.#middlewareAfter;
    }

    get groupInstance() {

        return this.#groupInstance;
    }    

    constructor() {

        return this;
    }

    #Initialize() {


    }
}