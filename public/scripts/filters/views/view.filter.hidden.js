define(['backbone','underscore','dust', 'filters/views/view.filter.hidden.item', 'text!templates/filters/hidden.dust'], function(Backbone, _, dust, HiddenItemView, hiddenTemplate){

	var HiddenFilterView = Backbone.View.extend({
		initialize: function(options) {


		},
		events: {

		},
		render: function() {
			var self = this;

			var subviews = [];
			
			// TODO: use some underscore method to extract these
			this.collection.each(function(item){
				if (item.get('hidden')) {

					var hiddenItemView = new HiddenItemView({model: item});
					hiddenItemView.on('view:filter:changed', function(){
						self.trigger('view:filter:changed');
					});

					subviews.push(hiddenItemView);
				}
			});

			var data = {
				label: "Hidden",
				hasMatch: (subviews.length > 0)
			};

			dust.renderSource(hiddenTemplate, data, function(err, out){
				// setting self.$el.html() drops the event bindings
				self.$el.empty();
    			self.delegateEvents();
    			self.$el.append(out);  
			});

			subviews.forEach(function(view){
				self.$el.append(view.render().el);
			});

			return this;
		}
	});

	return HiddenFilterView;
});