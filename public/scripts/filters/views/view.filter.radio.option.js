define(['backbone', 'dust', 'text!templates/filters/radio.option.dust'], function(Backbone, dust, radioOptionTemplate){

	var FilterCheckboxOptionView = Backbone.View.extend({
		initialize: function(options) {
			this.model.on('change', this.render, this);
			this.property = options.property;
		},
		events: {
			'click input' : 'updateFilter'
		},
		render: function() {
			var self = this;

			var disabled = this.model.get(disabled) || false;

			var disabled = this.model.get('disabled') || false;

			var data = {
				disabled: (this.model.get('disabled') || false),
				peekCount: this.model.get('peekCount'),
				active: this.model.get('active'),
				label: this.model.get('label'),
				value: this.model.get('value'),
				property: this.property
			};

			dust.renderSource(radioOptionTemplate, data, function(err, out){
				// setting self.$el.html() drops the event bindings
				self.$el.empty();
    			self.delegateEvents();
    			self.$el.append(out);  
			});

			return this;
		},
		updateFilter: function(event){
			this.trigger('view:filter:changed', event);
		}
	});

	return FilterCheckboxOptionView;
});