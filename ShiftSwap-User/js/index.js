

/*
*
* Application consists of 2 Core classes/singletons.
* - ShiftSwap is the core. Brings everything together into 1 coherent application.
* - ShiftSwapUI manages and controls HTML/UI
*
* -- General Flow --
* 0. Initialize UI and other APIs
* 1. Login to facebook
* 2. Login to firebase with facebook auth token
* 3. Retrieve Shift JSON string data from firebase, parse into JSON objects, store in variable (an array).
* 4. Sort and apply filters to Shift objects and display filtered data to user.
*
* See project docs for more specific explanation
*/

/*
	
	REQUIREMENTS
	Requires JQUERY
	Requires JQUERY-UI and any other JQUERY-UI dependencies
	Requires fbsdk.js
	Requires firebase.js and any other firebase dependencies
	Requires shiftswap-filter.js
	Requires dropdown.js
	Requires dropdown.css
	Requires fontawsome and fontawsome dependencies

	ASSUMPTIONS
	Element with id = 'js-filter-container'
	Element with id = 'js-main-container'
	Element with id = 'js-login-container'
	Element with id = 'js-login-message'
	Element with id = 'js-login-button'
	Element with id = 'js-stats'
	Element with id = 'js-shift-container'
	Element with id = 'js-startdate-picker' and class = "datepicker"
	Element with id = 'js-enddate-picker' and class = "datepicker"

	window.onload at the bottom of the file
*/



/**
*	Core singleton class of that drives and runs the Shift Swap application through callbacks and by exposing various functions.
*	@classexplanation
*/
var ShiftSwap = new function()
{
	var self = this;
	var shifts;
	var filteredShifts;

	
	/**
	*	Initializes the nececary APIs and systems needed for Shift Swap to function. 
	*	@function
	*/
	this.GeneralSetup  = function()
	{
		FacebookSDK.InitFacebook(FacebookInitialized);
		FirebaseSDK.InitFirebase();
		ShiftSwapUI.InitializeUI();
		DropdownControl.SetupDropdown();

		ShiftSwapUI.SetLoginTexts("Initializing Facebook. Please stand by", "Wait", true);
		function FacebookInitialized()
		{
			ShiftSwapUI.SetLoginTexts("Login to continue", "Login", false, true);
		}
	}
	
	/**
	*	Attempts to login into Facebook and then into Firebase.
	*	The Facebook and Firebase APIs must be initialized for this to work.
	*	Sets the appropriate UI depending on the success or failure of the operation.
	*
	*	@function
	*/
	this.Login = function()
	{
		ShiftSwapUI.SetLoginTexts("Attempting to login to Facebook. Please stand by.", "Wait", true);
		FacebookSDK.Login(FacebookSuccess, FacebookFailure);

		function FacebookSuccess(loginResponse)
		{
			ShiftSwapUI.SetLoginTexts("Successfully logged into facebook. Logging into Firebase. Please stand by", "Wait", true);
			FirebaseSDK.Login(loginResponse.authResponse.accessToken, FirebaseSuccess, FirebaseFailure);
		}
		function FacebookFailure()
		{ ShiftSwapUI.SetLoginTexts("Failed to login to Facebook. Try again or relode the page.", "Try Again", false) }

		function FirebaseSuccess()
		{ ShiftSwapUI.loginContainer.hide(); ShiftSwapUI.shiftContainer.show(); LoadShiftData() }

		function FirebaseFailure()
		{ ShiftSwapUI.SetLoginTexts("Failed to login to Firebase. Contact administrator or try again", "Try Again", false) }
	}
	
	
	/**
	*	Displays demo/example shift data. 
	*	
	*	This should not require a login so long as the login options are set to open in the firebase
	*	app settings for the loaded firebase app (Options set at the firebase website)
	*
	*	Firebase must be initialized for this to work. Facebook does not have to be initialized.
	*	@function
	*/
	this.ViewDemo = function()
	{
		LoadShiftData(true);
		ShiftSwapUI.SetLoginTexts("Viewing demo shifts. Login to view real shifts");
	}


	/**
	*	Loads the shift data from the firebase database and stores the results in the array shifts[]
	* 	Firebase must be initialized and logged in for this to work.
	*
	*	@function
	*	@param {bool=} loadDemoData - Optional. Loads the demonstration data if set to true. 
	*/
	function LoadShiftData(loadDemoData)
	{
		var regularStorageName = 'shifts.json';
		var demoStorageName = 'shifts_demo.json';
		
		var storageRef;
		var storageTask;
		if(loadDemoData && loadDemoData === true)
		{
			storageRef = firebase.storage().ref(demoStorageName);
		}
		else
		{
			storageRef = firebase.storage().ref(regularStorageName);
		}
		storageTask = storageRef.getDownloadURL();
		storageTask.then(OnURLSuccess, OnURLFailure);

		function OnURLSuccess(dataURL)
		{
			var requestSettings = 
				{
					url: dataURL,
					typle: 'GET',
					success: OnAjaxSucces,
					error: OnAjaxFailure,
				}
			$.ajax(requestSettings);
		}
		function OnURLFailure()
		{

		}

		function OnAjaxSucces(response)
		{
			shifts = JSON.parse(response);
			ReDateShifts();
			self.UpdateShifts();
		}
		function OnAjaxFailure(error, statusText, errorThrown)
		{
		}
	}


	/**
	*	Applys sorting and filters to the loaded shifts and then displays the filtered and sorted
	*	results to the user.
	*	Sorting and filters are applied with the ShiftSwapFilter class to shifts[] and the results are stored in
	*	filteredShifts[]
	*
	*	@function
	*/	
	this.UpdateShifts = function()
	{
		if(!shifts || shifts.length == 0){ return }
		filteredShifts = ShiftSwapFilter.FilterSort(shifts);
		
		ShiftSwapUI.ClearShiftTabs();
		for(var i = 0; i < filteredShifts.length; i++)
		{
			ShiftSwapUI.CreateShiftTab(filteredShifts[i]);
		}
		
		DropdownControl.SetupDropdown();
		ShiftSwapUI.SetStatsText("Showing " + filteredShifts.length + " shifts");
	}
	
	
	/**
	*	Assigns a new date property to all shifts in the shifts[] array using the string initialy stored by their date property.
	*
	*	Shift data loaded in and then paresd with JSON.parse(...) into shift objects have their date properties 
	*	as strings instead of real date objects. This will replace the strings with real date objects
	*
	*	@function
	*/
	function ReDateShifts()
	{
		for(var i = 0; i < shifts.length; i++)
		{
			if(typeof shifts[i].date == 'string')
			{
				shifts[i].date = new Date(shifts[i].date);
			}
		}
	}

}


/**
*	Singleton controller class for all UI operations within the Shift Swap application.
* 	Dropdowns and date-pickers are managed by other classes.
*	@class
*/
var ShiftSwapUI = new function()
{
	this.mainContainer;
	this.loginContainer;
	this.shiftContainer;
	this.filterContainer;

	this.loginMessage;
	this.loginButton;
	this.stats;

	var self = this;
	
	/**
	*	Assigns  HTML elements to their corresponding class properties and initializes the jquery date-pickers
	*	@function
	*/
	this.InitializeUI = function()
	{
		$('#js-startdate-picker.datepicker').datepicker({onClose:ShiftSwapFilter.SetStartDate});
		$('#js-enddate-picker.datepicker').datepicker({onClose:ShiftSwapFilter.SetEndDate});
		this.mainContainer = $('#js-main-container');
		this.loginContainer = $('#js-login-container');
		this.shiftContainer = $('#js-shift-container');
		this.filterContainer = $('#js-filter-container');
		this.loginMessage = $('#js-login-message');
		this.loginButton = $('#js-login-button');
		this.stats = $('#js-stats');
	}
	
	/**
	*	Sets the text contents of of
	*	All parameters are optional.
	*
	*	@function
	*	@param {string=} messageText
	*	@param {string=} buttonText
	*	@param {bool=} disableLogin - disable(false) or enable(true) the loginButton
	*	@param {bool=} addFacebookIcon - If true, adds a fontawsome facebook icon inside the login button
	*/
	this.SetLoginTexts = function(messageText, buttonText, disableLogin, addFacebookIcon)
	{
		if(messageText){ this.loginMessage.text(messageText) }
		if(buttonText)
		{
			if(addFacebookIcon && addFacebookIcon == true)
			{
				this.loginButton.html(buttonText + ' <i class="fa fa-facebook-square"></i>');
			}
			else
			{
				this.loginButton.text(buttonText)
			}
		}

		if(disableLogin == true){ this.loginButton.prop("disabled", true) }
		else if(disableLogin == false){ this.loginButton.prop("disabled", false) }
	}
	
	/**
	*	Sets the text contents of the stats html element.
	*	@function
	*	@param {string} text
	*/
	this.SetStatsText = function(text)
	{
		this.stats.text(text);
	}
	
	/**
	*	Toggles the filterContainer on and off.
	*	@function
	*/
	this.ToggleFilters = function()
	{
		$(this.filterContainer).toggle();
	}

	/**
	*	Deletes all html elements inside the shiftContainer html element.
	*	@function
	*/
	this.ClearShiftTabs = function()
	{
		this.shiftContainer.empty();
	}

	/**
	*	Creates a complete shift html element (shift tab) and displays it.
	*	@function
	*	@param {Shift} shiftObject - a shift object without errors.
	*/
	this.CreateShiftTab = function(shiftObject)
	{
		var shiftTab = $("<div></div>");
		var shiftHeading = $("<div></div>");
		var shiftBody = $("<div></div>");

		var exchange = $("<span></span>");
		var date = $("<span></span>");
		var time = $("<span></span>");
		var link = $("<a></a>");
		var message = $("<p></p>");

		var dateString = shiftObject.month + '/' + shiftObject.day + '/' + shiftObject.year;
		var startTimeString = shiftObject.startHour + ':' + shiftObject.startMinute + shiftObject.startTimePeriod;
		var endTimeString = shiftObject.endHour + ':' + shiftObject.endMinute + shiftObject.endTimePeriod;

		var additionalLinkClasses = 'btn btn-light-blue btn-small';

		exchange.text(shiftObject.exchange);
		date.text(dateString);
		time.text(startTimeString + ' - ' + endTimeString);
		link.text("Original Post");
		link.attr('href', shiftObject.postLink);
		message.text(shiftObject.extra);

		shiftTab.addClass('shift dropdown');
		shiftHeading.addClass('shift-heading dropdown-toggle');
		shiftBody.addClass('shift-body dropdown-contents');

		exchange.addClass('shift-inline-info shift-exchange');
		date.addClass('shift-inline-info shift-date');
		time.addClass('shift-inline-info shift-time');
		link.addClass('shift-link');
		link.addClass(additionalLinkClasses);
		message.addClass('shift-message');

		shiftTab.append(shiftHeading, [shiftBody] );
		shiftHeading.append(exchange, [date, time] );
		shiftBody.append(link, [message]);

		self.shiftContainer.append(shiftTab);
	}
}



window.onload = ShiftSwap.GeneralSetup;










