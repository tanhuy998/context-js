const express = require('express');
const ControllerComponentManager = require('./controller/controllerComponentManager.js');
const decoratorVersion = require('../decoratorVersion.js');
const resolveProjectRootDir = require('./libs/dir.js');
const HttpContext = require('./httpContext.js');
const {request, response} = require('express');
const ControllerState = require('./controller/controllerState.js');
const ControllerConfiguration = require('./controller/controllerConfiguration.js');
//const WS = require('./websocket/ws.js');


class ApplicationContext {

    #config;
    #preset;
    #rootDir;

    #routeContext;
    #websocketContext;
    #bindingContext;

    #componentsConfig;
    #iocContainer;
    #supportIoc = false;
    #componentManager;

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
    };

    _initPresetComponents() {

        if (!this.#supportIoc) return;

        console.log('ApplicationContext init preset components')

        this.#componentManager.bindScope(HttpContext, HttpContext);

        this.#componentManager.bindSingleton(ControllerConfiguration, ControllerConfiguration);
        
        const controllerConfig = this.#componentManager.configuration;
        this.#componentManager.setDefaultInstanceFor(ControllerConfiguration, controllerConfig);

        this.#componentManager.bind(ControllerState, ControllerState);
    }

    constructor(_preset) {
        
        this.#preset = _preset;

        this.#resolveRootDir();
        this.#Init();
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

    #resolveRootDir() {

        this.#rootDir = resolveProjectRootDir();
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
}

module.exports = ApplicationContext;