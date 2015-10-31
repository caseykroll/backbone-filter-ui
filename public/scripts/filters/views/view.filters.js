define(['backbone', 'filters/views/view.filter.checkbox', 'filters/views/view.filter.radio', 'filters/views/view.filter.select'], function(Backbone, CheckboxFilterView, RadioFilterView, SelectFilterView){

	var ListView = Backbone.View.extend({
		initialize: function(options) {
			// ...
			this.subviews = [];
			var self = this;

			this.createSubviews();
		},
		render: function() {
			var self = this;

			self.$el.html('');

			this.subviews.forEach(function(subview){
				self.$el.append(subview.render().el);
			});

			return this;
		},
		createSubviews: function() {

			var self = this;

			this.collection.each(function(filter){

				// if the filter has any matches, or if "ALWAYS VISIBLE", then add
				if (filter.hasMatch() || filter.get('alwaysVisible')){

					if (filter.get('type') === 'checkbox'){

						var checkboxFilterView = new CheckboxFilterView({
							model: filter
						});	

						checkboxFilterView.on('view:filter:changed', function(){
							self.trigger('view:filter:changed');
						});

						self.subviews.push(checkboxFilterView);

					} else if (filter.get('type') === 'radio'){

						var radioFilterView = new RadioFilterView({
							model: filter
						});

						radioFilterView.on('view:filter:changed', function(){
							self.trigger('view:filter:changed');
						});

						self.subviews.push(radioFilterView);

					} else if (filter.get('type') === 'select'){

						var selectFilterView = new SelectFilterView({
							model: filter
						});

						selectFilterView.on('view:filter:changed', function(){
							self.trigger('view:filter:changed');
						});

						self.subviews.push(selectFilterView);	

					}
				}			
			});

		}
	});

	return ListView;
});