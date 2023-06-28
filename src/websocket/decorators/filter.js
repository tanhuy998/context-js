function setFilterForClass(...callback) {

}

function setFilterForMethod(...callback) {


}

module.exports = function filter(...callback) {

    if (callback.length == 0) {

        throw new Error('@ws.filter needs at least 1 argument');
    }

    return function(_value, context) {

        const {kind} = context;

        switch(kind) {

            case 'class':
                
                break;
            case 'method':
                break;
            default:
                break;
        }
    }
}