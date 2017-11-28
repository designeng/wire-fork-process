import when from 'when';
import express from 'express';

const noop = () => {}

export default function ExpressAppPlugin(options) {

    function startExpressServer(resolver, facet, wire) {
        const {port} = facet.options;
        let {target} = facet;

        if (!port)
            throw new Error('[ExpressAppPlugin] Set port option.');

        const server = target.listen(port, () => {
            const host = server.address().address;
            const port = server.address().port;
            console.info(`==> 🌎  Express app ${applicationName} listening at http://%s:%s`, host, port);
            resolver.resolve(target);
        });
    }

    function expressApplication(resolver, compDef, wire) {
        if (!compDef.options)
            throw new Error('[ExpressAppPlugin] Set app as true object.');

        wire(compDef.options).then(({cleanup}) => {
            if (!cleanup)
                cleanup = noop;
            const app = express();
            app.set('cleanup', cleanup);
            resolver.resolve(app);
        });
    }

    return {
        factories: {
            expressApplication
        },
        facets: {
            server: {
                ready: startExpressServer
            }
        }
    }
}
