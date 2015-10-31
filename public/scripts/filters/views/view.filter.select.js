define(['backbone','dust', 'text!templates/filters/select.dust'], function(Backbone, dust, selectTemplate){

	var ListView = Backbone.View.extend({
		initialize: function(options) {
			// ...
			var self = this;
			this.model.filterOptions.on('change', this.render, this);
		},
		events: {
			'change select' : 'updateFilter'
		},
		render: function() {
			var self = this;

			var filterOptions = [];

			// add a default value if none exists

			var defaultExists = false;

			this.model.filterOptions.each(function(filterOption){

				if (!filterOption.get('value')) {
					defaultExists = true;
				}

				if (filterOption.get('filterMatches').length > 0) {
					filterOptions.push(filterOption.toJSON());
				}
			});

			if (!defaultExists){
				filterOptions.unshift({
					label: 'Select a value'
				});
			}

			var data = {
				label: this.model.get('label'),
				options: filterOptions
			};

			dust.renderSource(selectTemplate, data, function(err, out){
				// setting self.$el.html() drops the event bindings
				self.$el.empty();
    			self.delegateEvents();
    			self.$el.append(out);  
			});

			return this;
		},
		updateFilter: function(event){

			var value = $(event.currentTarget).val(); 

			var activeOption = null;

			// get matches for the filterOption
			var filterMatches = [];
			this.model.filterOptions.each(function(filterOption){
				if (filterOption.get('value') == value){
					filterOption.set({active: true}, {silent:true});
					filterMatches = filterOption.get('filterMatches');
				} else {
					filterOption.set({active: false}, {silent:true});
				}
			});

			this.trigger('view:filter:changed');
		}
	});

	return ListView;
});