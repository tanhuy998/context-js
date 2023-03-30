class Type {

    static get NUMBER() {

        return 5;
    }

    static get STRING() {

        return 2;
    }

    static get ARRAY() {

        return 3;
    }

    static get RAW_OBJECT() {

        return 4;
    }

    static get UN_IDENTIFIED() {

        return 'un_identified';
    }  

    static get UNIT() {

        return 6;
    }
}

function reflectParameterType(_rawValue) {

    const result = {
        defaultValue: undefined, // default value is just the string reflected from the object
        type: undefined 
    }

    // regex detect the type of parameter's default value
    const regex = /^((\'|\")|(\[)|(\{)|(\d+)|(\w+))/;

    if (typeof _rawValue != 'string') {

        throw new Error('The reflected parameter has no default value');
    }

    const match = _rawValue.match(regex);

    if (match != null) {

        for (let i = 2; i < match.length; ++i) {

            if (match[i]) {

                result.type = i;

                break;
            }
        }
    }
    else {

        result.type = Type.UN_IDENTIFIED;
    }

    result.defaultValue = _rawValue;

    return result;
}

module.exports = {Type, reflectParameterType};