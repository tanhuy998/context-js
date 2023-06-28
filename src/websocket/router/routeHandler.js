/**
 *  
 * 
 */
module.exports = class RouteHandler {

    #next;

    #callback;

    //#error;


    get next() {

        return this.#next;
    }

    get callback() {

        return this.#callback;
    }

    setNext(_node) {

        if (_node instanceof RouteHandler) {

            if (_node.next) {

                _node.pushBack(this.next);
            }
            
            this.#next = _node;

            return;
        }

        throw new TypeError('_node is not type of RouteHandler');
    }

    constructor(_callback) {

        if (typeof _callback !== 'function') {

            throw new TypeError('_callback is not a function');
        }

        this.#callback = _callback;
    }

    pushBack(_handler) {

        const nextNode = this.#next;

        if (nextNode) {

            nextNode.pushBack(_handler);
        }
        else {

            this.setNext(_handler);
        }
    }

    traverse(_destination = undefined) {


    }

    //handle(_event, _socket, _args) {
    handle(_wsEvent) {
        
        const nextHandler = this.next;

        const nextFunction = function(error) {

            if (error) {

                // this.#error = error

                // return;

                throw error;
            }

            if (!nextHandler) {

                return;
            }

            nextHandler.handle(_wsEvent);
        }

        const {response} = _wsEvent;

        this.#callback(_wsEvent, response, nextFunction.bind(this));
    }

    // #refresh() {

    //     this.#error = undefined;
    // }
}