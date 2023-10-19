const express = require('express');
const ControllerComponentManager = require('./controller/controllerComponentManager.js');
const decoratorVersion = require('../decoratorVersion.js');
const resolveProjectRootDir = require('./libs/dir.js');
const HttpContext = require('./httpContext.js');
const {request, response} = require('express');
const ControllerState = require('./controller/controllerState.js');
const ControllerConfiguration = require('./controller/controllerConfiguration.js');
const AppState = require('./appState.js');
//const WS = require('./websocket/ws.js');

/**
 *  @typedef {import('./websocket/websocketContext.js')} WebsocketContext
 *  @typedef {import('./http/httpRouting.js')} HttpRouteContext
 *  @typedef {import('./ioc/decorator.js').BindingContext} IocBindingContext
 */

const {CONTEXT_DEFAULT, PRIMARY} = require('./constants.js')

class ApplicationContext {

    #config;
    
    /** @type {} */
    #routeContext;

    /** @type {WebsocketContext}*/
    #websocketContext;

    /** @type {IocBindingContext} */
    #bindingContext;

    /**
     *  @type {ControllerConfiguration}
     */
    #componentsConfig;
    #iocContainer;

    /**
     *  @type {boolean}
     */
    #supportIoc = false;

    /**
     *  @type {ControllerComponentManager}
     */
    #componentManager;

    /**
     *  @type {number}
     */
    #maxSyncTask = 50;


    #wsHandler;



    get wsHandler() {

        return this.#wsHandler;
    }

    get maxSyncTask() {

        return this.#maxSyncTask;
    }

    
    get components() {

        return this.#componentsConfig;
    }

    get supportIoc() {

        return this.#supportIoc;
    }

    /**
     *  @returns {ControllerComponentManager}
     */
    get iocContainer() {

        return this.#componentManager;
    }

    buildController(_concrete , req = undefined, res = undefined, next = undefined) {

        if (this.#supportIoc) {

            return this.#componentManager.buildController(_concrete, req, res, next);
        }

        return new _concrete();
    }

    useIoc() {

        if (this.supportIoc) return;

        const container = new ControllerComponentManager(decoratorVersion);

        this.#componentsConfig = container.configuration;

        this.#componentManager = container;

        this.#bindingContext.fixedContext(container);

        this.#routeContext.setApplicationContext(this);

        this.#websocketContext.setApplicationContext(this);

        this.#supportIoc = true;

        this._initPresetComponents();
    }

    _initPresetComponents() {

        if (!this.#supportIoc) return;

        console.log('ApplicationContext init preset components')

        this.#componentManager.bindScope(HttpContext, HttpContext);

        this.#componentManager.bindSingleton(ControllerConfiguration, ControllerConfiguration);
        
        const controllerConfig = this.#componentManager.configuration;
        this.#componentManager.setDefaultInstanceFor(ControllerConfiguration, controllerConfig);

        this.#componentManager.bind(ControllerState, ControllerState);
    }

    #Init() {
        
        this.#initPreset();

        this.#routeContext.init(express);

        //this.#readConfig();
        //this.#applyConfig();
    }

    #initPreset() {

        this.#routeContext = this.#preset.RouteContext;

        this.#websocketContext = this.#preset.WebsocketContext;

        this.#bindingContext = this.#preset.ioc.BindingContext;
    }

    #readConfig() {


    }

    #bindComponentInConfig() {

    }

    getComponent(abstract, _controllerState) {

        return this.#componentManager.get(abstract, _controllerState);
    }


    resolveRoutes() {

        return this.#routeContext.resolve();
    }

    maxSyncTask(_number) {

        if (typeof _number !== 'number') {

            throw new TypeError('_number must be type of number');
        }

        if (_number == 0) {

            throw new Error('number of sync task must be greater than 0');
        }

        this.#maxSyncTask = Math.floor(_number);
    }

    resolveWSHandler() {


    }

    mount() {

        this.#state = AppState.MOUNT;

        

        this.#state = AppState.RUNTIME;
    }



    /**
     * 
     * 
     * 
     * 
     * 
     */

    #contexts = new Map();
    #preset;
    #rootDir;

    /**
 *  @type {AppState}
 */
    #state;

    get state() {

        return this.#state;
    }
    constructor(_preset) {
        
        this.#preset = _preset;
        
        this.#Init();
    }

    dispatch() {

        return this.dispatchHandler(CONTEXT_DEFAULT);
    }
    dispatchHandler(context) {

        if (!context) {

            context = CONTEXT_DEFAULT;
        }

        return this.resolveWSHandler();
    }

    // #resolveHandler() {

        
    // }

    #init() {

        this.#state = AppState.INIT;

        this.#resolveRootDir();
        this.#initPreset();

    }

    #initPreset() {


    }

    #resolveRootDir() {

        this.#rootDir = resolveProjectRootDir();
    }
}

module.exports = ApplicationContext;