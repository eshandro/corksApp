/**
 * Contains all database functionality except for initial set up
 */

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
		var object = event.target.result;
		var start = new Date().getTime();
		// console.log('start ', start);
		// console.log('obj from viewWine: ', event.target.result);
		// console.log('event.target.result.timeAdded', event.target.result.timeAdded);
		var diff = timeDifference(start, object['timeAdded']);
		// console.log('diff: ', diff);
		console.log(object);

		code += '<h2>' + object.wine_name + '</h2><p>Added <strong>' + object.qty + '</strong> bottles to your cellar.</p><label><strong>You said: </strong></label><p>' + object.note + '</p><label><strong>Wine Description: </strong></label>' + object.wine_desc + '</p><p>You added this wine to your cellar: <strong>' + diff + '</strong>';

		$('#detail').html(code);



	}
}

function searchWines(items) {
	var results = [];
	var searchTerm = $('#search-basic').val().toLowerCase();
	if (!items) {
		alert('You have no wines in your cellar to search!');
		return;
	}
	var len = items.length;
	for (var i=0; i < len; i++) {
		var currentObj = items[i];
		var objKeys = Object.keys(currentObj);
		var len2 = objKeys.length;

		for (var j=0; j < len2; j++) {
			var key = objKeys[j];
			var value = currentObj[key];
			if (typeof value === 'string') {
				if (value.toLowerCase().indexOf(searchTerm) !== -1) {
					results.push(currentObj);
					break;
				}
			}
		}
	}
	console.log('results ', results);
	$('#my-search-list').listview();
	var code = '';
	var len3 = results.length;
	for (var k=0; k < len3; k++) {
		var source = $('#search-results-template').html();
		// console.log('source: ', source);
		var template = Handlebars.compile(source);
		// console.log('template: ', template);
		code += template(results[k]);
		console.log('results[k] ',results[k]);
		console.log('code: ', code);
	}
	// console.log('code: ', code);
	$("#my-search-list").html(code);
	$("#my-search-list").listview('refresh');
	$('.searchHeader').show();
}

// searchWines2 is function using indexdb get vs above
function searchWines2() {
	$('.noResults').hide();
	$('.searchHeader').hide();

	var results = [];
	var searchTerm = $('#search-basic').val();
	
	var trans = db.transaction(storeName, 'readonly');
	var objectStore = trans.objectStore(storeName);
	var index = objectStore.index("wine_name");

	console.log('trans ', trans);
	console.log('objectStore ', objectStore);
	console.log('index ', index);


	var search = index.get(searchTerm);
	console.log('search ', search);

	search.onsuccess = function (e) {
		console.log('onsuccess runs', e )
		var match = e.target.result;
		if (match) {
			console.log('match found ', match);
			results.push(match);
		}
	}

	search.onerror = function(e) {
		console.log('search error ', e);
		$('.noResults').show();

	}

	trans.oncomplete = function(e) {
		console.log('results ', results);
		if (!results.length) {
			$('.noResults').show();
		}
		else {
			$('#my-search-list').listview();
			var code = '';
			var len = results.length;
			for (var i=0; i < len; i++) {
				var source = $('#search-results-template').html();
				// console.log('source: ', source);
				var template = Handlebars.compile(source);
				// console.log('template: ', template);
				code += template(results[i]);
				console.log('results[i] ',results[i]);
				console.log('code: ', code);
			}
		
			// console.log('code: ', code);
			$("#my-search-list").html(code);
			$("#my-search-list").listview('refresh');
			$('.searchHeader').show();
			$('#search-basic').val('');	
		}
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