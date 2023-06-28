//const path = require('path')
const {EventEmitter} = require('node:events');

/**
 *  A wrapper for node:EventEmmitter objects that manages and registers channel's event 
 *  
 *  Instead of doing ipcMain.on('channel:subChannel:subSubChannel', (..arg) => { ...action }) is confuse
 *  managing channel and sub channel between proccesses.
 *  
 *  With this class EventChannelResolver
 *                  .on('channel')
 *                  .sub('subChannel')
 *                  .do((...arg) => {
 *                      
 *                      ...action
 *                  })
 *  
 *  This class with resolve the channel and sub channel like the code belows
 *      ipcMain.on('channel:subChannel', (..arg) => { ...action })
 * 
 *      *ipcMain is the EventEmitter object that this class's instance wraps in
 */
class EventChannelResolver {
    /**
     * The target which this class's instances wrapping
     * 
     * @property {node:EventEmitter}
     */
    #eventEmitterTarget;

    /**
     * The EventEmitter that emitting events for internal operations 
     * 
     * @property {node:EventEmitter}
     */
    #handler;

    /**
     * Store cache of the resolving channel's string 
     * 
     * @property {string} 
     */
    #cache;

    /**
     * Constructor
     *  
     * @param {node:EventEmitter} _eventEmitter 
     */
    constructor(_eventEmitter) {

        this.#eventEmitterTarget = _eventEmitter;
        this.#handler = new EventEmitter();

        this.#Init();
    }

    #Init() {

        //this.resolve = require('./initMessages.js');
        
        this.#cache = '';
        
        this.#InitializeEventHandler();
    }

    /**
     * Initializing internal operation's events
     */
    #InitializeEventHandler() {

        this.#handler.on('channel', (function (_channel) {
            
            this.#cache = _channel;

        }).bind(this));

        this.#handler.on('subChannel', (function (_subChannel) {
            
            if (!this.#cache) return;

            this.#cache += `:${_subChannel}`;

        }).bind(this));

        this.#handler.on('finishManagemant', async function() {
            
            process.nextTick(function(_this) {

                _this.#clearCache();

            }, this)

        }.bind(this))
    }

    #clearCache() {

        this.#cache = '';
    }
    /* mainProcChannel.stream.start.do((..arg) => {

        action
    })
    */
    /**
     *  
     *  
     * 
     * @param {function} _targetAction 
     * @param {function} _callback 
     * 
     * @returns {string} the resolved target event channel
     */
    #doAction(_targetAction, _callback) {

        if (!this.#cache) return '';

        //this.#handler.emit('finish');

        let full_channel = this.#cache;

        const bindedAction =  _targetAction.bind(this.#eventEmitterTarget);
        bindedAction(full_channel, _callback);     

        return this.#cache;
    }

    on(_channel) {

        this.#handler.emit('finishManagemant');

        this.#handler.emit('channel', _channel);

        return this;
    }

    sub(_channel) {

        this.#handler.emit('subChannel', _channel);

        return this;
    }


    do(_callback) {

        const target_action = this.#eventEmitterTarget.on;

        this.#doAction(target_action, _callback);

        return this;
    }

    doOnce(_callback) {

       const target_action = this.#eventEmitterTarget.once;

       this.#doAction(target_action, _callback);

       return this;
    }

    send() {

        const target_action = this.#eventEmitterTarget.send;

        this.#doAction(target_action);
    }

    emit() {

        const target_action = this.#eventEmitterTarget.emit;

        this.#doAction(target_action);
    }
}

module.exports = EventChannelResolver;