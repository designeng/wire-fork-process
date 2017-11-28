import _ from 'lodash';
import {fork} from 'child_process';
import {APP_LAUNCH_SUCCESS, APP_LAUNCH_ERROR} from '../../config/constants';

export default function forkProcessPlugin() {
    let timeout = options && options.timeout || 10000;
    const openedProcesses = [];

    const closeOpenedProcesses = () => {
        console.log('closeOpenedProcesses...........');
        _.forEach(openedProcesses, (proc) => {
            proc.kill('SIGINT');
        });
    }

    const runProcess = (path, params) => {
        let p = fork(path, params);
        p.on('message', (message) => {
            if (message === APP_LAUNCH_ERROR)
                closeOpenedProcesses();
            }
        )
        openedProcesses.push(p);
        return p;
    }

    function forkProcess(resolver, compDef, wire) {
        wire(compDef.options).then(({
            args, params, wait/* process we should wait before resolve current process */
        }) => {
            if (_.isNil(args))
                throw new Error('[forkProcessPlugin] fork args should be defined');
            let {path} = args;/* ignore parameters, options here (TODO: check if options process.env play in forked process) */
            if (_.isNil(path) || !_.isString(path) || !path.length)
                throw new Error('[forkProcessPlugin] process path should be defined');

            if (wait) {/* wait for appropriate message */
                wait.on('message', (message) => {
                    if (message === APP_LAUNCH_SUCCESS) {
                        resolver.resolve(runProcess(path, params));
                    }
                });
                // TODO: reject after timeout of on appropriate message
            } else {
                resolver.resolve(runProcess(path));
            }
        });
    }

    return {
        factories: {
            forkProcess
        },
        context: {
            shutdown: (resolver, wire) => {
                closeOpenedProcesses();
                resolver.resolve();
            },
            error: (resolver, wire, err) => {
                closeOpenedProcesses();
                resolver.resolve();
            }
        }
    }
}
