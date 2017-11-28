import createContext from './lib/createContext';
import forkProcessPlugin from './plugins/forkProcessPlugin';

createContext({
    $plugins: [forkProcessPlugin],

    imageApp: {
        forkProcess: {
            args: {
                path: path.resolve(`${__dirname}/apps/runner`),
                params: ['img', 1]
            }
        }
    },

    mainApp: {
        forkProcess: {
            wait: {
                $ref: 'imageApp'
            },
            args: {
                path: path.resolve(`${__dirname}/apps/runner`),
                params: ['main', 1]
            }
        }
    }
}).then(context => {}).otherwise(error => {
    console.error(error);
});
