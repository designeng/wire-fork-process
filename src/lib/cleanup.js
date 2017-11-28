import context from 'essential-wire/source/lib/context';
import when from 'when';

let Promise = when.Promise;

const cleanup = (name) => () => Promise((resolve, reject) => {
    setTimeout(() => {
        console.log(`Clean up ${name} before exit`);
        resolve();
    }, 300);
});

export default cleanup;
