var fs = require('fs');

var utility = module.exports = Object.create(Object.prototype, {
  
  find: {
    value: function(directory, location, index) {
      location = this.path(location);
      var component = location[0] || index;
      
      for (object in directory) {
        // matches a part (index) to a file (index.html) with or without the extension (index, index.html)
        if (object.match(new RegExp('^' + component + '(\\.\\w*)?$', 'i'))) {
          var file = directory[object];
          // an object denotes a directory structure, shift the step and try to find within that directory
          if (typeof file === 'object')
            return location.shift(), this.find(file, location, index);
            
          return file;
        }
      }
      
      return false;
    }
  },
  
  listing: {
    value: function(directory) {
      var files = Object.create(null);
      
      if (!directory.match(/\/$/))
        directory += '/';
      
      fs.readdirSync(directory).forEach(function(file, index, array) {
        var path = directory + file;
        Object.defineProperty(files, file, {
          value: fs.statSync(path).isDirectory() ? this.listing(path) : path,
          enumerable: true
        });
      }.bind(this));
      
      return files;
    }
  },
  
  path: {
    value: function(components, without) {
      without = Array.isArray(without) ? without : [without];
      var components = components.filter(function(component) {
        return !(component === '' || without.indexOf(component) >= 0);
      });
      
      return components;
    }
  }
  
});