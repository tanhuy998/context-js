

module.exports = function reflectFunction(_function) {

    const detecFunction = /^(async){0,1}(\s|\t)*(function){0,1}(\s|\t)*(\w(\w)*)*(\s|\t)*\((\s|\t)*(\w*((\s|\t)*\,(\s|\t)*\w+)*)(\s|\t)*\)/;
    //const type = 1, name = 3, params = 7;
    const type = 3, name = 5, params = 9;

    const func = _function.toString()
                .match(detecFunction);

    if (func == null) return undefined;

    const meta = {
        origin: func,
        isArrow: (!func[type]) ? true : false,
        isAsync: (func[1]) ? true : false,
        name: func[name],
        isAnnonymous: (!func[name] || func[name] == ''),
        params: func[params].split(/(\s|\t)*\,(\s|\t)*/).filter((value) => {

            return (value != ' ' && value != undefined && value != '');
        }),
    };

    return meta;
}


