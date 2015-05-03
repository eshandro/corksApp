/**
 * System Variables -- globals
 */

var map, db, lat, lng;
var infoWindow = new google.maps.InfoWindow();
var storeName = "winesDB";


/**
 * Initialization and other setup functionality inside document ready
 */
$(document).ready(function() { 
	console.log('Ready');

	/**
	 * Checks for user in localstorage and sets val in settings form to it if exists
	 */
	var user = myLocalStorage.get('username');
	if (user) {
		$('#user_name_save').val(user);
	}

/**
 * Handle hash changes
 */
	$(window).bind('hashchange', function(e) {
		e.preventDefault();
		newHash = window.location.hash.substring(1);
		if (newHash) {
			if (newHash === 'find') {
				if ($.trim($('#map').html()) === '') {
					// Get time of most recent location 
					var lastTime = myLocalStorage.get('lastGeoLocTime');
					if (lastTime) {
						var currentTime = new Date().getTime();
						var geoTimeDiff = parseInt(lastTime) - parseInt(currentTime);
						if (geoTimeDiff > 250) {
							getCurrentPosition();
						}
						else {
							navigator.geolocation.getCurrentPosition(successPosition, errorPosition);
							
						}
					}
					else {
						navigator.geolocation.getCurrentPosition(successPosition, errorPosition);
					}

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

	/**
	 * Set up database
	 */

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
	openWinesDB();

});
