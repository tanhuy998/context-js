module.exports = class GroupConstraint {

    isInitialized = false;
    #groupInstance;

    #config = {
        path: '',
        middlewareBefore: [],
        middlewareAfter: [],
    }
    

    before(...middleware) {

        // const temp = this.#config.middlewareBefore;

        // const newArr = [...temp, ...middleware]

        this.#config.middlewareBefore.push(...middleware);

        return this;
    }

    after(...middleware) {

        //const temp = this.#config.middlewareAfter;
        
        this.#config.middlewareAfter.push(...middleware)

        return this;
    }

    group(routerInstance) {

        this.#groupInstance = routerInstance;

        return this;
    }

    setPath(value) {

        this.#config.path = value;

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

    get path() {

        return this.#config.path;
    }

    constructor() {

        return this;
    }

    #Initialize() {


    }
}