define(['backbone', 'filters/filters','list/views/view.list', 'filters/views/view.filters', 'filters/views/view.filters.actions', 'filters/views/view.filter.hidden', 'filters/models/model.filter'], function(Backbone, Filters, ListView, FiltersView, FiltersActionsView, HiddenFilterView, FilterModel){

	var List = {
		init: function() {

			var self = this;

			// 1. get our data

			// load the collection data (full set of items)
			var ItemCollection = Backbone.Collection.extend({
				url: '/scripts/data/items.json',
				parse: function(data) {
					return data;
				}
			});

			// load the filter config data
			var FilterCollection = Backbone.Collection.extend({
				url: '/scripts/data/filters.json',
				model: FilterModel,
				parse: function(data) {
					return data;
				}
			});

			var filterCollection = new FilterCollection();
			var itemCollection = new ItemCollection();

			var filtersPromise = filterCollection.fetch();
			var itemsPromise = itemCollection.fetch();

			Promise.all([filtersPromise, itemsPromise]).then(function() {

				// 2. now that we have our data, start the app

				self.start(itemCollection, filterCollection);
			});		
		},
		start: function(itemCollection, filterCollection) {

			// 1. initialize the filters utility

			var filtersUtil = new Filters({
				collection: itemCollection, 
				filters: filterCollection,
				configuration: {
					hiddenFilter : true
				}
			});

			// 2. create the UI for running the filter utility

			// create a filteredCollection for views to bind to; only reset this
			var filteredCollection = new Backbone.Collection();

			// create the list view
			var listView = new ListView({
				el: $('._list'),
				collection: filteredCollection
			});

			// create the filters actions view (for clearing filters)
			var filtersActionsView = new FiltersActionsView({
				el: $('._filters-actions'),
				collection: itemCollection,
				filters: filterCollection
			});

			// create the filters view (filters from configuration)
			var filtersView = new FiltersView({
				el: $('._filters'),
				collection: filterCollection
			});

			// create the hidden filter view (optional)
			var hiddenFilterView = new HiddenFilterView({
				el: $('._filters-hidden'),
				collection: itemCollection
			});

			// bind views to filter events
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


			// TODO: is this needed, or can we bind within these views instead?
			// listen for hidden changes and do your magic
			itemCollection.on('change:hidden', function(){
				// this takes care if the hidden view completely
				hiddenFilterView.render();
				filtersActionsView.render();

				// trigger a reset of the filteredCollection
				filteredCollection.reset(filtersUtil.getFilteredCollection());
			});

			// the list view will re-render itself with this
			filteredCollection.reset(filtersUtil.getFilteredCollection());

			// render the filter views, subsequent renders will happen with filter manipulation
			filtersActionsView.render();
			filtersView.render();
			hiddenFilterView.render();
		}
	};

	return List;
});

