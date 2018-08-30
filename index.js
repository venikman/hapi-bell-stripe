'use strict';

const fs = require('fs');
const path = require('path');
const Hapi = require('hapi');
const querystring = require('querystring');
const env = require('../.env.bell');
const fetch = require('node-fetch');
const FormData = require('form-data');
// const stripe = require('stripe')(env.key);

const server = Hapi.server({
    port: 3000,
    host: 'localhost',
     tls : {
      key  : fs.readFileSync(path.join(__dirname, 'server.key')),
      cert : fs.readFileSync(path.join(__dirname, 'server.crt'))
            }
});


const init = async () => {
    // await server.register([
    //     bell
    // ]);
    // server.auth.strategy('stripe', 'bell', {
    //     provider     : 'stripe',
    //     ttl          : 60 * 60 * 24,
    //     password     : env.key,
    //     clientId     : env.id,
    //     clientSecret : env.secret,
    //     scope        : ['read_write'],
    //     isHttpOnly   : true,
    //     isSecure     : true,
    //     forceHttps   : true
    // });
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
        async handler(request, h) {
            if (request.query.code) {
                console.log('code', request.query.code);
                const form = new FormData();
                form.append('grant_type', 'authorization_code');
                // form.append('client_id', env.id);
                // form.append('client_secret', env.secret);
                form.append('code', request.query.code);
                try {
                    const post = await fetch(`https://connect.stripe.com/oauth/token?${querystring.stringify({ client_id: env.id, client_secret: env.secret})}`, {method: 'POST', body: form, headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }})
                    console.log('[post]', post);
                    return post;
                } catch(err) {
                    console.log('[err]', err);
                }
            }
            else {
                const parameters = {
                    client_id: env.id,
                    redirect_uri: 'https://localhost:3000/connect-artist'
                };
                console.log('[paramentrs]', querystring.stringify(parameters));
                return h.redirect('https://connect.stripe.com/express/oauth/authorize' + '?' + querystring.stringify(parameters));
            }
        }
    }]);
    await server.start();
    console.log('[env]', env);
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
