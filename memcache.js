var NodeCache = require( "node-cache" );
//cache is of format ['number index': 'Article']
var memcache = new NodeCache();

module.exports = memcache;