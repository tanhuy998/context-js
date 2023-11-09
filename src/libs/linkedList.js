const LAST_NODE = Infinity;

/**
 * @class
 * @template T
 */
class T_WeakTypeNode {

    /**@type {T_WeakTypeNode<any>} */
    #next;

    #data;

    //#error;


    get next() {

        return this.#next;
    }

    /**@returns {T} */
    get data() {

        return this.#data;
    }

    /**
     * 
     * @param {T_WeakTypeNode<any>} _node 
     * @returns {boolean}
     */
    setNext(_node = null) {

        if (_node instanceof T_WeakTypeNode) {

            if (this.next) {
                //console.log('next', )
                _node.pushBack(this.next);
            }
            
            this.#next = _node;

            return true;
        }
        else if (_node === undefined || _node === null){

            const result = this.#next;

            this.#next = null;

            return result;
        }

        throw new TypeError('_node is not type of T_WeakTypeNode');
    }

    /**
     * 
     * @param {T} _data 
     */
    constructor(_data) {

        // if (typeof _callback !== 'function') {

        //     throw new TypeError('_callback is not a function');
        // }

        if (!_data) {

            throw new TypeError('_data cannot be null or undefined');
        }

        this.#data = _data;
    }

    /**
     * 
     * @param {T_WeakTypeNode<any>} _node 
     * 
     * @returns {boolean}
     */
    pushBack(_node = null) {

        if (_node === this) return false;

        const nextNode = this.#next;

        if (nextNode) {

            nextNode.pushBack(_node);
        }
        else {

            this.setNext(_node);
        }

        return true;
    }

    /**
     * 
     * @param {T_WeakTypeNode<any>} _from 
     * @param {Number} _count
     * 
     * @returns {boolean} 
     */
    remove(_fromNode, _count) {

        const firstNode = this.traverse();
    }

    /**
     * Remove/Replace _deleteCount Nodes from the beginning _from
     * this method is not working like the Array.splice
     * in case insertion without removing any nodes
     * use the setNext and pushBack method instead.
     * 
     * @param {number | T_WeakTypeNode<any>} _from 
     * @param {number} _deleteCount 
     * @param  {...any} items 
     * 
     * @returns {boolean}
     */
    splice(_from, _deleteCount, ...nodes) {
        
        const [upperBound, lowerBound] = this.#splice_calculateVector(_from, _deleteCount);

        /**
         *  the index of upperBound is the current node traverse _from nodes (if _from is number), 
         *  otherwise upperBound.next === _from (type is T_WeakTypeNode is prerequisite)
         *  lowerBound's index is upperBound traverse _deletCount nodes
         *  mathematical representation: the removed nodes set is (upperBound, lowerBound]
         */

        const fromRemove = upperBound.next;

        upperBound.setNext(null);

        let insertedNode;

        for (const node of nodes) {

            if (!insertedNode) {

                insertedNode = node;
            }
            else {

                insertedNode.pushBack(node);
            }
        }

        if (!insertedNode) {

            insertedNode = lowerBound.next;
        }
        else {

            insertedNode.pushBack(lowerBound.next);
        }
        
        upperBound.setNext(insertedNode);
    }

    /**
     * Calculate the vector of indexes that is bounding the subset of the chain
     * 
     * @param {T_WeakTypeNode<any> | number} _from 
     * @param {number} _count 
     * 
     * @returns {Array<T_WeakTypeNode>}
     */
    #splice_calculateVector(_from, _count) {

        let upperBound = null;
        let lowerBound = null;

        this.#splice_checkValidBound(_from, _count);

        //upperBound = typeof _from === 'number' ? this.traverse(_from) : this.exists(_from) ? _from : null;

        if (typeof _from === 'number') {

            upperBound = _from > 1 ? this.traverse(_from - 1) : this;
        }
        else {
            // if is not type of nummber, it's exactly type of T_WeakTypeNode
            // because parameters is type checked strictly

            let iterator = this;

            while(iterator) {

                if (iterator.next === _from) {

                    upperBound = iterator;
                }
                else {

                    iterator = iterator.next;
                }
            }
        }

        if (!upperBound) {

            throw new Error('invalid value passed to parameter _from');
        }

        lowerBound = upperBound.traverse(_count) || upperBound.next;

        // upperBound is the higher order node
        // the node that has the smaller index is the higher order node
        return [upperBound, lowerBound];
    }


    /**
     * 
     * @param {number|T_WeakTypeNode<any>} _upper 
     * @param {number} _lower 
     */
    #splice_checkValidBound(_upper, _lower) {

        if (typeof _lower !== 'number') {

            throw new TypeError('_count must be type of number');
        }
        
        if (_lower < 0) {

            throw new Error('invalid value passed to parameter _deleteCount');
        }

        if (typeof _upper === 'number') {

            if (_upper > _lower) {

                throw new Error('_from must be less than or equal to _count');
            }

            if (_upper <= 0) {

                throw new Error('_from must be great than 0');
            }

            //upperBound = this.traverse(_upper);

            //return true;
        }
        else  {

            if (!(_upper instanceof T_WeakTypeNode)) {

                throw new TypeError('_from must be type of T_WeakTypeNode');
            }

            // if (this.exists(_from)) {

            //     upperBound = _from;
            // }

           // return true;
        }
    }

    /**
     * 
     * @param {T_WeakTypeNode<any>} _fromNode 
     * @param {number} _deleteCount 
     * @param  {...T_StrictTypeNode} nodes 
     * 
     * @returns {T_StrictTypeNode | boolean} _fromNode with it chained node
     */
    replace(_fromNode, _deleteCount, ...nodes) {

        if (!this.exist(_fromNode)) {

            return false;
        }

        this.splice(_fromNode, _deleteCount, ...nodes);

        return _fromNode;
    }

    /** 
     * 
     * @param {T_WeakTypeNode<any>} _node 
     * 
     * @returns {boolean}
     */
    exists(_node) {

        if (!(_node instanceof T_WeakTypeNode)) {

            throw new TypeError('_node must be an instance of type T_weakTypeNode');
        }

        let index = 1;

        let iterator = this.next;

        while(iterator) {

            //console.log(index)
            if (iterator === _node) {

                return index;
            }

            ++index;
            iterator = iterator.next;
        }

        return false;
    }

    findIndexOf(_node) {

        return this.exists(_node);
    }

    /**
     * 
     * @param {number|undefined} _destination 
     * 
     * @returns {T_WeakTypeNode<any>|undefined}
     */
    traverse(_destination) {

        if (!_destination) {

            _destination = LAST_NODE;
        }

        if (typeof _destination !== 'number') {

            throw new TypeError('_destinantion must be type of number');
        }

        if (_destination === 0) {

            return null;
        }

        let index = 0;

        let iterator = this;

        const hashList = _destination < 0 ? [] : undefined;

        while(iterator.next) {
           
            index++;

            iterator = iterator.next;

            if (_destination < 0) {

                hashList.push(iterator);

                continue;
            }

            if (index === _destination) {

                return iterator;
            }
        }

        if (_destination === Infinity) {

            return iterator
        }
        else if (_destination < 0) {

            const index = hashList.length + _destination;

            return hashList[index]
        }
        else {

            return null;
        }
        
    }
}

/**
 * @class
 * @template T
 */
class T_StrictTypeNode extends T_WeakTypeNode {

    /**@type {typeof T} */
    #type;

    /**@returns {typeof T} */
    get dataType() {

        return this.#type;
    }

    /**
     * 
     * @param {T} _data 
     * @param {*} _type 
     */
    constructor(_data, _type) {

        super(_data);

        this.#type = Object.getPrototypeOf(_data);
        
    }

    /**
     * 
     * @param {T_StrictTypeNode<T>} _node 
     */
    pushBack(_node) {

        if (this.isSimilarTo(_node)) {

            super.pushBack(_node);
        }
        else {

            throw new TypeError(`cannot push new node whose prototype and datatype is not similar to ${Object.getPrototypeOf(this)}`);
        }
    }

    /**
     * 
     * @param {T_StrictTypeNode<T>} _node 
     */
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



module.exports = {T_WeakTypeNode, T_StrictTypeNode, LAST_NODE};