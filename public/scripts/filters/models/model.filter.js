define(['backbone', 'underscore'], function(Backbone, _){

	var FilterModel = Backbone.Model.extend({
		initialize: function(options) {

			// create a collection of filter options on the filter
			if (options.filterOptions) {
				// TODO: create models for specific filter types?
				this.filterOptions = new Backbone.Collection(options.filterOptions);
			}
			this.unset('filterOptions');
		},
		// establish the matches for the filter's options.
		// this is the ugly part, so let's keep these calls to a minimum
		evaluateFilterOptions: function(listItems) {

			var property = this.get('property');

			// TODO: can move evaluation out to individual filter types
			this.filterOptions.each(function(filterOption) {

				// reset for each filter option
				var filterMatches = [];

				listItems.each(function(item){

					var filterValue = filterOption.get('value');
					var itemValue = item.get(property);
					var operation = filterOption.get('operation');

					// if the item doesn't have the property at all...
					if (!itemValue){

						// add?
						//filterMatches.push(item.get('id'));

						// naw, do nothing for now, that seems more correct.

						// TODO:
						// if we DO allow this, we need to keep track of actual filterMatches and default filterMatches separately,
						// otherwise we won't know whether or not to exclude a filter completely

					} else {

						if (operation === 'equals'){
							if (filterValue === itemValue){
								filterMatches.push(item.get('id'));
							}
						} else if (operation === 'less'){
							if (itemValue < filterValue){
								filterMatches.push(item.get('id'));
							}
						} else if (operation === 'between'){

							// TODO: add configuration to make the upper and lower bounds inclusive/exclusive

							// defaulting to the most likely case for dollar amounts,
							// in which case the filter will likely be made completely of ranges.
							// making the low range inclusive
							
							// filter value must be an array
							// TODO: array type check and exception

							var lowVal = filterValue[0];
							var highVal = filterValue[1];
							if (itemValue >= lowVal && itemValue < highVal) {
								filterMatches.push(item.get('id'));
							}
						} else if (operation === 'greater'){
							if (itemValue > filterValue){
								filterMatches.push(item.get('id'));
							}
						}
					}

				});

				filterOption.set({filterMatches : filterMatches });
			});		
		},
		// get the filter matches for all active options
		getFilterMatches: function() {

			var filterMatches = [];
			var filterOptionMatches = [];

			var filterActive = false;

			this.filterOptions.forEach(function(filterOption){
				if (filterOption.get('active') === true && filterOption.has('value')){
					filterActive = true;
					filterOptionMatches = filterOptionMatches.concat(filterOption.get('filterMatches'));
				}
			});
	
			if (filterActive){
				filterMatches = _.uniq(filterOptionMatches);
			}

			return filterMatches;

		},
		isActive: function() {

			var active = false;

			this.filterOptions.forEach(function(filterOption){
				if (filterOption.get('active') === true && filterOption.has('value')){
					active = true;
				}
			});
	
			return active;
		},
		// do any of the options for this filter have filterMatches
		hasMatch: function() {
			var hasMatch = false;

			this.filterOptions.forEach(function(filterOption){
				if (filterOption.get('filterMatches').length > 0){
					hasMatch = true;
				}
			});

			return hasMatch;
		},
		// this requires resetting peek values, so, we might not want to take this route.
		// deactivate (or reset) filter options
		// options: silent (boolean) - for silently resetting model properties
		deactivate: function(options) {

			var silent = (options.silent === false) ? false : true;

			this.filterOptions.forEach(function(filterOption){
				filterOption.set({
					active: false
				},{
					silent: silent
				})
			});
		}
	});

	return FilterModel;

});