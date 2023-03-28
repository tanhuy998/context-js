const GroupConstraint = require('./groupConstraint.js');


module.exports = class GlobalConstraintConfiguration {

    #globalConfig;

    #constraint
    #groupList = [];

    constructor(_globalConfig) {

        this.#globalConfig = _globalConfig;
        this.#constraint = new GroupConstraint();
    }

    group(_groupPath) {

        this.#groupList.push(_groupPath);

        return this;
    }

    before(...middlewares) {

        this.#constraint.before(...middlewares);

        return this;
    }

    after(...middlewares) {

        this.#constraint.after(...middlewares);

        return this;
    }

    apply() {

        for (const _groupPath of this.#groupList) {

            if (!this.#globalConfig[_groupPath]) {

                this.#globalConfig[_groupPath] = new GroupConstraint;
            }

            //console.log(this.#globalConfig[_groupPath])

            const midBefore = this.#constraint.middlewareBefore;
            this.#globalConfig[_groupPath].before(...midBefore) ;

            const midAfter = this.#constraint.middlewareAfter;
            this.#globalConfig[_groupPath].after(...midAfter);
        }
    }
}