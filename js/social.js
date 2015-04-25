
// Foursquare API
// Client id: E4KM4DBCBJ0OHE4YE0LE22X3WEZNVKH3CDKDEAWLMO4LFBET
// Client Secret: KLIVIR5L4EQLYS45OEZRYFT5X3CBU3O552BTRKKWXD4R1TTZ
// 

var clientId = 'E4KM4DBCBJ0OHE4YE0LE22X3WEZNVKH3CDKDEAWLMO4LFBET';
var clientSecret = 'KLIVIR5L4EQLYS45OEZRYFT5X3CBU3O552BTRKKWXD4R1TTZ';
function findPlaces() {
	$.getJSON("https://api.foursquare.com/v2/venues/search?client_id=" + clientId + 
		"&client_secret=" + clientSecret +"&v=20130815&ll=" + lat + "," + lng + 
		"&query=wine&limit=10", function(data) {
			if (data.meta.code === 200) {
				var venues_list = data.response.venues;
				$(venues_list).each(function(i, venue) {
					console.log(venue);
					var venue_name = venue.name;
					var venue_phone = venue.contact.formattedPhone;
					var venue_address = venue.location.address;
					
					if (venue.categories.length == 0) {
						var venue_image = 'http://foursquare.com/img/categories/non_32.png';
					}
					else {
						var venue_image = venue.categories[0].icon.prefix + 'bg_32' + venue.categories[0].icon.suffix;
						// venue_image = venue_image.slice(venue_image.indexOf(':')+1);
					}
					console.log(venue_image);
					if (venue_address) {
						var addressDisplay = '<p style="margin-bottom: 2px;">' + venue_address + '</p>'
					}
					else {var addressDisplay = '';}
					if (venue_phone) {
						var phoneDisplay = '<p style="margin-top: 0;">' + venue_phone + '</p>';
					}
					else {var phoneDisplay = '';}

					var imageDisplay = '<span style="float: left; margin-right: 10px;"><img src="' + venue_image + '"></span>';
					var nameDisplay = '<div style="overflow: auto; font-size: 10px;"><p style="font-size:14px; margin-top:0;">' + venue_name + '</p>';

					var venueDisplayHTML = imageDisplay + nameDisplay + addressDisplay + phoneDisplay + '</div>';
					
					var latlng = new google.maps.LatLng(venue.location.lat, venue.location.lng);
					var marker = new google.maps.Marker({ 
						position: latlng,
						map: map,
						});

					google.maps.event.addListener(marker, 'click', function() {
						getInfoWindowEvent(marker, venueDisplayHTML);
					});

				});
			}
	});
}
