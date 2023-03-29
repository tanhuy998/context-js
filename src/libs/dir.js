//const { dir } = require('node:console');
const fs = require('node:fs');
const path = require('node:path');


function resolveProjectRootDir(_dir) {

    let dirname;

    if (!_dir) {

        dirname = __dirname;
    }
    else {
        dirname = _dir;
    }
    
    const systemRoot = path.parse(__dirname).root;

    if (dirname == systemRoot) {

        throw new Error('cannot determine the application root directory');
    }

    const isPackage = (dirname.match(/node_modules/) != null);

    if (isPackage) {

        return dirname.split(/node_modules/)[0];
    }

    const files = fs.readdirSync(dirname);
    
    for (const file of files) {

        if (file == 'node_modules') {

            return dirname;
        }
    }

    return resolveProjectRootDir(path.dirname(dirname));
}

module.exports = resolveProjectRootDir;