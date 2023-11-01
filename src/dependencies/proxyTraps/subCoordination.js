const sub_coordinator = require('../coordinator/subCoordinator');

module.exports = {
    get: function (target, prop) {
        
        const theProp = target[prop];

        if (theProp !== null && theProp !== undefined) {

            return theProp;
        }

        return sub_coordinator(target, prop);
    }
}