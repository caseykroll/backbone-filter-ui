define(['backbone', 'filters/views/view.filter.radio.option', 'dust', 'text!templates/filters/radio.dust'], function(Backbone, FilterRadioOptionView, dust, radioTemplate){

	var ListView = Backbone.View.extend({
		initialize: function(options) {
			// ...
			var self = this;
			this.model.filterOptions.on('change', this.render, this);

			this.subViews = [];

			this.model.filterOptions.each(function(filterOption){

				var filterOptionView = new FilterRadioOptionView({
					model: filterOption,
					property: self.model.get('property')
				});

				filterOptionView.on('view:filter:changed', self.updateFilter, self);

				self.subViews.push(filterOptionView);
			});

		},
		events: {
			'click input' : 'updateFilter'
		},
		render: function() {
			var self = this;

			var data = {
				label: this.model.get('label')
			};

			dust.renderSource(radioTemplate, data, function(err, out){
				self.$el.html(out);
			});

			this.subViews.forEach(function(view){
				self.$el.append(view.render().el);
			});

			return this;
		},
		updateFilter: function(event){

			var value = $(event.currentTarget).val();

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


			// this.model.set({
			// 	active : true,
			// 	filterMatches: filterMatches //TODO: don't like this, should be able to interrigate the model later to see which is active?
			// });
			this.trigger('view:filter:changed');
		}
	});

	return ListView;
});