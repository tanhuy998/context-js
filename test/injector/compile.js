"use strict";
"use strict";

var _dec, _init_vehicleA, _dec2, _init_drive, _dec3, _initProto, _dec4, _init_vehicleB, _dec5, _dec6, _initProto2;
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }
function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }
function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }
function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }
function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
function applyDecs2203RFactory() { function createAddInitializerMethod(initializers, decoratorFinishedRef) { return function (initializer) { !function (decoratorFinishedRef, fnName) { if (decoratorFinishedRef.v) throw new Error("attempted to call " + fnName + " after decoration was finished"); }(decoratorFinishedRef, "addInitializer"), assertCallable(initializer, "An initializer"), initializers.push(initializer); }; } function memberDec(dec, name, desc, initializers, kind, isStatic, isPrivate, value) { var kindStr; switch (kind) { case 1: kindStr = "accessor"; break; case 2: kindStr = "method"; break; case 3: kindStr = "getter"; break; case 4: kindStr = "setter"; break; default: kindStr = "field"; } var get, set, ctx = { kind: kindStr, name: isPrivate ? "#" + name : name, "static": isStatic, "private": isPrivate }, decoratorFinishedRef = { v: !1 }; 0 !== kind && (ctx.addInitializer = createAddInitializerMethod(initializers, decoratorFinishedRef)), 0 === kind ? isPrivate ? (get = desc.get, set = desc.set) : (get = function get() { return this[name]; }, set = function set(v) { this[name] = v; }) : 2 === kind ? get = function get() { return desc.value; } : (1 !== kind && 3 !== kind || (get = function get() { return desc.get.call(this); }), 1 !== kind && 4 !== kind || (set = function set(v) { desc.set.call(this, v); })), ctx.access = get && set ? { get: get, set: set } : get ? { get: get } : { set: set }; try { return dec(value, ctx); } finally { decoratorFinishedRef.v = !0; } } function assertCallable(fn, hint) { if ("function" != typeof fn) throw new TypeError(hint + " must be a function"); } function assertValidReturnValue(kind, value) { var type = _typeof(value); if (1 === kind) { if ("object" !== type || null === value) throw new TypeError("accessor decorators must return an object with get, set, or init properties or void 0"); void 0 !== value.get && assertCallable(value.get, "accessor.get"), void 0 !== value.set && assertCallable(value.set, "accessor.set"), void 0 !== value.init && assertCallable(value.init, "accessor.init"); } else if ("function" !== type) { var hint; throw hint = 0 === kind ? "field" : 10 === kind ? "class" : "method", new TypeError(hint + " decorators must return a function or void 0"); } } function applyMemberDec(ret, base, decInfo, name, kind, isStatic, isPrivate, initializers) { var desc, init, value, newValue, get, set, decs = decInfo[0]; if (isPrivate ? desc = 0 === kind || 1 === kind ? { get: decInfo[3], set: decInfo[4] } : 3 === kind ? { get: decInfo[3] } : 4 === kind ? { set: decInfo[3] } : { value: decInfo[3] } : 0 !== kind && (desc = Object.getOwnPropertyDescriptor(base, name)), 1 === kind ? value = { get: desc.get, set: desc.set } : 2 === kind ? value = desc.value : 3 === kind ? value = desc.get : 4 === kind && (value = desc.set), "function" == typeof decs) void 0 !== (newValue = memberDec(decs, name, desc, initializers, kind, isStatic, isPrivate, value)) && (assertValidReturnValue(kind, newValue), 0 === kind ? init = newValue : 1 === kind ? (init = newValue.init, get = newValue.get || value.get, set = newValue.set || value.set, value = { get: get, set: set }) : value = newValue);else for (var i = decs.length - 1; i >= 0; i--) { var newInit; if (void 0 !== (newValue = memberDec(decs[i], name, desc, initializers, kind, isStatic, isPrivate, value))) assertValidReturnValue(kind, newValue), 0 === kind ? newInit = newValue : 1 === kind ? (newInit = newValue.init, get = newValue.get || value.get, set = newValue.set || value.set, value = { get: get, set: set }) : value = newValue, void 0 !== newInit && (void 0 === init ? init = newInit : "function" == typeof init ? init = [init, newInit] : init.push(newInit)); } if (0 === kind || 1 === kind) { if (void 0 === init) init = function init(instance, _init) { return _init; };else if ("function" != typeof init) { var ownInitializers = init; init = function init(instance, _init2) { for (var value = _init2, i = 0; i < ownInitializers.length; i++) value = ownInitializers[i].call(instance, value); return value; }; } else { var originalInitializer = init; init = function init(instance, _init3) { return originalInitializer.call(instance, _init3); }; } ret.push(init); } 0 !== kind && (1 === kind ? (desc.get = value.get, desc.set = value.set) : 2 === kind ? desc.value = value : 3 === kind ? desc.get = value : 4 === kind && (desc.set = value), isPrivate ? 1 === kind ? (ret.push(function (instance, args) { return value.get.call(instance, args); }), ret.push(function (instance, args) { return value.set.call(instance, args); })) : 2 === kind ? ret.push(value) : ret.push(function (instance, args) { return value.call(instance, args); }) : Object.defineProperty(base, name, desc)); } function applyMemberDecs(Class, decInfos) { for (var protoInitializers, staticInitializers, ret = [], existingProtoNonFields = new Map(), existingStaticNonFields = new Map(), i = 0; i < decInfos.length; i++) { var decInfo = decInfos[i]; if (Array.isArray(decInfo)) { var base, initializers, kind = decInfo[1], name = decInfo[2], isPrivate = decInfo.length > 3, isStatic = kind >= 5; if (isStatic ? (base = Class, 0 !== (kind -= 5) && (initializers = staticInitializers = staticInitializers || [])) : (base = Class.prototype, 0 !== kind && (initializers = protoInitializers = protoInitializers || [])), 0 !== kind && !isPrivate) { var existingNonFields = isStatic ? existingStaticNonFields : existingProtoNonFields, existingKind = existingNonFields.get(name) || 0; if (!0 === existingKind || 3 === existingKind && 4 !== kind || 4 === existingKind && 3 !== kind) throw new Error("Attempted to decorate a public method/accessor that has the same name as a previously decorated public method/accessor. This is not currently supported by the decorators plugin. Property name was: " + name); !existingKind && kind > 2 ? existingNonFields.set(name, kind) : existingNonFields.set(name, !0); } applyMemberDec(ret, base, decInfo, name, kind, isStatic, isPrivate, initializers); } } return pushInitializers(ret, protoInitializers), pushInitializers(ret, staticInitializers), ret; } function pushInitializers(ret, initializers) { initializers && ret.push(function (instance) { for (var i = 0; i < initializers.length; i++) initializers[i].call(instance); return instance; }); } return function (targetClass, memberDecs, classDecs) { return { e: applyMemberDecs(targetClass, memberDecs), get c() { return function (targetClass, classDecs) { if (classDecs.length > 0) { for (var initializers = [], newClass = targetClass, name = targetClass.name, i = classDecs.length - 1; i >= 0; i--) { var decoratorFinishedRef = { v: !1 }; try { var nextNewClass = classDecs[i](newClass, { kind: "class", name: name, addInitializer: createAddInitializerMethod(initializers, decoratorFinishedRef) }); } finally { decoratorFinishedRef.v = !0; } void 0 !== nextNewClass && (assertValidReturnValue(10, nextNewClass), newClass = nextNewClass); } return [newClass, function () { for (var i = 0; i < initializers.length; i++) initializers[i].call(newClass); }]; } }(targetClass, classDecs); } }; }; }
function _applyDecs2203R(targetClass, memberDecs, classDecs) { return (_applyDecs2203R = applyDecs2203RFactory())(targetClass, memberDecs, classDecs); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ObjectInjectorEngine = require('../../src/dependencies/injector/objectInjectorEngine');
var _require = require('../../src/dependencies/constants.js'),
  CONSTRUCTOR = _require.CONSTRUCTOR;
var ComponentManager = require('../../src/dependencies/component/componentManager');
var Interface = require('reflectype/src/interface/interface.js');
//const {implement} = require('reflectype/src/interface/interface.js');
var _require2 = require('reflectype/src/decorators/index.js'),
  type = _require2.type,
  paramsType = _require2.paramsType;
var Bike = /*#__PURE__*/_createClass(function Bike() {
  _classCallCheck(this, Bike);
  _defineProperty(this, "name", 'bike');
});
var Car = /*#__PURE__*/_createClass(function Car() {
  _classCallCheck(this, Car);
  _defineProperty(this, "name", 'car');
});
var Component = /*#__PURE__*/_createClass(function Component() {
  _classCallCheck(this, Component);
  _defineProperty(this, "prop", 'component');
});
_dec = type(Bike);
_dec2 = type(Component);
_dec3 = paramsType(Bike);
var _secret = /*#__PURE__*/new WeakMap();
var _A = /*#__PURE__*/new WeakMap();
var _B = /*#__PURE__*/new WeakMap();
var A = /*#__PURE__*/function () {
  function A() {
    _classCallCheck(this, A);
    _classPrivateFieldInitSpec(this, _secret, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _A, {
      writable: true,
      value: (_initProto(this), _init_vehicleA(this))
    });
    _classPrivateFieldInitSpec(this, _B, {
      writable: true,
      value: _init_drive(this)
    });
  }
  _createClass(A, [{
    key: "vehicleA",
    get: function get() {
      return _classPrivateFieldGet(this, _A);
    },
    set: function set(v) {
      _classPrivateFieldSet(this, _A, v);
    }
  }, {
    key: "drive",
    get: function get() {
      return _classPrivateFieldGet(this, _B);
    },
    set: function set(v) {
      _classPrivateFieldSet(this, _B, v);
    }
  }, {
    key: CONSTRUCTOR,
    value: function value(bike) {
      _classPrivateFieldSet(this, _secret, bike);
      this.vehicleA = bike;
      console.log('A', this.vehicleA);
    }
  }, {
    key: "show",
    value: function show() {
      console.log(_classPrivateFieldGet(this, _secret));
    }
  }]);
  return A;
}();
var _applyDecs2203R$e = _slicedToArray(_applyDecs2203R(A, [[_dec, 1, "vehicleA"], [_dec2, 1, "drive"], [_dec3, 2, CONSTRUCTOR]], []).e, 3);
_init_vehicleA = _applyDecs2203R$e[0];
_init_drive = _applyDecs2203R$e[1];
_initProto = _applyDecs2203R$e[2];
_dec4 = type(Car);
_dec5 = paramsType(Car);
_dec6 = paramsType(Component);
var _A2 = /*#__PURE__*/new WeakMap();
var B = /*#__PURE__*/function (_A3) {
  _inherits(B, _A3);
  var _super = _createSuper(B);
  function B() {
    var _this;
    _classCallCheck(this, B);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _classPrivateFieldInitSpec(_assertThisInitialized(_this), _A2, {
      writable: true,
      value: (_initProto2(_assertThisInitialized(_this)), _init_vehicleB(_assertThisInitialized(_this)))
    });
    return _this;
  }
  _createClass(B, [{
    key: "vehicleB",
    get: function get() {
      return _classPrivateFieldGet(this, _A2);
    },
    set: function set(v) {
      _classPrivateFieldSet(this, _A2, v);
    }
  }, {
    key: CONSTRUCTOR,
    value: function value(car) {
      this.vehicleB = car;
      console.log('B', this.vehicleB);
    }
  }, {
    key: "doSomething",
    value: function doSomething(component) {
      console.log(component);
    }
  }]);
  return B;
}(A);
var _applyDecs2203R$e2 = _slicedToArray(_applyDecs2203R(B, [[_dec4, 1, "vehicleB"], [_dec5, 2, CONSTRUCTOR], [_dec6, 2, "doSomething"]], []).e, 2);
_init_vehicleB = _applyDecs2203R$e2[0];
_initProto2 = _applyDecs2203R$e2[1];
var components = new ComponentManager();
components.bind(Bike, Bike);
components.bind(Car, Car);
components.bind(A, A);
components.bind(B, B);
components.bind(Component, Component);
var injector = new ObjectInjectorEngine(components.container);
var obj = new B();
injector.inject(obj);
var MethodInjectorEngine = require('../../src/dependencies/injector/methodInjectorEngine.js');
var methodInjector = new MethodInjectorEngine(components.container);
methodInjector.inject(obj, 'doSomething');
obj.doSomething();

