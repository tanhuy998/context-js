class T_WeakTypeNode {

    #next;

    #data;

    //#error;


    get next() {

        return this.#next;
    }

    get data() {

        return this.#data;
    }

    setNext(_node) {

        if (_node instanceof T_WeakTypeNode) {

            if (_node.next) {

                _node.pushBack(this.next);
            }
            
            this.#next = _node;

            return;
        }

        throw new TypeError('_node is not type of RouteHandler');
    }

    //constructor(_callback) {
    constructor(_data) {

        // if (typeof _callback !== 'function') {

        //     throw new TypeError('_callback is not a function');
        // }

        if (!_data) {

            throw new TypeError('_data cannot be null or undefined');
        }

        this.#data = _data;
    }

    pushBack(_node) {

        const nextNode = this.#next;

        if (nextNode) {

            nextNode.pushBack(_node);
        }
        else {

            this.setNext(_node);
        }
    }

    traverse(_destination = undefined) {


    }

    //handle(_event, _socket, _args) {
    // handle(_wsEvent, _taskCount = 0) {

    //     const nextHandler = this.next;

    //     const {response} = _wsEvent;

    //     try {

    //         this.#callback(_wsEvent, response, nextFunction.bind(this));
    //     }
    //     catch (error) {

    //         const breakpoint = new BreakPoint();
    //         const runtimeError = new RouteError(error, {breakpoint: breakpoint});

    //         throw runtimeError;
    //     }


    //     function nextFunction(error) {

    //         if (error) {

    //             throw error;
    //         }

    //         if (!nextHandler) {

    //             return;
    //         }

    //         if (++_taskCount === MAX_SYNC_TASK) {

    //             setImmediate(nextHandler.handle.bind(nextHandler), _wsEvent);
    //         }
    //         else {

    //             nextHandler.handle(_wsEvent, _taskCount);
    //         }
    //     }
    // }
}

class T_StrictTypeNode extends T_WeakTypeNode {

    #type;

    get dataType() {

        return this.#type;
    }

    constructor(_data, _type) {

        super(_data);

        this.#type = Object.getPrototypeOf(_data);
        
    }

    pushBack(_node) {

        if (this.isSimilarTo(_node)) {

            super.pushBack(_node);
        }
        else {

            throw new TypeError(`cannot push new node whose prototype and datatype is not similar to ${Object.getPrototypeOf(this)}`);
        }
    }

    setNext(_node) {

        if (this.isSimilarTo(_node)) {

            super.setNext(_node);
        }
        else {

            throw new TypeError(`cannot set new node whose prototype and datatype is not similar to ${Object.getPrototypeOf(this)}`)
        }
    }

    isSimilarTo(_node) {

        return (_node instanceof T_StrictTypeNode && this.dataType === _node.dataType);
    }
}

module.exports = {T_WeakTypeNode, T_StrictTypeNode};