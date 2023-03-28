const legacy = require('./legacy.js');

const {stage_0_To_Stage_3_Adapter} = require('./tc39-stage3-decorator/adapterForLegacy.js');

const {
    PreInvokeFunction,
    BaseController,
    DecoratorResult,
    DecoratorType,
    MethodDecorator,
    PropertyDecorator,
    ClassDecorator,
    RouteContext,
    view,
    redirect,
    file,
    download,
    ViewResult, 
    ViewResultError,
    RedirectResult, 
    RedirectResultNoContextError,
    FileResult, 
    FileResultNoContextError,
    DownloadResult, 
    DownloadResultNoContextError,
} = legacy;

const exportContent = {
    PreInvokeFunction,
    BaseController,
    DecoratorResult,
    DecoratorType,
    MethodDecorator,
    PropertyDecorator,
    ClassDecorator,
    RouteContext,
    view,
    redirect,
    file,
    download,
    ViewResult, 
    ViewResultError,
    RedirectResult, 
    RedirectResultNoContextError,
    FileResult, 
    FileResultNoContextError,
    DownloadResult, 
    DownloadResultNoContextError,
};


for (const name in legacy) {

    if (exportContent[name]) continue;

    exportContent[name] = new Proxy(legacy[name], stage_0_To_Stage_3_Adapter);
}

//console.log(Reflect.ownKeys(exportContent), Reflect.ownKeys(legacy));

module.exports = exportContent;