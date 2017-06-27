

/*
*
* This application retrieves posts from a FB group (a real one or a demo one), parses it in JSON 
* objects, and then uploads it to a Firebase cloud storage.
* 
* The core of this is done by(in order) Login(...), LoadShiftData(...), ProcessShiftData() and SendShiftData(...)
*
* 1. Login into facebook
* 2. Login into firebase using the auth token from facebook
* 3. Get feed from the FB group (real or demo)
* 4. Process(parse) response from FB
* 5. Send the processed data to Firebase cloud storage
*
*/




/*	
	REQUIREMENTS
	Requires JQUERY
	Requires fbsdk.js
	Requires firebase.js and any other firebase dependencies
	Requires shftdata_parser.js
	
	
	ASSUMPTIONS
	button with id = "js-btn-login"
	button with id = "js-btn-login"
	button with id = "js-btn-send-data"
	element with id = "js-output"
	
	window.onload at the bottom of the file
*/


 
/** 
*	Core singleton class that drives the Shift Swap Data application
*	@class
*/
var ShiftData = new function() {

	var processedShiftData;
	var demoDataLoaded = false;
	
	var loginButton = $('#js-btn-login');
	var getDataButton = $('#js-btn-data');
	var sendDataButton = $('#js-btn-data-send');
	var outputField = $('#js-output');
	var allButtons = $(loginButton).add(getDataButton).add(sendDataButton);
	
	var groupID = "273125759419125";
	var demoGroupID = "235222210316367";

	
	/**
	*	Logs a message to the console. Logs an object on the next line if specified.
	*
	*	@function
	*	@param {string} message - Message to log
	*	@param {object=} object - Optional object to log on the next line 
	*/
	function Log(message, object)
	{
		console.log(message);
		if(object)
		{
			console.log(object);
		}
	}
	
	
	/**
	*	Initializes the Facebook and Firebase SDKs and assigns values to the UI variables.
	*	@function
	*/
	this.GeneralSetup = function()
	{
		loginButton = $("#js-btn-login");
		getDataButton = $("#js-btn-data");
		sendDataButton = $("#js-btn-data-send");
		outputField = $("#js-output");
		allButtons = $(loginButton).add(getDataButton).add(sendDataButton);
		allButtons.hide();
		
		outputField.text("Initializing Facebook and Firebase. Please Wait");
		Log("Initializing Facebook and Firebase");
		
		FacebookSDK.InitFacebook(FacebookInitialized);
		FirebaseSDK.InitFirebase();
		function FacebookInitialized()
		{
			loginButton.show();
			outputField.text("Login to continue");
			Log("Successfully initialized Facebook and Firebase");
		}
	}
	

	/**
	*	Logs into Facebook, and then into Firebase. Both Facebook and Firebase must be initialized for this to work.
	*	@function
	*/
	this.Login = function()
	{
		outputField.text("Attempting to login to Facebook and Firebase. Please stand by");
		allButtons.hide();
		FacebookSDK.Login(FacebookSuccess, FacebookFailure, "user_managed_groups");
		
		
		function FacebookSuccess(loginResponse)
		{
			Log("Successfully logged into Facebook. Login response object below", loginResponse);
			Log("Attempting to login to Firbase");
			
			FirebaseSDK.Login(loginResponse.authResponse.accessToken, FirebaseSuccess, FirebaseFailure);
		}
		function FacebookFailure(loginResponse)
		{
			outputField.text("Failed to login to Facebook. Relode the page and try again.");
			Log("Failed to login to Facebook. Login response object below", loginResponse);
		}
		
		function FirebaseSuccess(loginResponse)
		{
			outputField.text("Successfully logged in to Facebook and Firebase");
			Log("Successfully logged into Firebase. Login response object below", loginResponse);
			
			getDataButton.show();
		}
		function FirebaseFailure(loginResponse)
		{
			outputField("Failed to login to Firebase. Contact the administrator or try again.");
			Log("Successfully logged into Firebase. Login response object below", loginResponse);
		}
	}	

	
	/**
	*	Requests posts from the FB group, then passes them to be parsed into shift objects.
	*
	*	@function
	*	@param {bool} loadDemoData - If true, loads posts from the demo FB group instead of the real one and sets the demoDataLoaded flag.
	*/
	this.LoadShiftData = function(loadDemoData)
	{
		var requestField = '/feed?fields=message,permalink_url,id&limit=100';
		
		if(loadDemoData && loadDemoData == true)
		{
			demoDataLoaded = true;
			outputField.text("Loading shift data from the demo Facebook group");
			Log("Loading shift data from the demo FB group. Group id: " + demoGroupID);
			FB.api(demoGroupID + requestField, ProcessShiftData);
		}
		else
		{
			demoDataLoaded = false;
			outputField.text("Loading shift data from the Facebook group");
			Log("Loading shift data from the FB group. Group id: " + groupID);
			FB.api(groupID + requestField, ProcessShiftData);
		}
	}
	
	
	/**
	*	Parses an array of FB posts into an array of Shift objects using ShiftDataParser.Parse(...) (shiftdata_parser.js)
	*	The results are stored in the class variable *processedShiftData*.
	*
	*	@function
	*	@param {postObject[]} - An array of postObjects returned from the FB api.
	*/
	function ProcessShiftData(shifts)
	{
		outputField.text("Parsing the shift data. Please stand by");
		
		if(shifts == undefined || shifts.error)
		{
			outputField.text("Error getting data from the facebook group. Relode page and try again or sign into a Facebook profile that is an admin of the Facebook group you are trying to access");
			
			if(shifts)
			{
				Log("Failed to get feed data from the Facebook group. Response object is below", shifts);
			}
			else
			{
				Log("Failed to get feed data from the Facebook group. No response object was returned");
			}
			return;
		}
		
		Log("Parsing the shift data. Unparsed data below", shifts);
		processedShiftData = ShiftDataParser.Parse(shifts);
		if(demoDataLoaded)
		{
			outputField.text("Shift data has been successfully loaded. Click the 'Send Data' button to finish");
		}
		else
		{
			outputField.text("Demo data has been successfully loaded. Click the 'Send Data' button to finish");
		}
		
		allButtons.hide();
		sendDataButton.show();
		Log("Shift data has been successfully loaded and parsed. Processed shift object below", processedShiftData);
	}
	
	
	/**
	*	Sends the shift data stored in the class variable *processedShiftData* to the Firebase storage.
	*	If the demoDataLoaded flag is set, then the data is sent to a demo file.
	*	@functions
	*/
	this.SendShiftData = function()
	{
		var regularStorageName = 'shifts.json';
		var demoStorageName = 'shifts_demo.json';
		
		var storageRef;
		var uploadTask;
		if(demoDataLoaded == true)
		{
			storageRef = firebase.storage().ref(demoStorageName);
		}
		else
		{
			storageRef = firebase.storage().ref(regularStorageName);
		}
		
		uploadTask = storageRef.putString(JSON.stringify(processedShiftData.validShifts, 1) );
		uploadTask.on('state_changed', UploadUpdate, UploadError, UploadComplete);
		
		if(demoDataLoaded)
		{
			outputField.text("Sending demo data, please stand by");
		}
		else
		{
			outputField.text("Sending data, please stand by");
		}
		
		
		function UploadUpdate(snapshot)
		{
			Log("Upload update. Snapshot object below", snapshot);
		}
		function UploadError(snapshot)
		{
			outputField.text("Failed to upload shift data to the server. Contact admin or try later");
			Log("Error uploading file. Error object below", snapshot);

		}
		function UploadComplete()
		{
			allButtons.hide();
			outputField.text("Successfully uploaded data to server. Thanks for using Shift Swap");
			Log("Finished uploading data");
		}
	}
	
	
	
	
}


window.onload = ShiftData.GeneralSetup;






