const {EventEmitter} = require('node:events')


class ProgressState {

    static get REACHED() {

        return -1;
    }

    static get PENDING() {

        return 0x0;
    }

    static get COMPLETE() {

        return 0x1;
    }
}



/**
 *  A To do list for controlling application's Progress
 */
class ProgressTracker extends EventEmitter {

    /**
     * @property {ProgressTracker}
     */
    #parentProgress;

    /**
     * @property {array<ProgressTracker>}
     */
    #childProgresses;

    /**
     * @property {string}
     */
    #name;

    /**
     * @property {ProgressState}
     */
    #state;

    /** 
     * Uncompleted progress cache
     * 
     * @property {array}
     */
    #uncompletedCache;

    /**
     * 
     * @property {boolean}
     */
    #cacheExpired;

    /**
     * 
     * @property {Symbol}
     */
    #symbol;

    /**
     * 
     */
    #numberOfChild;

    /**
     * @property {any}
     */
    #payload;

    /**
     *  Constructor
     * 
     * @param {string} _name The Progress's name
     * @param  {...ProgressTracker} list a
     */
    constructor(_name, ...list) {

        super();

        this.#numberOfChild = 0;
        this.#childProgresses = list;
        this.#name = _name;
        this.#state = ProgressState.REACHED;
        this.#uncompletedCache = undefined;
        this.#cacheExpired = true;
        this.#symbol = Symbol(_name);
        this.#payload = undefined;

        this.#Init();
        this.#InitializeEvents();

        this.#state = ProgressState.PENDING;
    }

    #Init() {

        if (!this.#name) throw new Error('Progress object must has a name');

        const temp = {};

        for (const child of this.#childProgresses) {

            if (!(child instanceof ProgressTracker)) throw new Error('...list must be list of Progress instance');
        
            temp[child.symbolName] = child;

            child.join(this);

            this.#numberOfChild++;
        }

        this.#childProgresses = temp;
    }

    #InitializeEvents() {
        this.on('reached', () => {

        });

        this.on('pending', () => {

        })

        this.on('completed', () => {


        })

        this.on('update', function(_progress) {


        }.bind(this))
    }

    /**
     *  Acknowledge a child Progress
     *  and update internal progress state
     *  
     *  Emit event: 'update'
     * 
     * @param {ProgressTracker} _progress 
     * @returns {boolean}
     */
    acknowledge(_progress) {

        // just only a parent progress acknowledges it's child
        //if (!this.isAtomic) return false;

        if (!_progress.isChildOf(this)) return false;

        if ((!_progress.completed)) return false;

        if (this.#state == ProgressState.COMPLETE) return false; 

        // when met all prerequesites above

        if (this.#state == ProgressState.REACHED) {

            this.#state = ProgressState.PENDING;

            process.nextTick((_this) => {

                _this.emit('pending', _this)
            }, this)
        }


        this.#cacheExpired = true;

        this.#updateState();
        this.#resolvePayload(_progress);

        process.nextTick((_this, _progress) => {
            
            this.emit('update', _progress);
            _progress.emit('completed', _progress);
        }, this, _progress)

        return true;
    }
    /**
     * Mark this progress is completed
     * This method is used for atomic progress
     * 
     * @return {boolean}
     */
    done(_resolveData) {

        if (!this.isAtomic) throw new Error(this.name + ' is not atomic progress, cannot do method \'done\'');


        this.#state = ProgressState.COMPLETE;

        this.#payload = _resolveData;

        process.nextTick((_this) => {

            _this.emit('completed', _this);
        }, this)

        if (!this.#parentProgress) return true;
        else return this.#parentProgress.acknowledge(this);
    }

    #resolvePayload(_childProgress) {

        if (this.isAtomic) throw new Error('Atomic progress cannot do this \'#resolvePayload\' method');

        if (!_childProgress.isChildOf(this)) throw new Error(_childProgress.name + ' passed to \'#resolvePayload\' is not child of ' + this.name + ' progress');

        if (!_childProgress.completed) throw new Error(_childProgress.name + ' has not completed yet');

        if (!this.#payload) this.#payload = {};

        this.#payload[_childProgress.symbolName] = _childProgress.payload;

        return true;
    }

    /**
     *  Update a non atomic progress's state
     *  If all child processes completed
     *  Notify parent progress for acknowledgement
     */
    #updateState() {

        const uncompleted_progresses = this.uncompletedProgress;

        if (uncompleted_progresses.length != 0) return;
        
        this.#state = ProgressState.COMPLETE;

        process.nextTick((_this) => {
            
            _this.emit('completed', _this);
        }, this)

        if (this.isRoot) return;
        this.#parentProgress.acknowledge(this);
    }


    /**
     *  Check if the current Progress is conprehensive
     */
    get isRoot() {

        return (!this.#parentProgress);
    }

    /**
     * Check if this is atomic progress
     * 
     * *Atomic progress meanning that a progress has no sub(child) progresses
     */
    get isAtomic() {

        //return (this.#parentProgress && this.#numberOfChild == 0);
        return this.#numberOfChild == 0;
    }

    join(_progress) {

        if (this.#parentProgress) return false;

        this.#parentProgress = _progress;

        return true;
    }

    /**
     * 
     * @param {ProgressTracker} _progress 
     * @returns {boolean}
     */
    track(_progress) {

        //if (this.completed) return false;

        // equivilent to _progress.isChildOf(this)
        if (this.#childProgresses[_progress.symbolName]) return false;

        // this condition for preventing a child progress been push to another
        // but sometimes multiple progresses may await for a single progress
        //if (!_progress.isAtomic) return false;

        this.#childProgresses[_progress.symbolName] = _progress;

        this.#numberOfChild++;

        return true;
    }

    /**
     * 
     * @param {ProgressTracker} _progress 
     */
    isChildOf(_progress) {

        return (this.#parentProgress === _progress);
    }

    get completed() {

        return (this.#state == ProgressState.COMPLETE);
        //return (this.#state);
    }

    get name() {

        return this.#name;
    }

    get symbolName() {

        return this.#symbol;
    }

    get payload() {

        return this.#payload;
    }

    /**
     * List of uncompleted progress's name
     * 
     * @return {array<string>} eg. ['progress1', 'progress2', 'progress3']
     */
    get uncompletedProgress() {

        if (!this.#cacheExpired) return this.#uncompletedCache; 

        //console.log(Reflect.ownKeys(this.#childProgresses))

        this.#uncompletedCache = Reflect.ownKeys(this.#childProgresses)
                                    .filter(function (symbol) {
                                        
                                        const progress = this.#childProgresses[symbol]

                                        return (!progress.completed);
                                    }.bind(this));
                
        this.#cacheExpired = false;
        
        // just return list of uncompleted progress's name
        return this.#uncompletedCache;
    }
}

module.exports = {ProgressTracker, ProgressState};