'use strict';

const fs = require('fs');
const path = require('path');
const Hapi = require('hapi');
const querystring = require('querystring');
const env = require('../.env.bell');
const requestMod = require('request');
const script = require('./script');

const server = Hapi.server({
    port: 3000,
    host: 'localhost',
     tls : {
      key  : fs.readFileSync(path.join(__dirname, 'server.key')),
      cert : fs.readFileSync(path.join(__dirname, 'server.crt'))
            }
});


const init = async () => {
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

                requestMod.post('https://connect.stripe.com/oauth/token', {
                    form: {
                        'grant_type' : 'authorization_code',
                        'client_id' : env.id,
                        'client_secret' : env.secret,
                        'code' : request.query.code
                    },
                    json: true
                  }, (err, response, body) => {
                    if (err || body.error) {
                      console.log('The Stripe onboarding process has not succeeded.');
                    } else {
                        console.log('[body]', body)
                    }
                  });
            }
            else {
                const parameters = {
                    client_id: env.id,
                    redirect_uri: 'https://localhost:3000/connect-artist'
                };
                return h.redirect('https://connect.stripe.com/express/oauth/authorize' + '?' + querystring.stringify(parameters));
            }
        }
    }]);
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
    script();
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
