define(['backbone', 'filters/views/view.filter.checkbox.option', 'dust', 'text!templates/filters/checkbox.dust'], function(Backbone, FilterCheckboxOptionView, dust, checkboxTemplate){

	var CheckboxView = Backbone.View.extend({
		initialize: function(options) {

			var self = this;
			this.subViews = [];

			this.model.filterOptions.each(function(filterOption){

				if (filterOption.get('filterMatches').length){

					var filterOptionView = new FilterCheckboxOptionView({
						model: filterOption
					});

					filterOptionView.on('view:filter:changed', function(){
						self.trigger('view:filter:changed');
					});

					self.subViews.push(filterOptionView);
				}
			});

		},
		render: function() {

			var self = this;

			var data = {
				label: this.model.get('label')
			};

			dust.renderSource(checkboxTemplate, data, function(err, out){
				self.$el.html(out);
			});

			this.subViews.forEach(function(view){
				self.$el.append(view.render().el);
			});

			return this;
		}
	});

	return CheckboxView;
});