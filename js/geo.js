// Global vars for geolocation
var lat, lng, map;
var infoWindow = new google.maps.InfoWindow();

// Callback functions for geolocation

// Success function
function successPosition(position) {
	lat = position.coords.latitude;
	lng = position.coords.longitude;

	var latlng = new google.maps.LatLng(lat, lng);

	
	var myOptions = {
		zoom: 13,
		center: latlng,
		mapTypeControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map'), myOptions);

	var marker = new google.maps.Marker({
		position: latlng,
		map: map,
	});

	// Click event for the marker
	google.maps.event.addListener(marker, 'click', function() {
		getInfoWindowEvent(marker, "You are here!");
	});

	// Use Foursquare to find places (social.js)
	findPlaces();
	// Makes map expand to size of window on resize event
	google.maps.event.trigger(map, 'resize');
}

// Error function
function errorPosition(error) {
	switch (error.code) {
		case 0: 
			var message = "Something went wrong: " + error.message;
			break;
		case 1:
			var message = "you denied permission to get your location.";
			break;
		case 2:
			var message = "The browser was unable to determine your location.";
			break;
		case 3:
			var message = "The browser timed out before retrieving your location.";
			break;
	}
	alert(message);
}


// Info box function
function getInfoWindowEvent(marker, text) {
	infoWindow.close();
	infoWindow.setContent(text);
	infoWindow.open(map, marker);
}

// Refresh location function
function refreshLocation() {
	console.log('refreshed');
	navigator.geolocation.getCurrentPosition(successPosition, errorPosition);
}


