define(['backbone', 'underscore', 'list/views/view.list.item', 'dust', 'text!templates/list/list.dust'], function(Backbone, _, ListItemView, dust, listTemplate){

	var ListView = Backbone.View.extend({
		initialize: function(options) {
			// ...
			this.collection.on('reset', this.render, this);
		},
		render: function() {
			var self = this;

			var subviews = [];

			this.collection.each(function(item){
				subviews.push(new ListItemView({model: item}));
			});

			var result = dust.renderSource(listTemplate, {}, function(err, out){
				self.$el.html(out);
			});


			subviews.forEach(function(view){
				$('._list', self.el).append(view.render().el);
			});

			return this;
		}
	});

	return ListView;
});