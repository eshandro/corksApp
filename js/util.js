// Function for showing or hiding the add to cellar info
var toggleBox = function(elem) {
	if ($(elem).is(':checked')) {
		$('#cellar_ques').show();
		$('#cellar_ques input').addClass('required');
	}
	else {
		$('#cellar_ques').hide();
		$('#cellar_ques input').removeClass('required');
	}
}





function timeDifference(current, original) {
	var msPerMinute = 60 * 1000;
	var msPerHour = msPerMinute * 60;
	var msPerDay = msPerHour * 24;
	var msPerMonth = msPerDay * 30;
	var msPerYear = msPerDay * 365;

	var msElapsed = current - original;

	if (msElapsed < msPerMinute) {
		return Math.round(msElapsed/1000) + ' seconds ago.';
	}
	else if (msElapsed < msPerHour) {
		return Math.round(msElapsed/msPerMinute) + ' minutes ago.';
	}
	else if (msElapsed < msPerDay) {
		return Math.round(msElapsed/msPerHour) + ' hours ago.';
	}
	else if (msElapsed < msPerMonth) {
		return 'approximately ' + Math.round(msElapsed/msPerDay) + ' days ago.';
	}
	else if (msElapsed < msPerYear) {
		return 'approximately ' + Math.round(msElapsed/msPerMonth) + ' months ago.';
	}
	else {
		'approximately ' + Math.round(msElapsed/msPerYear) + ' years ago.';
	}
}

/**
 * Local storage functionality
 * 
 */

var myLocalStorage = {
	set: function(index,value) {
		var setValue;
		if (typeof value == 'object') {
			setValue = JSON.stringify(value);
		}
		else {
			setValue = value;
		}

		localStorage.setItem(index, setValue);
	},
	
	remove: function(index) {
		localStorage.setItem(index, '');
	},
	
	get: function(index, testString) {
		if (testString == 'JSON') {
			return JSON.parse(localStorage.getItem(index));
		}
		else {
			return localStorage.getItem(index);
		}
	},

	clear: function() {
		localStorage.clear();
	}

}

/**
 * Saves user to LocalStorage
 */
function saveUser() {
	$('#success-msg-user').hide();
	myLocalStorage.set('username', $('#user_name_save').val());
	$('#success-msg-user').show();
}