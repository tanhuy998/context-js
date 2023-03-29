const express = require('express');
const ControllerComponentManager = require('./controller/controllerComponentManager.js');
const decoratorVersion = require('../decoratorVersion.js');
const resolveProjectRootDir = require('./libs/dir.js');


class ApplicationContext {

    #config;
    #preset;
    #rootDir;

    #routeContext;
    #bindingContext;

    #componentsConfig;
    #iocContainer;
    #supportIoc = false;
    #componentManager;
    

    get components() {

        return this.#componentsConfig;
    }

    get supportIoc() {

        return this.#supportIoc;
    }

    get iocContainer() {

        return this.#componentManager;
    }

    buildController(_concrete) {

        if (this.#supportIoc) {

            return this.#componentManager.buildController(_concrete);
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

        this.#supportIoc = true;
    };

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
}

module.exports = ApplicationContext;