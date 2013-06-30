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
    var application = express();
    
    var options = this.options({
      assets: '/public',
      port: process.env.PORT || 3000,
      templates: '/source/templates',
      templateEngine: 'hogan'
    });
    
    this.async();
    
    // Set the templating engine configuration.
    application.set('views', process.cwd() + '/' + options.templates);
    application.set('view engine', 'html');
    application.engine('html', engines[options.templateEngine]);
    
    // Serve static assets from the public directory (falls back to this if development is on and recompiling less).
    application.use(express.static(process.cwd() + '/' + options.assets));
    
    // Catch all other requests and route to the appropriate template.
    application.use(function(request, response) {
      var path = request._parsedUrl.pathname;
      var template = utility.find(utility.listing(application.get('views')), path.split('/'), 'index') || 404;
      
      grunt.log.ok("Responding to " + path + " with template " + template + "".green);
      response.status(typeof template === 'number' ? template : 200).render(template);
    });
    
    application.listen(options.port);
    grunt.log.ok("Server listening for incoming connections on port " + options.port + "".green);
  });
};
