requirejs.config({
	baseUrl: 'scripts', // this is relative to the html calling it
	paths: {
		// we don't need any yet
		'backbone' : 'lib/backbone',
		'underscore' : 'lib/underscore',
		'jquery' : 'lib/jquery-2.1.4',
        'dust' : 'lib/dust-full',
        'templates' : '../templates',
        'text' : 'lib/text'
	},
	shim: {
        'backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'jquery'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'dust': {
            exports: 'dust'
        }
    }
});


requirejs(['backbone', 'list/list'], function(Backbone, list){
	list.init();
});