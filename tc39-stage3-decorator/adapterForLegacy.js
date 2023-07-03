const {BaseController} = require('../src/controller/baseController.js');
const PreInvokeFuncion = require('../src/callback/preInvokeFunction.js');
const {DecoratorResult} = require('../src/decorator/decoratorResult.js');

const stage_0_To_Stage_3_Adapter =  {
	convertToLegacyDecoratorMeta(value, context, _thisContext) {

		const {kind, name} = context;

		const descriptor = {
			enumerable: false,
			configurable: false,
			writable: false,
            value: undefined,
		}

		const pseudoObject = {
			
		}

		Object.defineProperty(pseudoObject, 'isPseudo', {
			value: true,
			writable: false,
			configurable: false
		})

		// Object.defineProperty(descriptor, 'private', {
		// 	value: context.private,
		// 	writable: false,
		// 	configurable: false
		// })

		//console.log(descriptor)

		// Object.defineProperty(pseudoObject, name, {
		// 	value: value,
		// 	get : context.access.get,
		// 	set: context.access.set
		// })

		//console.log(context.access.get())
		

		descriptor.get = context?.access?.get;
		descriptor.set = context?.access?.set;
		descriptor.private = context?.private;

		switch(kind) {

			case 'class':
				return [value];
				break;
			case 'method':
				descriptor.value = (value.name == 'stage3WrapperFunction') ? value() : value;
				break;
			case 'field':
				descriptor.initializer = () => value;
				break;
		}

		return [pseudoObject, name, descriptor];
	},
	convertToStage3coratorMeta(_stage3Value, _stage3Context, _legacyMeta, _thisContext) {
		/**
		 * 	the _legacyMeta is the object that returned by the legacy decorator
		 * 	If type of the legacy decorator is property decorator, _legacyMeta is the descriptor of class property
		 * 	Otherwise, _legacyMeta is the class that is decorated.
		 */

		let result;

		const {kind, name} = _stage3Context;

		switch(kind) {

			case 'class':
				result = _legacyMeta;
				break;
			case 'method': {

                const descriptorValue = _legacyMeta.value;

                function stage3WrapperFunction() {

                    return descriptorValue;
                }

				result = (typeof descriptorValue == 'function') ? descriptorValue : stage3WrapperFunction;

            }
				break;
			case 'field': {

                const initializer = _legacyMeta.initializer; 

				

				result = function(_initValue) {

					return initializer() || _initValue;
				};
            }
				//const setter = _stage3Context.access.set;
				break;
            default: 
                break;
		}

		return result;
	},
	get(target, _prop) {

		const result = target[_prop];


		if (typeof result == 'function') {

			return new Proxy(result, this);
		}
		else {

			return result;
		}
	},
	resolveDecorator(value, context, _legacyDecorator, _thisContext) {
		
		const legacyMeta = this.convertToLegacyDecoratorMeta(value, context, _thisContext);

		const meta = _legacyDecorator.call(_thisContext, ...legacyMeta);

		const stage3Meta = this.convertToStage3coratorMeta(value, context, meta, _thisContext)

		return stage3Meta;
	},
	apply(target, thisArg, args) {

		// to check if the applied funciton is calling as a decorator
		if (args.length == 2) {

			const [value, context] = args;

			const {kind, name} = context;
			
			if (kind && name) {

				const theTargetLegacyDecorator = target;

				return this.resolveDecorator(value, context, theTargetLegacyDecorator, thisArg);
			}
		}
		
        const result = target.call(thisArg, ...args);

        if (typeof result == 'function') {

            // when a funcion apply, 
            // if it return a funtion
            // the result will be the decorator
            return new Proxy(result, this);
        }
		else {

			return result;
		}
	},
	set() {

		return false;
	}
}

module.exports = {
    stage_0_To_Stage_3_Adapter,
}