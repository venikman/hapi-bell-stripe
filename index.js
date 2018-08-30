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
// const noBell = (options) => {
//     return async (request, h) {

//     }
// }
// const scheme = (server, options) => {
//     return { authenticate: noBell(options) }
// }

// server.auth.scheme('noBell', scheme);
// server.auth.strategy('defaultStripe', 'noBell', {
//     provider     : 'stripe',
//     ttl          : 60 * 60 * 24,
//     password     : config.sessionSecretKey,
//     clientId     : config.stripeClientId,
//     clientSecret : config.stripeSecretKey,
//     scope        : ['express'],
//     isHttpOnly   : true,
//     isSecure     : true,
//     forceHttps   : true
// });

const init = async () => {
    server.state('noBell', {
        ttl: null,
        isSecure: true,  // TODO: Try setting this to false, maybe certificate errors could cause problems?
        isHttpOnly: true,
        isSameSite: 'Lax',
        encoding: 'base64json',
        clearInvalid: false, // remove invalid cookies  // TODO: If we get things to work, then try setting this to true, to be in alignment with our actual app, see if it affects the outcome
        strictHeader: true // don't allow violations of RFC 6265
    });
    server.route([{
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            return 'Hello, world!';
        }
    },
    // {
    //     method: 'GET',
    //     path: '/logged',
    //     config : {
    //         auth        : {
    //             strategy : 'defaultStripe',
    //             mode     : 'required'
    //         }
    //     },
    //     handler: (request, h) => {

    //         return 'You are logged';
    //     }
    // },
    {
        method : 'GET',
        path   : '/connect-artist',
        async handler(request, h) {
            const nonce = 'some-csrf-token';

            if (request.query.code) {
                console.log('[request.state]', request.state);
                console.log('[cookies]', server.states.cookies);
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
                      console.error('The Stripe onboarding process has not succeeded.');
                    } else {
                        console.log('[body]', body);
                        // const credentials = {
                        //     token : body.access_token,
                        //     refreshToken : body.refresh_token,
                        //     expiresIn : body.expires_in
                        // }
                        // return h.authenticated({ credentials, artifacts: body });
                    }
                  });
                  // TODO: If we get things working, try uncommenting this, to be in alignment with real bell implementation
                  h.unstate('noBell');
                  return 'I succeeded'
            }
            const state = {
                nonce
            };

            h.state('noBell', state);
            const parameters = {
                client_id: env.id,
                redirect_uri: 'https://localhost:3000/connect-artist',
                state : nonce
            };

            return h.redirect('https://connect.stripe.com/express/oauth/authorize' + '?' + querystring.stringify(parameters));
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
