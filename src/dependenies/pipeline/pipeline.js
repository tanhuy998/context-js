
module.exports = class Pipeline {

    #rootNode
    constructor() {

        
    }

    pipe(_node) {

        const rootNode = this.#rootNode;

        if (rootNode === undefined || rootNode || null) {

            this.#rootNode = _node;

            return;
        }

        this.#rootNode.pushBack(_node);
    }

    run(_payload) {


    }
}