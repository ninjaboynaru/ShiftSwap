

/**
*	Singleton class that handles initialization of the facebook api.
*	@class
*/
var FacebookSDK = new function()
{
	var facebookInitialized = false;

	/**
	*	Initialize the facebook API.
	*
	*	@function
	*	@param {function} onFinish - Function to call when initialization is finished, with a response object as the parameter.
	*/
	this.InitFacebook = function(onFinish)
	{
		window.fbAsyncInit = FacebookOnInit;
		function FacebookOnInit()
		{
			FB.init({
				appId            : '326869874398994',
				autoLogAppEvents : true,
				xfbml            : true,
				version          : 'v2.9'
			});

			facebookInitialized = true;
			if(onFinish){ onFinish() }
		}


		(function(){
			var id = "facebook-jssdk";
			var sdkSrc = "http://connect.facebook.net/en_US/sdk.js";
			var sdkDebugSrc = "http://connect.facebook.net/en_US/sdk/debug.js";
			var js, fjs = document.getElementsByTagName("script")[0];

			if (document.getElementById(id)) {return}
			js = document.createElement("script"); 

			js.id = id;
			js.src = sdkSrc;
			fjs.parentNode.insertBefore(js, fjs);
		}() );
	}


	/**
	*	Login into facebook. InitFacebook(...) must be called first and succeed for this to work.
	*
	*	@function
	*	@param {function} onSuccess - Function to call when logging in succeeds, with a response object as the parameter.
	*	@param {function} onFail - Function to call when logging in fails, with a response object as the parameter.
	*	@param {string} permissions - Permissions to request from facebook for the users profile.
	*	@see {@link https://developers.facebook.com/docs/facebook-login/permissions/}
	*/
	this.Login = function(onSuccess, onFail, permissions)
	{
		if(facebookInitialized == false) { console.error("Attempting to login to Facebook before Facebook API has been initialized!") }
		if(permissions == undefined){ permissions = "" }

		FB.login(LoginCallback, {scope:permissions} );
		function LoginCallback(loginResponse)
		{
			if(loginResponse.status == "connected"){ onSuccess(loginResponse) }
			else { onFail(loginResponse) }
		}
	}

}









