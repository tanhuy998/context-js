const {METADATA} = require('../../constants.js');

module.exports = function interceptor(...cb) {

    return function (_controller, context) {

        const {kind} = context;

        if (kind !== 'class') {

            throw new Error('@WS.interceptor just affect on class');
        }

        if (!_controller[METADATA]) {

            _controller[METADATA] = {
                interceptors: [...cb]
            };

            return;
        }

        if (!_controller[METADATA].interceptors) {

            _controller[METADATA].interceptors = [...cb];

            return;
        }

        _controller[METADATA].interceptors.push(...cb);

        return _controller;
    }
}