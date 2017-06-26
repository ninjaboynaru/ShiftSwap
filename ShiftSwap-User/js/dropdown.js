



/*
	Requires JQUERY
	Requires dropdown.css
	
	[Dropdowns within dropdowns are not permitted]
*/


var DropdownControl = new function()
{
	
	/**
	*	Initialize dropdown functionality by assigning the appropriate callback to all dropdowns within the html document.
	*	Call this when the document loads and when new dropdowns are created dynamically through code.
	*
	*	@function
	*/
	this.SetupDropdown = function()
	{
		CloseAllDropdowns();
		$('.dropdown > .dropdown-toggle').add(document.body).off('click', DropdownToggle);
		$('.dropdown > .dropdown-toggle').add(document.body).click(DropdownToggle);
	}
	
	
	function DropdownToggle(event)
	{
		if($(event.currentTarget).hasClass('dropdown-toggle') && $(event.currentTarget).parent().find('.dropdown-contents').length != 0 )
		{
			event.stopPropagation();
			var dropdownContents = $(event.currentTarget).parent().find('.dropdown-contents')[0];
			CloseAllDropdowns(dropdownContents);
			$(dropdownContents).toggle();
		}
		else if(event.currentTarget == document.body)
		{
			CloseAllDropdowns();
		}
	}
	function CloseAllDropdowns(exception)
	{
		if(exception)
		{
			$('.dropdown').find('.dropdown-contents').not(exception).hide()
		}
		else
		{
			$('.dropdown').find('.dropdown-contents').hide();
		}
	}
	
	/**
	*	Sets the dropdown display element within a dropdown given that the element passed to this function is in a correctly
	*	html structured dropdown element.
	*	This method is meant to be called by a click event within a dropdown.
	*
	*	@function
	*	@param {element} element - context of this call/element that initiated this function call
	*/
	this.SetDropdownDisplay = function(element)
	{
		var text = $(element).attr('display-text');
		var toggleElement = $(element).parent().siblings('.dropdown-display');
		if(toggleElement.length == 0)
		{
			toggleElement = $(element).parent().parent().siblings('.dropdown-display');
		}

		if(text == undefined)
		{
			toggleElement.text($(element).text() );
			return;
		}
		toggleElement.text(text);
	}
	
}