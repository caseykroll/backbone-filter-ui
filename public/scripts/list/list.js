define(['backbone', 'filters/filters','list/views/view.list', 'filters/views/view.filters', 'filters/views/view.filters.actions', 'filters/views/view.filter.hidden', 'filters/models/model.filter'], function(Backbone, Filters, ListView, FiltersView, FiltersActionsView, HiddenFilterView, FilterModel){

	var List = {
		startup: function() {

			var hiddenFilter = true;

			// load the collection data (always hold all models)
			var itemCollection = this.getTestCollection();

			// load the filter config data
			var filterCollection = this.getTestFilters();

			// create a filteredCollection for views to bind to; only reset this
			var filteredCollection = new Backbone.Collection();

			// TODO: temp crap here.. apply this like a real plugin later on
			var filtersUtil = new Filters({
				collection: itemCollection, 
				filters: filterCollection,
				configuration: {
					hiddenFilter : hiddenFilter
				}
			});

			// show the collection view; this doesn't really need to be in HERE necessarily,
			// but doing this now for ease
			// TODO: move the listView creation out to some other "list component".
			var listView = new ListView({
				el: $('._list'),
				collection: filteredCollection
			});

			// show the filters actions view
			var filtersActionsView = new FiltersActionsView({
				el: $('._filters-actions'),
				collection: itemCollection,
				filters: filterCollection
			});

			var hiddenFilterView = new HiddenFilterView({
				el: $('._filters-hidden'),
				collection: itemCollection
			});

			// show the filters view
			var filtersView = new FiltersView({
				el: $('._filters'),
				collection: filterCollection
			});

			filtersActionsView.on('view:filters:clear', function(){
				// 1. remove all active flags
				filterCollection.each(function(filter){
					filter.deactivate({silent: true});
				});

				// remove the hidden flags
				itemCollection.each(function(item){
					item.set({hidden: false}, {silent: true});
				});

				// 2. trigger to re-filter the plans
				filteredCollection.reset(filtersUtil.getFilteredCollection());

				// 3. re-render the views
				filtersView.render();
				filtersActionsView.render();

				// TODO: maybe do this on filteredCollection reset instead?
				// it would be nice to keep ALL of the hidden stuff separate, 
				// so that we could easily switch it off.
				hiddenFilterView.render();
			});

			filtersView.on('view:filter:changed', function(){
				filtersActionsView.render();
				filteredCollection.reset(filtersUtil.getFilteredCollection());
			});


			// listen for hidden changes and do your magic
			itemCollection.on('change:hidden', function(){
				// this takes care if the hidden view completely
				hiddenFilterView.render();
				filtersActionsView.render();

				// trigger a reset of the filteredCollection
				filteredCollection.reset(filtersUtil.getFilteredCollection());
			});


			// the lost view will re-render itself with this
			filteredCollection.reset(filtersUtil.getFilteredCollection());

			// render the filter-action and filter views
			filtersActionsView.render();
			filtersView.render();
			hiddenFilterView.render();
		},
		getTestCollection: function() {
			var testCollection = new Backbone.Collection();

			var listItem1 = new Backbone.Model({
				id: 1,
				label: 'Item #1',
				color: 'red',
				shape: 'square',
				size: 'small'
			});

			var listItem2 = new Backbone.Model({
				id: 2,
				label: 'Item #2',
				color: 'blue',
				shape: 'circle',
				size: 'medium'
			});

			var listItem3 = new Backbone.Model({
				id: 3,
				label: 'Item #3',
				color: 'red',
				shape: 'circle',
				size: 'large'
			});

			var listItem4 = new Backbone.Model({
				id: 4,
				label: 'Item #4',
				color: 'green',
				size: 'small'
			});

			var listItem5 = new Backbone.Model({
				id: 5,
				label: 'Item #5',
				color: 'orange',
				size: 'medium'
			});

			testCollection.add(listItem1);
			testCollection.add(listItem2);
			testCollection.add(listItem3);
			testCollection.add(listItem4);
			testCollection.add(listItem5);

			return testCollection;
		},
		getTestFilters: function() {

			var filterCollection = new Backbone.Collection();

			var colorFilterOptionCollection = [];
			colorFilterOptionCollection.push({
				label : 'Blue',
				value : 'blue',
				operation: 'equals'
			});
			colorFilterOptionCollection.push({
				label : 'Red',
				value : 'red',
				operation: 'equals'
			});
			colorFilterOptionCollection.push({
				label : 'Green',
				value : 'green',
				operation: 'equals'
			});
			colorFilterOptionCollection.push({
				label : 'Yellow',
				value : 'yellow',
				operation: 'equals'
			});

			var colorFilter = new FilterModel({
				id: 'color_filter',
				type: 'checkbox', // determines display type, can also help determine how "filterMacthes" are determined, because certain types will allow for multiple active values (e.g. checkbox).
				label: 'Color',
				evalType: 'data', // could be "data" ("filterMatches" determined by evaluating against the collection) or "config" ("filterMatches" pre-determined by configuration).
				property: 'color',
				alwaysVisible: false,
				filterOptions: colorFilterOptionCollection
			});

			var shapeFilterOptionCollection = [];
			shapeFilterOptionCollection.push({
				label : 'Circle',
				value : 'circle',
				operation: 'equals'
			});
			shapeFilterOptionCollection.push({
				label : 'Square',
				value : 'square',
				operation: 'equals'
			});

			var shapeFilter = new FilterModel({
				id: 'shape_filter',
				type: 'radio', // determines display type, can also help determine how "filterMacthes" are determined, because certain types will allow for multiple active values (e.g. checkbox).
				label: 'Shape',
				evalType: 'data', // could be "data" ("filterMatches" determined by evaluating against the collection) or "config" ("filterMatches" pre-determined by configuration).
				property: 'shape',
				alwaysVisible: false,
				filterOptions: shapeFilterOptionCollection,
			});

			var sizeFilterOptions = [];
			sizeFilterOptions.push({
				label : 'Large',
				value : 'large',
				operation: 'equals'
			});
			sizeFilterOptions.push({
				label : 'Medium',
				value : 'medium',
				operation: 'equals'
			});
			sizeFilterOptions.push({
				label : 'Small',
				value : 'small',
				operation: 'equals'
			});


			var sizeFilter = new FilterModel({
				id: 'size_filter',
				type: 'select',
				label: 'Size',
				evalType: 'data',
				property: 'size',
				alwaysVisible: false,
				filterOptions: sizeFilterOptions
			});

			filterCollection.add(colorFilter);
			filterCollection.add(shapeFilter);
			filterCollection.add(sizeFilter);

			return filterCollection;
		}
	};

	return List;
});

