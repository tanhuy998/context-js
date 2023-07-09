const {EventEmitter} = require('node:events');
const {ProgressState, ProgressTracker} = require('./progressTracker');

/**
 *  Another kind of tracking progresses
 *  Use this class in inter progress tracking situation
 */
class ProgressListener extends EventEmitter{

    /**
     *  Set of progresses that 
     * 
     * @property {ProgressTracker} 
     */
    #progressSet;

    /**
     * @property {string}
     */
    #name;

    /**
     * @property {Symbol}
     */
    #symbolName;

    /**
     * @property {array<Symbol>}
     */
    #cacheProgression;

    /**
     * @property {boolean}
     */
    #cacheExpire;

    /**
     * @property {int}
     */
    #numberOfProgress;

    /**
     * @property {enum ProgresState}
     */
    #state;

    /**
     * 
     * @param {string} _name 
     * @param  {...ProgressTracker} _progressSet 
     */
    constructor(_name, ..._progressSet) {

        super();

        this.#name = _name;
        this.#symbolName = Symbol(_name);
        this.#cacheProgression = [];
        this.#cacheExpire = true;
        this.#progressSet = _progressSet;
        this.#state = ProgressState.REACHED;
        this.#numberOfProgress = _progressSet.length;

        this.#Init();
        this.#InitializeEvent();
    }

    #Init() {   

        // when there 1 progress is passed to constructor
        // this instance with listen for state of child progresses
        // if (this.#progressSet.length == 1) {

        //     const target = this.#progressSet[0];

        //     // trick to call private function in callback
        //     // to get rid of closure context isolation
        //     const copy_cat = {
        //         notify: this.#notify.bind(this),
        //     }

        //     target.on('update', (function(_childProgressOfTarget) {

        //         // has to use 'this' pointer in this context
        //         // because cannot pass 'this' when listening
        //         // on other EventEmitter's event
        //         //this.listen(_childProgressOfTarget);

        //         this.notify('progress', _childProgressOfTarget);

        //     }).bind(copy_cat));
        // }

        const temp = {};

        let is_AllDone = true;

        for (const progress of this.#progressSet) {

            if (!(progress instanceof ProgressTracker)) throw new Error('_progressSet must be instance of ProgressTracker');

            const symbolName = progress.symbolName;

            temp[symbolName] = progress;

            this.#listen(progress);

            if (!progress.completed) is_AllDone = false;
        }

        this.#progressSet = temp;

        this.#state = ProgressState.PENDING;
    }

    

    #InitializeEvent() {

        this.on('progress', (_listOfFinishedProgress) => {

        })

        this.on('finish', (_progressSet) => {

        })

        this.on('envole', (_newProgress) => {

        })
    }

    #listen(_progress) {

        _progress.on('completed', (function(progress) {
            
            this.check();
        }).bind(this));
    }

    #notify(_event, ...arg) {

        process.nextTick((function(..._arg) {

            this.emit(_event, ..._arg);
        }).bind(this), ...arg)
    }

    #checkProgresion() {

        let finished_progesses = 0;

        for (const symbolName of Reflect.ownKeys(this.#progressSet)) {

            if (this.#progressSet[symbolName].completed) finished_progesses++;
        }

        if (finished_progesses > this.#cacheProgression.length) {
            
            this.#cacheExpire = true;

            this.#notify('progress', this.progression);
            
            if (finished_progesses == this.#numberOfProgress) {

                this.#state = ProgressState.COMPLETE;
    
                this.#notify('finish', this.progression);
            }
        }
    }

    /**
     * 
     * @param  {...Symbol} _symbols 
     * 
     * @returns {array<Symbol>} if no param is passed
     * @returns {boolean} if 1 param is passed
     * @returns {Object[Symbol]} if more than one 
     */
    check(..._symbols) {

        this.#checkProgresion();

        if (_symbols.length == 0) return this.progression;

        let result = {};

        for (const symbol of _symbols) {

            if (!(symbol instanceof Symbol)) continue;

            const target = this.#progressSet[symbol];

            if (target) {

                result[symbol] = this.target.completed;
            }
        }

        if (_symbols.length < 2) return result[_symbols[0]];

        return result;
    }

    /**
     * @returns {enum ProgressState}
     */
    get finished() {

        return this.#state == ProgressState.COMPLETE;
    }

    /**
     * @returns {array<Symbol>}
     */
    get progression() {

        if (!this.#cacheExpire) return this.#cacheProgression;

        this.#cacheExpire = false;

        this.#cacheProgression = Reflect.ownKeys(this.#progressSet)
                        .filter((function(symbol) {

                            return (this.#progressSet[symbol].completed);
                        }).bind(this));
        
        return this.#cacheProgression;
    }
}

module.exports = ProgressListener;