module.exports = class GroupManager {

    #list = {};

    constructor() {

        
    }

    save(_context, _groupPath) {

        if (!this.#list[_context]) {

            this.#list[_context] = [];
        }

        this.#list[_context].push(_groupPath);
    }

    has(_context, _groupPath) {

        if (!this.#list[_context]) return false;

        const temp = this.#list[_context].filter(element => {
            
            return (element == _groupPath); 
        });

        return (temp.length > 0);
    }

    getByContext(_context) {

        return this.#list[_context];
    }
}