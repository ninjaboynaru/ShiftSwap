



/**
*	Singleton class containing functionality to filter and sort an array of shift objects.
*
*	The ranges and types of filters/sorts is to be set before any filtering/sorting is done, using functions
*	like SetExchangeFilter(...) or SetTimeSort(...)
*	@class
*/
var ShiftSwapFilter = new function()
{
	var self = this;
	
	var exchangeTypes = ['any', 'give', 'trade', 'both'];
	var timeTypes = ['start', 'end'];
	
	var exchangeFilter = 'any';
	var dateFilter = { startDate: undefined, endDate: undefined }
	
	var dateSort = { sort: false, order: 0 }
	var timeSort = { sort:false, time: 'start', order: 0 }


	/**
	*	Resets the filtering and sorting ranges and types
	*	@function
	*/
	this.Reset = function()
	{
		self.ResetExchangeFilter();
		self.ResetDateFilter();
		self.ResetDateSort();
		self.ResetTimeSort();
	}
	this.ResetExhcnageFilter = function()
	{
		exchangeFilter = 'any';
	}
	this.ResetDateFilter = function()
	{
		dateFilter.startDate = undefined;
		dateFilter.endDate = undefined;
	}
	this.ResetDateSort = function()
	{
		dateSort.sort = false;
		dateSort.order = 0;
	}
	this.ResetTimeSort = function()
	{
		timeSort.sort = false;
		timeSort.time = 'start';
		timeSort.order = 0;
	}

	
	/**
	*	Set the exchange filter.
	*	Invalid arguments of the correct type will result in a default value being set.
	*
	*	@function
	*	@param {string} exchangeType - must be one of the following values ['any', 'give', 'trade', 'both']
	*/
	this.SetExchangeFilter = function(exchangeType)
	{
		if(typeof exchangeType == 'string')
		{
			if(exchangeTypes.indexOf(exchangeType.toLowerCase()) != -1 )
			{
				exchangeFilter = exchangeType.toLowerCase();
			}
			else{ exchangeFilter = exchangeTypes[0] }
		}
		else if(typeof exchangeType == 'number')
		{
			if(exchangeType < exchangeTypes.length && exchangeType >= 0)
			{
				exchangeFilter = exchangeTypes[exchangeType];
			}
			else{ exchangeFilter = exchangeTypes[0] }
		}
	}
	
	
	/**
	*	Sets the start date for filtering a range of dates
	*	Invalid parameters will result in no date filtering to occur until a valid parameter is passed.
	*
	*	@function
	*	@param {string} startDate - date string compatible with Date.parse()
	*/
	this.SetStartDate = function(startDate)
	{
		self.SetDateFilter(startDate);
	}
	
	
	/**
	*	Sets the end date for filtering a range of dates
	*	Invalid parameters will result in no date filtering to occur until a valid parameter is passed.
	*
	*	@function
	*	@param {string} endDate - date string recognizable by Date.parse()
	*/
	this.SetEndDate = function(endDate)
	{
		self.SetDateFilter(null, endDate);
	}
	
	
	/**
	*	Sets the start and end dates for filtering a range of dates.
	*	Both parameters are optional but both are needed for filtering a range of dates to occur.
	*	Invalid parameters will result in no date filtering to occur until a valid parameter is passed.
	*
	*	@function
	*	@param startDate {string=} - date string recognizable by Date.parse()
	*	@param endDate {string=} - date string recognizable by Date.parse()
	*/
	this.SetDateFilter = function(startDate, endDate)
	{
		if(startDate)
		{
			dateFilter.startDate = new Date(startDate);
			console.log(dateFilter.startDate);
			if(isNaN(dateFilter.startDate) ){ dateFilter.startDate = undefined }
		}
		if(endDate)
		{
			dateFilter.endDate = new Date(endDate);
			if(isNaN(dateFilter.endDate) ){ dateFilter.endDate = undefined }
		}
	}
	/**
	*	
	*	@function
	*/
	
	/**
	*	Set whether to sort the shift dates in ascending, descending order or no sorting at all.
	*
	*	@function
	*	@param {number} order - The sorting order. 0 is no sorting, -1 is latest to earliest, 1 is earliest to latest.
	*/
	this.SetDateSort = function(order)
	{
		order = Math.round(order);
		order = Math.sign(order);
		
		dateSort.order = order;
		if(order = 0){ dateSort.sort = false }
		else{ dateSort.sort = true }
	}
	
	
	/**
	*	Set whether to sort the start or end time of the shift in ascending or descending order or no order at all.
	*
	*	@function
	*	@param {string} timeType - The time to sort (startTime or endTime). Either 'start' or 'end'.
	*	@param {number} order - The sorting order. 0 is no sorting, -1 is latest to earliest, 1 is earliest to latest.
	*/
	this.SetTimeSort = function(timeType, order)
	{
		if(timeTypes.indexOf(timeType.toLowerCase() ) == -1 ){ return }
		
		timeType = timeType.toLowerCase();
		order = Math.round(order);
		order = Math.sign(order)

		if(order == 0){ self.ResetTimeSort() }
		else
		{
			timeSort.sort = true;
			timeSort.time = timeType;
			timeSort.order = order;
		}
	}

	
	/**
	*	Filters and sorts an array of shift objects based on the filter and sort properties set within this class.
	*	Various functions exist within this class to set the filter and sort properties.
	*
	*	If both time sorting and date sorting are set, then only time sorting will be applied.
	*
	*	@function
	*	@param {Shift[]} shiftArray - An array of complete shift objects
	*	@returns {Shift[]} A filtered and sorted array of shift objects
	*/
	this.FilterSort = function(shiftArray)
	{
		if(shiftArray.length == 0){ return [] }
		var processedShifts = shiftArray;

		processedShifts = FilterByDate(processedShifts);
		processedShifts = FilterByExchange(processedShifts);
		if(timeSort.sort == true)
		{
			processedShifts = SortByTime(processedShifts);
		}
		else if(dateSort.sort == true)
		{
			processedShifts = SortByDate(processedShifts);
		}

		return processedShifts;
	}


	function FilterByExchange(shiftArray)
	{
		if(exchangeFilter == 'any'){ return shiftArray }

		var filteredShifts = []
		for(var i = 0; i < shiftArray.length; i++)
		{
			var currentShift = shiftArray[i];
			if(currentShift.exchange == exchangeFilter)
			{
				filteredShifts.push(currentShift);
			}

		}
		return filteredShifts;	
	}
	function FilterByDate(shiftArray)
	{
		if(dateFilter.startDate == undefined || dateFilter.endDate == undefined){ return shiftArray }

		var filteredShifts = []
		for(var i = 0; i < shiftArray.length; i++)
		{
			var currentShift = shiftArray[i];
			if(currentShift.date && currentShift.date >= dateFilter.startDate && currentShift.date <= dateFilter.endDate)
			{
				filteredShifts.push(currentShift);
			}
		}
		return filteredShifts;	
	}


	function SortByTime(shiftArray)
	{
		var sortedShifts = shiftArray;
		if(timeSort.time == 'start'){ var targetProperty = 'startMilTime' }
		else if(timeSort.time == 'end'){ var targetProperty = 'endMilTime' }
		
		
		sortedShifts.sort(TimeSortingFunction);		
		
		function TimeSortingFunction(shift1, shift2)
		{
			if(targetProperty == undefined || timeSort.order == 0){ return 0 }
			if(timeSort.order == 1)
			{
				return shift1[targetProperty] - shift2[targetProperty];
			}
			else if(timeSort.order == -1)
			{
				return shift2[targetProperty] - shift1[targetProperty]; 
			}
		}
		
		return sortedShifts;
	}
	function SortByDate(shiftArray)
	{
		var sortedShifts = shiftArray;
		sortedShifts.sort(DateSortingFunction)
		
		function DateSortingFunction(shift1, shift2)
		{
			if(dateSort.order == 0){ return 0 }
			
			if(dateSort.order == 1)
			{
				return shift1.date - shift2.date;
			}
			else if(dateSort.order == -1)
			{
				return shift2.date - shift1.date;
			}
		}
		
		return sortedShifts;
	}


}



