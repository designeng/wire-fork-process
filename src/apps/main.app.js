import sequence from 'when/sequence';
import args from '../decorators/args';
import createContext from '../lib/createContext';
import cleanup from '../lib/cleanup';
import applicationPlugin from '../plugins/express/application';
import {APP_LAUNCH_SUCCESS, APP_LAUNCH_ERROR} from '../config/constants';

const name = 'MAIN APP';

createContext({
    $plugins: [applicationPlugin],

    app: {
        expressApplication: {
            name
        },
        router: {
            healthCheckRoute: `/_/healthcheck`,
            wildcard: '*'
        },
        server: {
            port: process.env.PORT || 3000
        }
    }
}).then(context => {
    let { app } = context;
    const cleanup = () => sequence([context.destroy]);
    const stopApp = (code) => () => {
        console.log(`Stopping ${name}...`);
        return cleanup().then(() => process.exit(code));
    }

    if(process.send) process.send(APP_LAUNCH_SUCCESS);
    process.on('SIGINT', stopApp(0));
}).otherwise(error => {
    if(process.send) process.send(APP_LAUNCH_ERROR);
});
