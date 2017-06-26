


/*
* Parsing occurs by taking the text of a FB post and creating a Shift object based on that text.
*
* The core of the parsing process is handled by the 2 functions Parse(...) and CreateShift(...)
* and then there are some helper functions.
*
* Parse process
* 1.Lex
* 2.Tokenize
* 3.Parse/Create Shift object
* 4.Error check
* 5.Return Shift object
*
*
* 1. Parsing occurs by first splitting the text of a post into distinct words and symbols known as lexemes.
* The splitting is done using a regular expression defined by the variable 'universalRegExp'
* -- EXAMPLE -- "Giving. 5/15/17 -- Hello" would be split into ["Giving", '5', '/', '15', '/', '17', "--", "Hello"]
*
*
* 2. Each lexeme is then turned into a Token. This means that each lexeme is given a meaning.
* -- EXAMPLE -- The lexeme 5 would be tokenized into {type:'number', value:4}
* -- EXAMPLE -- "Giving" would be tokenized into  {type:'exchange', value:"giving"}
* -- EXAMPLE -- "/" would be tokenized into {type:'dateDivider', value:"/"}
* -- EXAMPLE -- "Hello" would be tokenized into {type:'misc", value:"Hello"}
*
*
* 3. The array of tokens is the used to create a Shift object with the CreateShift(...) function. This is parsing.
* The function works by looking for date and time dividers ('/' and ':') and time periods ('pm' and 'am) and checking what is
* around them.
* -- EXAMPLE -- ':' should be preceded and followed by number tokens. The preceding number is an hour and the following number is a minute
* -- EXAMPLE -- 'pm' should be preceded by a number token. That number token is either a hour or minute.
*
* 4. The resulting Shift object is then checked for any missing properties or other errors and it's error flags are
* set accordingly.
*
* 5. The Shift object is returned from the CreateShift(...) function.

* [See project documentation for expected FB post syntax/structure]
*/



/**
*	Singleton class capable of parsing an array of Facebook Post objects into an array of Shift objects.
*	The Facebook Post objects must conform to a certain syntax. 
*	Such syntax should be defined within the documentation of this project.
*	@class
*/
var ShiftDataParser = new function()
{

	var exchangeLexes = ["give", "giving", "trade", "trading", "both"];
	var timePeriodLexes = ["pm", "am"];
	var timeDividerLexes = [':'];
	var dateDividerLexes = ['/'];
	var imgStopLexes = ['~~'];
	var dataStopLexes = ["--", "---",];
	var universalRegExp = new RegExp(/\/+|:+|-+|_+|~+|pm|am|[a-z]+|[0-9]+|\.+|,+/, 'gi');
	/* Explanation of universalRegExp can be found at https://regex101.com/r/lhTy6t/2 */
	
	
	/** @enum */
	var TokenTypes = {
		misc:'misc', 
		exchange:'exchange',
		number:'number',
		monthString:'monthString',
		timePeriod:'timeperiod',
		timeDivider:'timeDivider',
		dateDivider:'dateDivider',
		imgStop:'imgageStop',
		dataStop:"dataStop"
	}
	Object.freeze(TokenTypes);
	
	/** @constructor */
	function Token(tokenType, tokenValue)
	{
		this.type = tokenType;
		this.value = tokenValue;
	}
	
	/** @constructor */
	function Shift() {
		this.exchange = undefined;
		this.extra = '';

		this.month = undefined;
		this.day = undefined;
		this.year = undefined;
		this.date  = undefined;

		this.startHour = undefined;
		this.startMinute = undefined;

		this.endHour = undefined;
		this.endMinute = undefined;

		this.startMilTime = undefined;
		this.endMilTime = undefined;

		this.startTimePeriod = undefined;
		this.endTimePeriod = undefined;

		this.postLink = undefined;

		this.error = false;
		this.errorMessage = "";
	}


	/**
	*
	*	Parses a FB api response containing posts into an array of shift objects.
	*	Assumes that the message of each post conforms to a certain standard/syntax.
	*	
	*	@function
	*	@param {fb_response} shifts - A response from the FB api.
	*	@param {post[]} shifts.data - An array of posts with shift information.
	*/
	this.Parse = function(shifts)
	{
		shifts = shifts.data;
		var goodShifts = [];
		var errorShifts = [];

		for(var i = 0; i < shifts.length; i++)
		{
			if(shifts[i].message == undefined || shifts[i].message.length < 5){ continue }
			
			var lexemes = Lex(shifts[i].message);
			var tokens = Tokenize(lexemes);

			var newShift = CreateShift(tokens, shifts[i]);
			if(newShift.error == true){ errorShifts.push(newShift) }
			else{ goodShifts.push(newShift) }
		}

		return {validShifts: goodShifts, invalidShifts: errorShifts}
	}

	
	/**
	*	Breaks a string into an array substrings/lexes using the *universalRegExp* class variable
	*	@function
	*/
	function Lex(stringData)
	{
		return stringData.match(universalRegExp);
	}

	
	/**
	*	Generates an array of Token objects given an array of strings (lexemes)
	*	@function
	*	param {string[]} lexemes - An array of strings/lexemes to be turned into token objects
	*/
	function Tokenize(lexemes)
	{
		var tokens = [];

		function StringIsNumber(str)
		{
			if(isNaN(str) == false && str != false)
			{
				return true;		
			}
			return false
		}
		for(var i = 0; i < lexemes.length; i++)
		{
			var currentLexeme = lexemes[i].toLowerCase();
			if(exchangeLexes.indexOf(currentLexeme) != -1 )
			{
				tokens.push(new Token(TokenTypes.exchange, currentLexeme) );
				continue;
			}
			else if(timePeriodLexes.indexOf(currentLexeme) != -1 )
			{
				tokens.push(new Token(TokenTypes.timePeriod, currentLexeme) );
				continue;
			}
			else if(timeDividerLexes.indexOf(currentLexeme) != -1)
			{
				tokens.push(new Token(TokenTypes.timeDivider, currentLexeme) );
				continue;
			}
			else if(dateDividerLexes.indexOf(currentLexeme) != -1)
			{
				tokens.push(new Token(TokenTypes.dateDivider) );
				continue;
			}
			else if(StringIsNumber(currentLexeme) )
			{
				tokens.push(new Token(TokenTypes.number, Number(currentLexeme)) );
				continue;
			}
			else if(dataStopLexes.indexOf(currentLexeme) != -1)
			{
				tokens.push(new Token(TokenTypes.dataStop, currentLexeme) );		
			}
			else
			{
				tokens.push(new Token(TokenTypes.misc, currentLexeme) );
				continue;
			}
		}
		return tokens;
	}
	
	
	/**
	*	Checks for any missing/undefined properties in a shift object and sets the error properties of that shift object if
	*	any are found. The shift object is then returned.
	*
	*	@function
	*	@param {Shift} shiftObject - A filled/complete Shift object to be error checked
	*/
	function ErrorCheckShift(shiftObject)
	{
		for(var property in shiftObject)
		{
			if(property == "exchange" || property == "extra" || property == "error" || property == "errorMessage")
			{ continue }
			else if(shiftObject[property] == undefined )
			{
				shiftObject.error = true;
				shiftObject.errorMessage = "Undefined property: " + property;
				break;
			}
		}
		return shiftObject
	}

	
	/**
	*	Creates a Shift object given an array of tokens and the original FB post corresponding to that shift.
	*	If the Shift contains any errors, it is returned with only its error properties set.
	*
	*	@function
	*	@param {Token[]} tokens - An array of Token objects made from the original post
	*	@param {post} originalPost - A Facebook post object whose data was used to create the tokens parameter
	*/
	function CreateShift(tokens, originalPost)
	{
		var shift = new Shift();
		
		var dataStopReached = false;
		for(var i = 0; i < tokens.length; i++)
		{
			var currentToken = tokens[i];
			var nextToken = tokens[i+1];
			var previousToken = tokens[i-1];
			
			if(dataStopReached == true)
			{
				shift.extra += currentToken.value + ' ';
			}
			else if(currentToken.type == TokenTypes.dateDivider)
			{
				// i += 1 here and i++ in the loop result in i+=2 wich is the desired effect
				if(shift.month != undefined && shift.day != undefined && shift.year == undefined)
				{
					//Add the year to the date
					shift.year = nextToken.value;
					i += 1;
				}
				else if(shift.month == undefined && shift.day == undefined)
				{
					//Add month and day to the date
					shift.month = previousToken.value;
					shift.day = nextToken.value;
					i += 1;
				}
			}
			else if(currentToken.type == TokenTypes.timeDivider)
			{
				if(shift.startHour == undefined)
				{
					shift.startHour = previousToken.value;
					shift.startMinute = nextToken.value;
					i += 1;
				}
				else if(shift.endHour == undefined)
				{
					shift.endHour = previousToken.value;
					shift.endMinute = nextToken.value;
					i += 1;
				}
			}
			else if(currentToken.type == TokenTypes.timePeriod)
			{				
				if(shift.startTimePeriod == undefined)
				{
					if(shift.startHour == undefined)
					{
						shift.startHour = previousToken.value;
						shift.startMinute = 0;
					}
					shift.startTimePeriod = currentToken.value;
				}
				else if(shift.endTimePeriod == undefined)
				{
					if(shift.endHour == undefined)
					{
						shift.endHour = previousToken.value;
						shift.endMinute = 0;
					}
					shift.endTimePeriod = currentToken.value;
				}
			}
			else if(currentToken.type == TokenTypes.exchange)
			{
				if(shift.exchange == undefined){ shift.exchange = SimplifyExchange(currentToken.value) }
				else if(shift.exchange != SimplifyExchange(currentToken.value) && shift.exchange != 'both')
				{
					shift.exchange = 'both';
				}
			}
			else if(currentToken.type == TokenTypes.dataStop && dataStopReached == false)
			{
				dataStopReached = true;
			}
		}
		
		shift.postLink = originalPost.permalink_url;
		
		if(shift.date == undefined){ shift.date = new Date() }
		if(shift.year == undefined){ shift.year = shift.date.getFullYear() }
		shift.date = new Date(shift.year, shift.month, shift.day);
		
		var expandedMilTime = GetExpandedMilTime(shift);
		shift.startMilTime = expandedMilTime.startTime;
		shift.endMilTime = expandedMilTime.endTime;
		
		shift = ErrorCheckShift(shift);
		return shift;
	}



	/**
	*	Changes the words 'trading' and 'giving' to 'trade' and 'give'. (Ignores case)
	*	@function
	*	@param {string} exchangeWord - The word to simplify.
	*/
	function SimplifyExchange(exchangeWord)
	{
		if(exchangeWord.toLowerCase() == "trading"){ exchangeWord = "trade" }
		else if(exchangeWord.toLowerCase() == "giving"){ exchangeWord = "give" }
		return exchangeWord;
	}
	
	/**
	*	Converts the 12h start and end times of a shift into expanded military time and returns the military times in
	*	an object.
	*
	*	@function
	*	@param {Shift} shiftObject - A Shift object whose start and end time properties are set
	*	@returns {MilTime} - An object containing the start and end expanded military times of the shiftObject (first parameter)
	*/
	function GetExpandedMilTime(shiftObject)
	{
		var milTime = {startTime:undefined, endTime:undefined,}
		
		if(shiftObject.startTimePeriod == 'am')
		{
			if(shiftObject.startHour == 12)
			{
				milTime.startTime = 0 + shiftObject.startMinute;
			}
			else
			{
				milTime.startTime = (shiftObject.startHour * 100) + shiftObject.startMinute;
			}
		}
		else if(shiftObject.startTimePeriod == 'pm')
		{
			milTime.startTime = (shiftObject.startHour + 12) * 100;
			milTime.startTime += shiftObject.startMinute;
		}
		
		
		if(shiftObject.endTimePeriod == 'am')
		{
			if(shiftObject.endHour == 12)
			{
				milTime.endTime = 0 + shiftObject.endMinute;
			}
			else
			{
				milTime.endTime = (shiftObject.endHour * 100) + shiftObject.endMinute;
			}
		}
		else if(shiftObject.endTimePeriod == 'pm')
		{
			milTime.endTime = (shiftObject.endHour + 12) * 100;
			milTime.endTime += shiftObject.endMinute;
		}
		
		// Expanded mil time (shift starts one day and ends the next day)
		if(shiftObject.startTimePeriod == 'pm' && shiftObject.endTimePeriod == 'am')
		{
			milTime.endTime += (24*100);
		}
		
		return milTime;
	}
}







