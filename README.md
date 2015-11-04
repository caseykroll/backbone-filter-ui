# backbone-filter-ui
PoC for filtering backbone collections, with a sample app using requirejs, bootstrap, dustjs, maybe a few other things.

Overview:

We're looking for something akin to what most consumers are used to seeing on large retailer sites, where items have multiple properties (e.g. cost, size, department, etc.),
and filters, usually in a sidebar, are available on each of these properties to allow the items to be narrowed down quickly.

There will be two major pieces in this:

1. the filter script, which is the primary focus of this code, and which is responsible for:
	- evaluating the item collection against a separate collection of filters
	- updating the filter "matches" within the filter models, based on the result of the evaluation and the current state of the list
	- returning a filtered version of the item collection based on the result of the evaluation.
	- reacting to events on both the item and filter collections, re-evaluating the filter results

2. the UI, which is really just useful for testing and demonstrating the filter script, and which is responsible for:
	- requesting a filtered collection of items from the filter script
	- updating the item list once the filter script has produced a filtered version of the list
	- reacting to the updating of filter "matches" in order to re-render filters with updated information

What does the data look like?

- The list collection can be any Backbone.Collection, so long as each Backbone.Model in the collection has a unique 'id' attribute.
	- Optionally, if you wish to use a feature for showing and hiding list items, you just need to make use of a 'hidden' attribute on the item.


Configured Filters

- The filter collection needs to follow a particular format; for example:
```javascript
	var sizeFilter = new FilterModel({
		id: 'size_filter', 		// arbitrary id for the filter
		type: 'checkbox',  		// input type ('checkbox','radio', 'select')
		label: 'Size',			// the label to display for the filter as a whole
		evalType: 'data',		// how the evaluation will be done; 'data' compares the filter value to the item attribute
		property: 'size',		// the attribute name on the items that the filter will be comparing its option value to
		alwaysVisible: false,	// whether or not to display the filter even if there are no possible matches in the unfiltered list
		filterOptions: [{		// different values within the filter, each managed independently
			label : 'Small',		// the label to display for the indivual filterOption
			value : 'sm',			// the value that will be evaluated against the item attribute matching the filter property
			operation: 'equals'		// how the "match" will be evaluated; e.g. "equals" means the value matches excactly the item attribute value
		},{
			label : 'Medium',
			value : 'md',
			operation: 'equals'
		}{
			label : 'Large',
			value : 'lg',
			operation: 'equals'
		}]
	});
```

Once the evaluation is run, the filterOptions (which will be converted to Backbone.Models) will have additional attributes reflecting
	
```javascript
	matches: [] // an array of item ids which were found to match the filterOption
	active: boolean // default is false, true when the option is "checked"
	disabled: boolean // default is false, true when the selecting of other filter options excludes this option
	count: integer // an integer representing how many matches are still available for this option, given which other options are active
```

Hidden Filter

The hidden filter is different from the other filters, in that it doesn't have filter options, and doesn't rely on any kind of complicated matching.
For this reason, the processing of the hidden filter and the rendering of its UI is kept completely separate form the other filters.
It is completely optional of course, there is no need to include it; simply don't create the hidden view in your app.
Processing of hidden items can be turned on/off in the filtering script by setting the hiddenFilter boolean on the filter configuration object, on filter initialization.
For demo purposes it is defaulted to active for this demo.


How to run this:

Get Node
https://nodejs.org/en/download/

Navigate to the root of the project and run > 
npm install
node app.js

Point yourself at http://localhost:8080/filters.html

Outstanding issues:

- (feature) filterOption operations for less than, greater than (numeric values)
- (feature) filterOption operations for text matching (starts with, contains)
- (feature) allow filters with pre-defined matches
- (feature) defaults on init
- (feature) defaults on "clear"
- (feature) derive filterOptions based on set of initial collection values
