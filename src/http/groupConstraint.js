module.exports = class GroupConstraint {

    isInitialized = false;
    #groupInstance;

    #config = {
        middlewareBefore: [],
        middlewareAfter: [],
    }
    

    before(...middleware) {

        const temp = this.#config.middlewareBefore;

        this.#config.middlewareBefore = [...temp, ...middleware];

        return this;
    }

    after(...middleware) {

        const temp = this.#config.middlewareAfter;

        this.#config.middlewareAfter = [...temp, ...middleware];

        return this;
    }

    group(routerInstance) {

        this.#groupInstance = routerInstance;

        return this;
    }

    /**
     * 
     * @param {GroupConstraint} another 
     * @returns 
     */
    mergeConfigWith(another) {

        const currentBefore = this.#config.middlewareBefore;

        this.#config.middlewareBefore = [...another.middlewareBefore, ...currentBefore];


        
        const currentAfter = this.#config.middlewareAfter;

        this.#config.middlewareAfter = [...currentAfter, ...another.middlewareAfter];
        

        return this;
    }

    get middlewareBefore() {

        return this.#config.middlewareBefore;
    }

    get middlewareAfter() {

        return this.#config.middlewareAfter;
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