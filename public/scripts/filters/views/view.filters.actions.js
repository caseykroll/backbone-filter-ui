define(['backbone',  'dust', 'text!templates/filters/filters.actions.dust'], function(Backbone, dust, filtersTemplate){

	var ListView = Backbone.View.extend({
		initialize: function(options) {
			this.filters = options.filters;
		},
		events: {
			'click ._clear' : 'clearFilters'
		},
		_checkFiltersActive: function() {
			var filtersActive = false;

			// do the easy part first
			var hiddenItem = this.collection.findWhere({hidden: true});

			if (!hiddenItem) {
				// TODO: this can be way more efficient
				this.filters.each(function(filter){
					if (filter.isActive()){
						filtersActive = true;
					}
				});
			} else {
				filtersActive = true;
			}

			return filtersActive;
		},
		clearFilters: function() {			
			this.trigger('view:filters:clear');
		},
		render: function() {

			var self = this;

			if (this._checkFiltersActive()){
				dust.renderSource(filtersTemplate, {}, function(err, out){
					self.$el.html(out);
				});
			} else {
				this.$el.html('');
			}

			return this;
		}
	});

	return ListView;
});