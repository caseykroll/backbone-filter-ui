define(['backbone', 'dust', 'text!templates/list/list.item.dust'], function(Backbone, dust, listItemTemplate){

	var ListItemView = Backbone.View.extend({
		events: {
			'click ._hide' : 'hideItem'
		},
		render: function() {
			var self = this;

			var data = {
				label: this.model.get('label'),
				color: this.model.get('color'),
				shape: this.model.get('shape'),
				size: this.model.get('size')
			};

			dust.renderSource(listItemTemplate, data, function(err, out){
				// setting self.$el.html() drops the event bindings
				self.$el.empty();
    			self.delegateEvents();
    			self.$el.append(out);  
			});

			return this;
		},
		hideItem: function() {
			this.model.set({hidden : true});
			this.trigger('view:filter:changed');
		}
	});

	return ListItemView;
});