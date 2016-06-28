// global variables that can be accessed from any method
var map
var marker
var participantID  = ""
var type = ""
var date = ""
var time = ""
var riskFactor = ""
var Description = ""
var marker
var data

// function to load the map and its features
function initMap() {
	// variable to store the map
	var map = new google.maps.Map(document.getElementById('map'), {
		// appearance of the map on load
		zoom: 11,
		center: {lat: 53.799788, lng: -1.696970},
		streetViewControl: false,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
			position: google.maps.ControlPosition.RIGHT_BOTTOM
		}
	});

	// Content to display in the submission info window
	var contentString =
	'<DIV id = "infobox"> ' +
		'<H2> Location Report </H2> ' +
		'<BR>' +
		'<p> Partcipant ID: <input type="number" class = "submitform" id="participantID"> '+
		'<BR>'+
		'<p> Type : <select class = "submitform" id = "type"> ' +
						'<option value="Near miss">Near miss</option> ' +
						'<option value="Poor road surface">Poor road surface</option> ' +
						'<option value="Confusing road layout">Confusing road layout</option> ' +
					'</select> </p>' +
					'<BR>'+
		'<p> Date:  <input type="date" class = "submitform"  name="submitDate" id = "date" required> '+
		'<BR>'+
		'<p> Time:  <input type="time" class = "submitform"  id = "time" name="submitTime"> '+
		'<BR>'+
		'<p> Risk Factor : <select class = "submitform" id ="riskFactor"> ' +
						'<option value="NA">NA</option> ' +
						'<option value="1">1</option> ' +
						'<option value="2">2</option> ' +
						'<option value="3">3</option> ' +
						'<option value="4">4</option> ' +
						'<option value="5">5</option> ' +
					'</select> </p>' +
		'<BR>'+
		'<p> Description : </p> ' +
			'<textarea rows="10" cols="30" class = "submitform" id="description"> </textarea>' +
		'<BR>'+
		' <input type="submit" value="Submit" onclick =formData() >' +
		'<Div id = "streetview"> </Div>'
	'</DIV>'

	// Create the infowindow
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	// clicking the map will cuase the instructions to fade out using jQuery
	map.addListener('click', function(e) {
        $("#instructions_text").fadeOut();
	});
	// Clicking the instruction button to bring the instructions up on screen
	document.getElementById('instructions').onclick = function() {
		 $("#instructions_text").fadeIn();
	};

	// double click to allow the user to bring up the info window to submit data
	map.addListener('dblclick', function(e) {
		// If else statement to determine if the map is sufficently zoomed in
		if (map.getZoom() >= 17) { // if true then get the latlng for the streetview window
				placeMarker(e.latLng, map); // create a marker at the clicked location
				infowindow.open(map, marker); // open the info window
				pano(e.latLng, map) // latlng for the streetview
				map.addListener('click', function(e) {
					marker.setMap(null); // add a listener to the map to remove the marker if the map is clicked
				})
			}
		// If the map isn't zoomed in enough the user will be notified.
		else {
		alert("please zoom in further to submit data!")
		}
	});

	// A red circle icon
	var red ={
		path: google.maps.SymbolPath.CIRCLE,
		fillColor: 'red',
		fillOpacity: .8,
		scale: 9,
		strokeColor: 'white',
		strokeWeight: 1
	}
	// A blue circle icon
	var blue ={
		path: google.maps.SymbolPath.CIRCLE,
		fillColor: 'blue',
		fillOpacity: .8,
		scale: 9,
		strokeColor: 'white',
		strokeWeight: 1
	}
	// A purple circle icon
	var purple ={
		path: google.maps.SymbolPath.CIRCLE,
		fillColor: 'purple',
		fillOpacity: .4,
		scale: 9,
		strokeColor: 'white',
		strokeWeight: 1
	}

	// Load the example data
	map.data.loadGeoJson('/~gy14mw/unreportedLeeds/data/ex_data.geojson');

	var dataWindow = new google.maps.InfoWindow();


	// Style the markers determined on the type feature
	map.data.setStyle(function(feature) {
		// Confusing layout will have a blue icon
		if (feature.getProperty("Type") === "Confusing") {
			return /** @type {google.maps.Data.StyleOptions} */({
				icon: blue
			});
		}
		// Near miss data to have a red icon
		else if (feature.getProperty("Type") === "Near_Miss") {
			return /** @type {google.maps.Data.StyleOptions} */({
				icon: red
			});
		}
		// Condition icon to have a purple icon
		else if (feature.getProperty("Type") === "Condition") {
			return /** @type {google.maps.Data.StyleOptions} */({
				icon: purple
			});
		}
	});

    // Open an infowindow if data points are clicked
	map.data.addListener('click', function(event) {
		dataWindow.setContent(
			'<DIV id = "databox"> ' +
				'<DIV id = "info_text">' +
					'<H2> Location Report </H2> ' +
						'<BR>' +
					'<b> Partcipant ID: </b> ' + event.feature.getProperty("P_ID") +
						'<BR>'+
						'<BR>'+
					'<b> Type : </b> ' +  event.feature.getProperty("Type") +
						'<BR>'+
						'<BR>'+
					'<b> Date: </b> ' +  event.feature.getProperty("Date") +
						'<BR>'+
						'<BR>'+
					'<b> Time: </b> ' +  event.feature.getProperty("Time") +
						'<BR>'+
						'<BR>'+
					'<b> Risk Factor: </b> ' +  event.feature.getProperty("Risk_F") +
						'<BR>'+
						'<BR>'+
					'<b> Description : </b> ' +  event.feature.getProperty("Descript") +
						'<BR>'+
						'<BR>'+
					'<Div id = "streetview" style="width: 500px; height: 500px"> </Div>' +
				'</DIV>'+
			'</DIV>'
		)

		dataWindow.setPosition(event.feature.getGeometry().get());
		dataWindow.open(map);
		pano(event.latLng, map) // latlng for the streetview
  });
	// ensure that infowindows are closed when the map is clicked
	map.addListener('click', function(e) {
		dataWindow.close()
	})
}

// Funciton to create a marker
function placeMarker(latLng, map) {
	marker = new google.maps.Marker({
		position: latLng,
		map: map,
	});
}
// Function to display street view images
function pano(latLng, map) {
	var panorama = new google.maps.StreetViewPanorama(
		document.getElementById('streetview'), {
		position: latLng,
	});
	map.setStreetView(panorama);
}


// Function that returns the form data when submitted
function formData() {

	// initialise the variables
	participantID = document.getElementById("participantID").value
	type  = document.getElementById("type").value
	date  = document.getElementById("date").value
	time  = document.getElementById("time").value
	riskFactor  = document.getElementById("riskFactor").value
	Description   = document.getElementById("description").value

	// Test if the variables are filled
	if (
		participantID === "" ||
		type === ""||
		date === "" ||
		time === "" ||
		riskFactor === "" ||
		Description === ""
		) {
	alert("Please complete all of the fields") // tell the user to complete all fields
	}
	// if the data is filled in then display
	else {
	alert(
		" participant ID = " + participantID +
		" Type = " + type +
		" Date = " + date +
		" Time = " + time +
		" Risk Factor = " + riskFactor +
		" Description : " + Description
		)
	}
}
