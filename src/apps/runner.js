var argv = require('yargs').argv;
require('../../starter');

if (argv['main'] == 1) {
    require('./main.app');
}

if (argv['img'] == 1) {
    require('./img.app');
}
