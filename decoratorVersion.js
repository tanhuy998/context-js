const path = require('node:path');
const fs = require('node:fs');
const resolveProjectRootDir = require('./src/libs/dir.js');

module.exports = getBabelConfig();

function getBabelConfig() {

    const appRootPath = resolveProjectRootDir();
    //const appRootPath = process.cwd();
    
    const packageJson = require(path.join(appRootPath, './package.json'));

    if (packageJson && packageJson.babel) {

        const decoratorVesion = checkPlugin(packageJson);

        if (decoratorVesion) {

            return decoratorVesion;
        }
    }

    let babelRc

    try {

        babelRc = require(path.join(appRootPath, './.babelrc'));
    }
    catch (e) {

        babelRc = fs.readFileSync(path.join(appRootPath, './.babelrc'), {encoding: 'utf8'});

        babelRc = JSON.parse(babelRc);
    }
    

    if (!babelRc || !babelRc.plugins) {

        throw new Error('cannot get configuration for babel decorators');
    }

    const decoratorVersion = checkPlugin(babelRc);

    if (decoratorVersion) {

        return decoratorVersion;
    }
    
    throw new Error('cannot get configuration for babel decorators');
}

function checkPlugin(_configObj) {

    const { plugins } = _configObj;

    if (!plugins) {

        // throw new Error('There is no config for babel plugin decorator');

        return undefined;
    }

    for (const plugin of plugins) {

        if (plugin.constructor.name == 'Array') {

            const [ name, options ] = plugin;

            if (name == '@babel/plugin-proposal-decorators') {

                if (!options || !options.version || (options.version == 'legacy')) {

                    return 'legacy';
                }

                if (options.version == '2022-03' || options.version == '2023-01') {

                   return 'stage3';
                }
            }
        }
    }

    return undefined;
}