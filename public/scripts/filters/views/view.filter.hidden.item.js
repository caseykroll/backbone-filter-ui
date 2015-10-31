define(['backbone', 'dust', 'text!templates/filters/hidden.item.dust'], function(Backbone, dust, hiddenItemTemplate){

	var FilterHiddenItemView = Backbone.View.extend({
		events: {
			'click ._show' : 'showItem'
		},
		render: function() {
			var self = this;

			var data = {
				label: this.model.get('label')
			};

			dust.renderSource(hiddenItemTemplate, data, function(err, out){
				// setting self.$el.html() drops the event bindings
				self.$el.empty();
    			self.delegateEvents();
    			self.$el.append(out);  
			});

			return this;
		},
		showItem: function() {
			this.model.set({hidden : false});
			this.trigger('view:filter:changed');
		}
	});

	return FilterHiddenItemView;
});