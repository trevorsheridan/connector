/*
 * grunt-connector
 * https://github.com/trevorsheridan/connector
 *
 * Copyright (c) 2013 Trevor Sheridan
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var utility = require('../lib/utility');
  
  grunt.registerTask('connector', 'Prototyping server for the modern man.', function() {
    var express = require('express');
    var engines = require('consolidate');
    var server = express();
    
    var options = this.options({ port: process.env.PORT || 3000, base: process.cwd() + '/public', source: process.cwd() + '/source/views', templating: 'hogan' });
    
    // set the templating engine configuration
    server.engine('html', engines[options.templating]);
    server.set('views', options.source);
    server.set('view engine', 'html');
    
    // serve static assets from the public directory (falls back to this if development is on and recompiling less)
    server.use(express.static(options.base));
    
    // catch all other requests and route to the appropriate template
    server.use(function(request, response) {
      // get the directory listing for views, split the path into an array of components, index is the directory index.
      var template = utility.find(utility.listing(server.get('views')), request._parsedUrl.pathname.split('/'), 'index');
      var partials = { header: "a header", footer: "the footer" };
      
      response.status(template ? 200 : 404).render(template || '404', partials);
    });
    
    // server is setup, start listening!
    server.listen(options.port);
  });
};
