'use strict';

const fs = require('fs');
const path = require('path');
const Hapi = require('hapi');
const bell = require('bell');
const env = require('../.env.bell');

const server = Hapi.server({
    port: 3000,
    host: 'localhost',
     tls : {
      key  : fs.readFileSync(path.join(__dirname, 'server.key')),
      cert : fs.readFileSync(path.join(__dirname, 'server.crt'))
            }
});


const init = async () => {
    await server.register([
        bell
    ]);
    server.auth.strategy('stripe', 'bell', {
        provider     : 'stripe',
        ttl          : 60 * 60 * 24,
        password     : env.key,
        clientId     : env.id,
        clientSecret : env.secret,
        scope        : ['read_write'],
        isHttpOnly   : true,
        isSecure     : true,
        forceHttps   : true
    });
    server.route([{
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            return 'Hello, world!';
        }
    },
    {
        method : 'GET',
        path   : '/connect-artist',
        config : {
            auth : {
                strategy : 'stripe',
                mode     : 'required'
            }
        },
        handler(request, h) {
            console.log('[request]');
            return h.redirect('/');
        }
    }]);
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
