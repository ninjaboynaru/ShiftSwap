
/*
	Requires <script src="https://www.gstatic.com/firebasejs/4.0.0/firebase.js"></script>
*/



/**
*	Singleton class that handles initialization of the firebase api.
*	@class
*/
var FirebaseSDK = new function()
{
	firebaseInitialized = false;

	/**
	*	Initialize the firebase API.
	*	@function
	*/
	this.InitFirebase = function()
	{
		var config = {
			apiKey: "AIzaSyBNpbR0qsIVaaKKaAo3XLweELmjNe4pPT4",
			authDomain: "shift-swap-887bd.firebaseapp.com",
			databaseURL: "https://shift-swap-887bd.firebaseio.com",
			projectId: "shift-swap-887bd",
			storageBucket: "shift-swap-887bd.appspot.com",
			messagingSenderId: "1028521531548"
		};

		firebase.initializeApp(config);
		firebase.auth().signOut();
		firebaseInitialized = true;
	}


	/**
	*	Login into firebase. InitFirebase() must be called first and succeed for this to work.
	*
	*	@function
	*	@param {string} fbAccessToken - Access token gotton from a succesfull FB login attempt.
	*	@param {function} onSuccess - Function to call when logging in succeeds, with a response object as the parameter.
	*	@param {function} onFail - Function to call when logging in fails, with a response object as the parameter.
	*/
	this.Login = function(fbAccessToken, onSuccess, onFail)
	{
		if(firebaseInitialized == false){ console.error("Attempting to login to Firebase before Firebase has been initialized!") }

		var credential = firebase.auth.FacebookAuthProvider.credential(fbAccessToken);
		var signInTask = firebase.auth().signInWithCredential(credential);

		signInTask.then(onSuccess, onFail);
	}
	
}