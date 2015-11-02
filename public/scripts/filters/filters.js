define(['backbone', 'underscore'], function(Backbone, _){

	var FiltersPlugin = function(options) {

		var self = this;
		var options = options || {};

		this.configuration = options.configuration || {};
		this.collection = options.collection;
		this.filters = options.filters;

		// THIS SHOULD NOT TRIGGER WITH FILTER SELECTION
		this.filters.on('change', function(){
			self.evaluateFilters();
		});

		// THIS IS THE MASTER LIST OF ITEMS, 
		// one you don't use for rendering
		this.collection.on('reset', function(){
			self.evaluateFilters();
		});

		this.evaluateFilters();
	};

	FiltersPlugin.prototype.getHiddenMatches = function() {
		return _.pluck(this.collection.where({hidden: true}), 'id');
	};

	FiltersPlugin.prototype.getFilteredCollection = function() {

		var self = this;

		// the array of models to return as the filtered collection
		var models = [];

		var filterMatchMap = {}; // matches by filter (not by filterOption)
		var hiddenMatches = [];

		// determine which items are hidden (attribute {hidden: true})
		if (this.configuration.hiddenFilter){
			hiddenMatches = this.getHiddenMatches();
		}

		// determine which filters are currently active
		this.filters.each(function(filter){
			if (filter.isActive()){
				var filterModelMatches = filter.getFilterMatches();
				filterMatchMap[filter.get('id')] = filterModelMatches;
			}
		});

		// get the full array of identifiers matching all of the active filters (unique results)
		var matches = _.intersection.apply(this, _.values(filterMatchMap));


		// BEGIN THOUGHT ****
		// TODO: WE CAN MAYBE REFACTOR THIS BLOCK, STARTING WITH THE FULL COLLECTION,
		// THEN FILTERING FOR FILTER MATCHES, THEN FILTERING FOR HIDDEN
		if (matches.length) {
			// return those models that exist in matches
			models = this.collection.filter(function(model){
				return(_.indexOf(matches, model.get('id')) !== -1);
			});

			// CULL THE HIDDEN VALUE
			if (hiddenMatches.length){
				models = models.filter(function(model){
					return(_.indexOf(hiddenMatches, model.get('id')) === -1);
				});
			}

		} else {

			models = this.collection.models;

			// CULL THE HIDDEN VALUE
			if (hiddenMatches.length){
				models = this.collection.filter(function(model){
					return(_.indexOf(hiddenMatches, model.get('id')) === -1);
				});
			}
		}
		// END THOUGHT ****

		// now we do the dreaded peek ahead shite
		this.filters.each(function(filter){
			filter.filterOptions.each(function(filterOption){


				// TODO: this is kind of crap, we still need peek values on selected items too, no? in case items are hidden?

				if (filterOption.get('active') !== true){
					// check if this filter should be disabled
					self.evaluateFilterOptionPeek(filter, filterOption, filterMatchMap, matches, hiddenMatches);
				} else {

					// in the full set of filtered plans, how many do I match?
					// TODO: do this for count processing in general
					var visibleMatches = _.difference(matches, hiddenMatches);
					var activePeekMatches = _.intersection(filterOption.get('filterMatches'), visibleMatches);

					filterOption.set({
						count: activePeekMatches.length
					});
				}
			});
		});

		return models;
	};


	// TODO: for peek, send the map without the option's filter
	FiltersPlugin.prototype.getMatchSetFromMap = function(filterMatchMap) {

		var filterMatches = _.values(filterMatchMap);
		var matches = _.intersection.apply(this, filterMatches);
		return matches;
	};

	FiltersPlugin.prototype.evaluateFilters = function(){

		var self = this;

		// evaluate each filter option against the collection.
		this.filters.each(function(filter){
			filter.evaluateFilterOptions(self.collection);
		});
	};

	FiltersPlugin.prototype.evaluateFilterOptionPeek = function(filter, filterOption, filterMatchMap, matches, hiddenMatches){

		var disabled = true;
		var count = 0;
		var peekMatches = [];

		if (matches.length){

			if (!filter.isActive()){
				// if I am an inactive filter, then for each inactive option, find the number of matches for the option
				// WITHIN the current matches

				peekMatches = _.intersection(filterOption.get('filterMatches'), matches);
				peekMatches = _.difference(peekMatches, hiddenMatches);
				count = peekMatches.length;
				disabled = count === 0;

			} else {

				// evaluate the inactive options for the active filter

				// when a filter is active, then find out how many more items we would see if it was picked
				// weird in CHECKBOX groups, we go from being restrictive to additive

				var filterMatches = _.clone(filterMatchMap);
				var currentMatch = filterMatches[filter.get('id')] || [];

				// let's find the matches with our value added to the GROUP
				filterMatches[filter.get('id')] = _.uniq(currentMatch.concat(filterOption.get('filterMatches')));
				var matchesWithOption = this.getMatchSetFromMap(filterMatches);

				peekMatches = _.difference(matchesWithOption, matches);
				peekMatches = _.difference(peekMatches, hiddenMatches);
				count = peekMatches.length;
				disabled = (count === 0);
			}

		} else {

			peekMatches = _.difference(filterOption.get('filterMatches'), hiddenMatches);
			count = peekMatches.length;
			disabled = (count === 0);
		}


		filterOption.set({
			count: count,
			disabled: disabled
		});
	};

	return FiltersPlugin;
});