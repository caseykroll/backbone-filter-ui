define(['backbone', 'dust', 'text!templates/filters/checkbox.option.dust'], function(Backbone, dust, checkboxOptionTemplate){

	var FilterCheckboxOptionView = Backbone.View.extend({
		initialize: function(options) {
			this.model.on('change', this.render, this);
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
				label: this.model.get('label')
			};

			dust.renderSource(checkboxOptionTemplate, data, function(err, out){
				// setting self.$el.html() drops the event bindings
				self.$el.empty();
    			self.delegateEvents();
    			self.$el.append(out);  
			});

			return this;
		},
		updateFilter: function(event){
			var checked = event.currentTarget.checked;
			this.model.set({active : checked});
			this.trigger('view:filter:changed');
		}
	});

	return FilterCheckboxOptionView;
});