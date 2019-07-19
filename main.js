$(document).ready(function() {
  var distance_val, duration_val;
  // add input listeners
  google.maps.event.addDomListener(window, 'load', function() {
    var from_places = new google.maps.places.Autocomplete(
      document.getElementById('from_places')
    );
    var to_places = new google.maps.places.Autocomplete(
      document.getElementById('to_places')
    );

    google.maps.event.addListener(from_places, 'place_changed', function() {
      var from_place = from_places.getPlace();
      var from_address = from_place.formatted_address;
      $('#origin').val(from_address);
    });

    google.maps.event.addListener(to_places, 'place_changed', function() {
      var to_place = to_places.getPlace();
      var to_address = to_place.formatted_address;
      $('#destination').val(to_address);
    });
  });

  // calculate distance
  function calculateDistance() {
    var origin = $('#origin').val();
    var destination = $('#destination').val();

    var service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
          modes: [google.maps.TransitMode.SUBWAY]
        },
        unitSystem: google.maps.UnitSystem.METRIC, // miles and feet.
        avoidHighways: true,
        avoidTolls: true
      },
      callback
    );
  }

  // get distance results
  function callback(response, status) {
    if (status != google.maps.DistanceMatrixStatus.OK) {
      $('#result').html(err);
    } else {
      var origin = response.originAddresses[0];
      var destination = response.destinationAddresses[0];
      if (response.rows[0].elements[0].status === 'ZERO_RESULTS') {
        $('#result').html(
          'Better get on a plane. There are no roads between ' +
            origin +
            ' and ' +
            destination
        );
      } else {
        console.log(response);

        var distance = response.rows[0].elements[0].distance.text;
        distance_val = response.rows[0].elements[0].distance.value;
        var duration = response.rows[0].elements[0].duration.text;
        duration_val = response.rows[0].elements[0].duration.value;
        var fare = response.rows[0].elements[0].fare.value;
        var cur = response.rows[0].elements[0].fare.currency;

        $('#dist').text(distance);
        $('#duration_text').text(duration);
        $('#fare').text(fare + ' ' + cur);
        $('#from').text(origin);
        $('#to').text(destination);

        DistDur();
      }
    }
  }

  // print results on submit the form
  $('#distance_form').submit(function(e) {
    e.preventDefault();
    calculateDistance();
  });

  let btnLocation = false;
  document.getElementById('locationBtn').addEventListener('click', function() {
    btnLocation = true;
    getLocation();
  });

  function getLocation() {
    if (btnLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
      } else {
        x.innerHTML = 'Geolocation is not supported by this browser.';
      }

      btnLocation = false;
    }
  }

  function showPosition(position) {
    let lat = position.coords.latitude;

    let long = position.coords.longitude;

    reverseGeocode(lat, long);
  }

  function reverseGeocode(lat, long) {
    let geocoder = new google.maps.Geocoder();
    let input = { lat: parseFloat(lat), lng: parseFloat(long) };

    geocoder.geocode({ location: input }, function(results, status) {
      if (status === 'OK') {
        if (results[0]) {
          let place = results[0].formatted_address;
          document.getElementById('from_places').value = place;
          document.getElementById('origin').value = place;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

  function DistDur() {
    let distPerSec = distance_val / duration_val;
    let remainingDist = distance_val;
    let remainingDur = duration_val;

    let durmili = duration_val * 1000;
    let interRef = setInterval(calDistDur, 1000);

    function calDistDur() {
      remainingDist = Math.floor(remainingDist - distPerSec);
      remainingDur = remainingDur - 1;
      if (remainingDist >= 400) {
        $('body').addClass('alert');
        $('#main-title').text(
          'Pack your stuff as your destination is less than 400 mt ahead.'
        );
      } else {
        $('#dist_left').text(`${remainingDist} mt`);
        $('#time_left').text(`${remainingDur} sec`);
      }
    }

    function over() {
      clearInterval(interRef);
    }
    setTimeout(over, durmili);
  }
});
