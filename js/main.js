
// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || 
window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || 
window.msIDBTransaction;

window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

if(!window.indexedDB) {
	window.alert('Your browser does not support indexedDB, so data cannot be saved.');
}

// Open DB and configure it
var db, storeName = "winesDB";
var openWinesDB = function() {
	if(indexedDB) {
		var request = indexedDB.open(storeName, 1);
		var upgradeNeeded = ('onupgradeneeded' in request);
		request.onsuccess = function(e) {
			db = e.target.result;
			if (!upgradeNeeded && db.version != '1') {
				var setVersionRequest = db.setVersion('1');
				setVersionRequest.onsuccess = function(e) {
					var objectStore = db.createObjectStore(storeName, {
						keyPath: 'wine_id'
					});
					objectStore.createIndex('wine_name', 'wine_name', {
						unique: false
					});
					objectStore.createIndex('wine_desc', 'wine_desc', {
						unique: false
					});

					// loadTasks();
				};
			} else {
				// loadTasks();
			}
		};
		if(upgradeNeeded) {
			request.onupgradeneeded = function(e) {
				db = e.target.result;
				var objectStore = db.createObjectStore(storeName, {
					keyPath: 'wine_id'
				});
				objectStore.createIndex('wine_name', 'wine_name', {
					unique: false
				});
				objectStore.createIndex('wine_desc', 'wine_desc', {
					unique: false
				});

			};
		}
	}
	else { 
		alert('Indexed DB not supported. Sorry, can\'t save any data.');
	} 
};

/*var openWineriesDB = function() {
	if(indexedDB) {
		var request = indexedDB.open('wineriesDB', 1);
		var upgradeNeeded = ('onupgradeneeded' in request);
		request.onsuccess = function(e) {
			db = e.target.result;
			if (!upgradeNeeded && db.version != '1') {
				var setVersionRequest = db.setVersion('1');
				setVersionRequest.onsuccess = function(e) {
					var objectStore = db.createObjectStore('wineriesDB', {
						keyPath: 'winery_id'
					});
					objectStore.createIndex('winery_name', 'winery_name', {
						unique: true
					});
					// Generic error handler for all db errors except on db creation
					db.onerror = function(e) {
						alert ('Database error: ' + e.target.errorCode);
					};
					// loadTasks();
				};
			} else {
				// loadTasks();
			}
		};
		if(upgradeNeeded) {
			request.onupgradeneeded = function(e) {
				db = e.target.result;
				var objectStore = db.createObjectStore('wineriesDB', {
					keyPath: 'wine_id'
				});
				objectStore.createIndex('winery_name', 'winery_name', {
					unique: true
				});
				// Generic error handler for all db errors except on db creation
				db.onerror = function(e) {
					alert ('Database error: ' + e.target.errorCode);
				};
			};
		}
	}
	else { 
		alert('Indexed DB not supported. Sorry, can\'t save any data.');	
	} 
};*/
openWinesDB();
// openWineriesDB();


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

// function to handle add wine form submittal
var handleForm = function() {
	var is_error = false;
	$('#error-msg').hide();
	$('#manage-form input').each(function() {
		$(this).prev().removeClass('error');
	});

	$('.required').each(function() {
		if ($(this).val() === '') {
			// console.log('empty field: ', $(this));
			$(this).parent().prev().addClass('error');
			is_error = true;
		}
	});
	if (is_error) {
		$('#error-msg').show();
	}
	else {
		// Pull values from form using jQ Mobile
		var wine_name = $('#wine_name').val();
		var winery_name = $('#winery_name').val();
		var wine_color = $('#wine_color').val();
		var wine_desc = $('#wine_desc').val();

		var qty = $('#cellar_qty').val();
		var note = $('#cellar_desc').val();
		var timeAdded = new Date().getTime();

		// add wine to winesDB
		var wine = {
			wine_id: new Date().getTime(),
			wine_name: wine_name,
			wine_color: wine_color,
			wine_desc: wine_desc,
			winery_name: winery_name,
			qty: qty,
			note: note,
			timeAdded: timeAdded
		};

		console.log('new wine= ', wine)
		
		var tx = db.transaction([storeName], 'readwrite');
		console.log('tx ', tx);
		var objectStore = tx.objectStore(storeName);
		console.log('objectStore ', objectStore);
		var request = objectStore.add(wine);
		tx.oncomplete = function(e) {
			$('#success-msg').show();
			$('#manage-form input').val('');
			$('#manage-form textarea').val('');
		};
			
		// Prevent refresh, default form submit 
		return false;
	}
}

function getAllItems(callback) {
	var trans = db.transaction(storeName, 'readonly');
	var store = trans.objectStore(storeName);
	var items = [];

	trans.oncomplete = function(e) {
		callback(items);
	};

	var cursorRequest = store.openCursor();
	cursorRequest.onerror = function(error) {
		console.log(error);
	};

	cursorRequest.onsuccess = function(e) {
		var cursor = e.target.result;
		if (cursor) {
			items.push(cursor.value);
			cursor.continue();
		}
	};
}

function grabActivity(items) {
/*	db.transaction(function() {
		var trans = db.transaction(storeName, 'readonly');
		console.log('trans in grabActivity" ', trans);
		var objectStore = trans.objectStore('storeName');
		console.log('objectStore in grabActivity', objectStore);
	})*/
	// console.log('grabActivity callback');
	// console.log(items);
	$('#my-activity-list').listview();

	if (items.length) {
		var len = items.length;
		var code = '';
		var obj = {};
		for (var i=0; i < len; i++) {
			var source = $('#activity-template').html();
			// console.log('source: ', source);
			var template = Handlebars.compile(source);
			// console.log('template: ', template);
			code += template(items[i]);
		}
		// console.log('code: ', code);
		$("#my-activity-list").html(code);
		$('#my-activity-list').listview('refresh');
	}
	else {
		alert('You have no wines!');
	}

	$('#my-activity-list').listview('refresh');
}

function viewWine(act_id) {
	var trans = db.transaction(storeName, 'readonly');
	var store = trans.objectStore(storeName);

	var request = store.get(act_id);

	request.onerror = function(error) {
		console.log('error finding activity:', error);

	}

	request.onsuccess = function(event) {
		var code = '';
		var start = new Date().getTime();
		// console.log('obj from viewWine: ', event.target.result);
		var diff = timedDifference(start, event.target.result['timeAdded']);
		console.log('diff: ', diff);


	}
}

function timeDifference(current, original) {
	var msPerMinute = 60 * 1000;
	var msPerHour = msPerMinute * 60;
	var msPerDay = msPerHour * 24;
	var msperMonth = msPerDay * 30;
	var msPerYear = msperDay * 365;

	var msElapsed = current - original;

	if (msElapsed < msPerMinute) {
		return Math.round(msElapsed/1000) + ' seconds ago.';
	}
	else if 
}

// Document ready
$(document).ready(function() { 
	console.log('Ready');


	/**
	 * Script to hanlde the map being created and destroyed
	 */
	$(window).bind('hashchange', function(e) {
		e.preventDefault();
		newHash = window.location.hash.substring(1);
		if (newHash) {
			if (newHash === 'find') {
				if ($.trim($('#map').html()) === '') {
					navigator.geolocation.getCurrentPosition(successPosition, errorPosition);
				}
			}
			else if (newHash === 'activity') {
				getAllItems(grabActivity);
			}
		}
		else {
			// the app just loaded which defaults to the activity tab
			if (db) {
				getAllItems(grabActivity);
			}
			else {
				setTimeout(function() {getAllItems(grabActivity)}, 500);
			}
		}
	});
	$(window).trigger('hashchange');


});