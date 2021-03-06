var HAPI = require('hapi')
var HAPICo = require('hapi-plugin-co')
var candidates = require('./controllers/candidates');

var mongoose = require("mongoose");

// Connect to default promise library
mongoose.Promise = global.Promise;

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring = process.env.MONGODB_URI || 'mongodb://localhost/pipe-server';

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, {poolSize: 100}, function(err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
  }
});

var server = new HAPI.Server({
  debug: {
    request: ['error']
  }
})

server.connection({
  address: '0.0.0.0',
  port: process.env.PORT || 12345,
  routes: {
    cors: true
  }
})

server.register(HAPICo, function() {

  server.route({
    method: 'GET',
    path: '/foo',
    handler: candidates.foo
  })

  server.route({
    method: 'GET',
    path: '/sample-error',
    handler: candidates.sampleError
  })

  server.route({
    method: 'POST',
    path: '/candidates',
    handler: candidates.create,
    config: {
      validate: candidates.createValidator
    }
  })

  server.route({
    method: 'GET',
    path: '/candidates',
    handler: candidates.list
  })

  var result = server.start();
  result.then((err, data) => {
    console.log('Started');
  })
})