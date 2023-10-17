const BaseController = require('../../../controller/baseController.js');
const HandlerContext = require('./handlerContext.js');
const {EventEmitter} = require('node:events');

class HandlerContestInitializer {

    #events = new EventEmitter();

    #appContext;

    /**@type {Set} */
    #controllers = new Set;

    #initCLass = HandlerContext;

    #useIoc = false;

    #pipeline;

    get controllers() {

        return Array.from(this.#controllers);
    }

    /**
     * 
     * @param {HandlerContext} _class 
     * 
     * @throw 
     */
    setInitClass(_class) {

        if (!_class) {

            return;
        }

        if (_class.prototype instanceof HandlerContext) {

            this.#initCLass = _class;

            return;
        }
        else {

            throw new TypeError();
        }
    }

    getInitialClass() {

        return this.#initCLass;
    }
    /**
     * 
     * @param  {...any} controllerClasses 
     * @returns 
     * 
     * @throw TypeError
     */
    useController(...controllerClasses) {

        for (const Class of controllerClasses) {

            const isController = Class.prototype instanceof BaseController;
            const isRegistered = isController  && this.#controllers.has(Class);

            if (isController && !isRegistered) {

                this.#controllers.add(Class);
            }
            else if (isRegistered) {

                continue;
            }
            else {

                throw new TypeError('could not register ${c.name} not type of BaseController');
            }
        }

        return this;
    }

    addpipeline() {


    }

    #addTask(phase, ..._task) {

        
    }

    onMount(..._task) {

        if (typeof _task !== 'function') {

            throw new TypeError('_task must type of function');
        }

        this
    }

    useIoC() {

        this.#useIoc = true;

        return this;
    }

    serve() {

        this.#events.emit('mount')

        this.#mountConfig();

        this.#events.emit('pipeline');

        this.#initPipeline();

        this.#events.emit('generate');

        return this.#generateHandler();
    }

    #mountConfig() {


    }

    #initPipeline() {


    }

    #generateHandler() {


        return function(...args) {


        }
    }
}

module.exports = HandlerContestInitializer;