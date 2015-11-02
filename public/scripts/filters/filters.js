define(['backbone', 'underscore'], function(Backbone, _){

	var FilterUtility = function(options) {

		var self = this;
		var options = options || {};

		this.configuration = options.configuration || {};

		// the full collection, not one used for rendering a filtered list.
		this.collection = options.collection;

		// the collection of filter configurations, with their options
		this.filters = options.filters;

		this.filters.on('reset', function(){
			self._evaluateFilters();
		});

		this.collection.on('reset', function(){
			self._evaluateFilters();
		});

		this._evaluateFilters();
	};

	FilterUtility.prototype.getFilteredCollection = function() {

		var self = this;

		// the array of models to return as the filtered collection
		var models = this.collection.models;

		var filterMatchMap = {}; // matches by filter (not by filterOption)
		var hiddenMatches = [];

		// determine which items are hidden (attribute {hidden: true})
		if (this.configuration.hiddenFilter){
			hiddenMatches = this._getHiddenMatches();
		}

		// determine which filters are currently active
		this.filters.each(function(filter){
			if (filter.isActive()){
				var filterModelMatches = filter.getFilterMatches();

				// you can't remove the hidden ones at this point, we always need to filter down by selection first
				filterMatchMap[filter.get('id')] = filterModelMatches;
			}
		});

		// get the full array of identifiers matching all of the active filters (unique results)
		var matches = _.intersection.apply(this, _.values(filterMatchMap));

		// if there are any active filter matches, filter out anything that doesn't match
		if (matches.length) {
			// return those models that exist in matches
			models = this.collection.filter(function(model){
				return(_.indexOf(matches, model.get('id')) !== -1);
			});
		}

		// if there are any hidden matches, filter them out
		if (hiddenMatches.length){
			models = models.filter(function(model){
				return(_.indexOf(hiddenMatches, model.get('id')) === -1);
			});
		}

		// determine the new counts for the filterOptions; we need the current filtered set for this
		this.filters.each(function(filter){
			filter.filterOptions.each(function(filterOption){

				// this gets a bit funky
				var count = self._getFilterOptionCount(filterOption, filter, matches, hiddenMatches, filterMatchMap);

				// disable the option if it wasn't already selected and adds nothing.
				filterOption.set({
					count: count,
					disabled: (!filterOption.get('active') && (count === 0))
				});
			});
		});

		return models;
	};

	FilterUtility.prototype._getFilterOptionCount = function(filterOption, filter, currentMatches, hiddenMatches, matchesByFilter) {

		var count = 0;

		// just for convenience here
		var filterOptionMatches = filterOption.get('filterMatches');

		var filterId = filter.get('id');
		var filterActive = filter.isActive();


		if (currentMatches.length === 0) {
			count = _.difference(filterOptionMatches, hiddenMatches).length;
		}
		else if (filterOption.get('active') || !filterActive){
			count = _.difference(_.intersection(filterOptionMatches, currentMatches), hiddenMatches).length;
		} else {
			// something else in the filter "group" has been selected; this is the most complicated case, because now we need 
			// to simulate what would happen if this option was selected with the current active option(s) in our group.
			var peekMatchMap = _.clone(matchesByFilter); // don't mangle this is place, there are more options to check.
			var currentGroupMatch = peekMatchMap[filterId] || []; // what does our group currently match up to?

			// let's find the matches with our value added to the group
			peekMatchMap[filterId] = _.uniq(currentGroupMatch.concat(filterOptionMatches));
			
			// now determine what the full set would have looked like
			var matchesWithOption = _.intersection.apply(this, _.values(peekMatchMap));

			// what changes if we do that?
			var peekMatches = _.difference(_.difference(matchesWithOption, currentMatches), hiddenMatches);
			count = peekMatches.length;
		}

		return count;
	};

	/*
	 * _evaluateFilters
	 *	
	 * Sets the "matches" onto the filterOption models.
	 * This should only be called when the initial collections are reset.
	 */
	FilterUtility.prototype._evaluateFilters = function(){

		var self = this;

		// evaluate each filter option against the collection.
		this.filters.each(function(filter){
			filter.evaluateFilterOptions(self.collection);
		});
	};

	/*
	 * _getHiddenMatches
	 *
	 * This should only be called if the "hiddenFilter" configuration option is true.
	 */
	FilterUtility.prototype._getHiddenMatches = function() {
		return _.pluck(this.collection.where({hidden: true}), 'id');
	};

	return FilterUtility;
});