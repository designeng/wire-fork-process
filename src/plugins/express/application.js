import _ from 'underscore';
import express from 'express';

const noop = () => {}

const notFound = (response) => response.status(404).end('404');

export default function ExpressAppPlugin(options) {

    let appName;

    function router(resolver, facet, wire) {
        let { target } = facet;
        wire(facet.options).then(({
            healthCheckRoute,
            wildcard
        }) => {
            target.get(healthCheckRoute, (request, response, next) => {
                response.status(200).end('green');
            });

            target.get(wildcard, (request, response, next) => notFound(response));
            target.post(wildcard, (request, response, next) => notFound(response));
            target.put(wildcard, (request, response, next) => notFound(response));
            target.delete(wildcard, (request, response, next) => notFound(response));

            resolver.resolve(target);
        });
    }

    function startExpressServer(resolver, facet, wire) {
        const { port } = facet.options;
        let { target } = facet;

        if (!port)
            throw new Error('[ExpressAppPlugin] Set port option.');

        const server = target.listen(port, () => {
            const host = server.address().address;
            const port = server.address().port;
            console.info(`==> 🌎  Express app ${appName} listening at http://%s:%s`, host, port);
            resolver.resolve(target);
        });
    }

    function expressApplication(resolver, compDef, wire) {
        if (!compDef.options)
            throw new Error('[ExpressAppPlugin] Set app as true object.');

        wire(compDef.options).then(({ name }) => {
            appName = name;
            const app = express();
            resolver.resolve(app);
        });
    }

    return {
        factories: {
            expressApplication
        },
        facets: {
            router: {
                'ready:before': router
            },
            server: {
                ready: startExpressServer
            }
        },
        context: {
            shutdown: (resolver, wire) => {
                console.log(`Clean up ${appName} before exit`);
                resolver.resolve();
            },
            error: (resolver, wire, err) => {
                console.log(`Clean up ${appName} before exit with error ${err}`);
                resolver.reject();
            }
        }
    }
}
