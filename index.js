

var request = require('request');
var async = require('async');
var q = require('q');
var data = require('./data.json');

var mosques_data = [];

var next_page_token = '';


function getData()
{
    var deferred = q.defer();
    
    // next_page_token = data.next_page_token;
    
    
    // data.results.forEach(function(row) {
    //     // console.log("Row: ", row);
    //     var tmp = {};
    //     tmp.id = row.id;
    //     tmp.name = row.name;
    //     tmp.lat = row.geometry.location.lat;
    //     tmp.lng = row.geometry.location.lng;
    //     tmp.place_id = row.place_id;

    //     //=-=-=-=-=-=-=-=-=-
    //     var tmp_add = row.formatted_address.split(",");
    //     if (tmp_add !== undefined) {
    //         var len = parseInt(tmp_add.length);

    //         tmp.country = tmp_add[len - 1].trim();
    //         var tmp_pin_state = tmp_add[len - 2].split(" ");
    //         tmp.city = tmp_add[len - 3].trim();
    //         tmp.state = tmp_pin_state[1].trim();
    //         tmp.pincode = tmp_pin_state[2];
            
    //         tmp.address = "";
    //         for (var idx = 0; idx < len - 3; idx++) {
    //             tmp.address += tmp_add[idx];
    //         }

    //         tmp.formatted_address = row.formatted_address;
    //     }
    //     // console.log("Address Splitted: ", tmp_add);
    //     mosques_data.push(tmp);
    // });

    var _uri = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=mosque%20in%20Khambhat&key=AIzaSyDMWP2TM0CGFqX41BMP_J85wWlW7-Ddt8E";
    if (next_page_token !== "") {
        _uri = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=mosque%20in%20Khambhat&key=AIzaSyDMWP2TM0CGFqX41BMP_J85wWlW7-Ddt8E&pagetoken="+next_page_token;
    }
    
    var options = {
		method: 'GET',
		url: _uri,//'https://maps.googleapis.com/maps/api/place/textsearch/json?query=mosque%20in%20Vadodara&key=AIzaSyDMWP2TM0CGFqX41BMP_J85wWlW7-Ddt8E',
		headers:
		{
 		    'cache-control': 'no-cache',
 		    'content-type': 'application/json'
	    },
		json: true
    };

    request(options, function (error, response, body) {

        if (error) {
            console.log("Error: ", error);
            return deferred.reject(error);
        }
        console.log("Body Data: ", body);
        if (body && body.next_page_token !== undefined) {
            next_page_token = body.next_page_token;
        } else {
            next_page_token = null;
        }
        var data = body;
        data.results.forEach(function(row) {
            // console.log("Row: ", row);
            var tmp = {};
            tmp.id = row.id;
            tmp.name = row.name;
            tmp.lat = row.geometry.location.lat;
            tmp.lng = row.geometry.location.lng;
            tmp.place_id = row.place_id;
    
            //=-=-=-=-=-=-=-=-=-
            var tmp_add = row.formatted_address.split(",");
            if (tmp_add !== undefined) {
                var len = parseInt(tmp_add.length);
    
                tmp.country = tmp_add[len - 1].trim();
                var tmp_pin_state = tmp_add[len - 2].split(" ");
                tmp.city = tmp_add[len - 3].trim();
                tmp.state = tmp_pin_state[1].trim();
                tmp.pincode = tmp_pin_state[2];
                
                tmp.address = "";
                for (var idx = 0; idx < len - 3; idx++) {
                    tmp.address += tmp_add[idx];
                }
    
                tmp.formatted_address = row.formatted_address;
            }
            // console.log("Address Splitted: ", tmp_add);
            mosques_data.push(tmp);
        });

        deferred.resolve(true);
    });
    // console.log("Mosques Data: ", mosques_data);
	// deferred.resolve(true);

    return deferred.promise;
}

function postData() {
	var deferred = q.defer();
	
	console.log("POSTDATA:");
	var options = {
		method: 'POST',
		url: 'http://localhost/project_x_api/api/add_bulk_mosques',
		headers:
		{
 		    'cache-control': 'no-cache',
 		    'content-type': 'application/json'
		},
		body: {
			mosques_data: mosques_data
		},
		json: true
    };

	request(options, function (error, response, body) {
        if (error) {
            console.log("Error: ", error);
            return deferred.reject(error);
		}
		
        console.log("Body Data: ", body);
		
        deferred.resolve(true);
    });

    return deferred.promise;
}

setInterval(function() {
    console.log("20 sec over...");
    getData()
        .then(function(resp) {
            return postData();
        })
        .then(function(resp) {
            if (next_page_token === null) {
                //Process finished.
                console.log("Process Finished.");
                process.exit(0);
            }
        })
        .catch(function(err) {
            console.log("Error: ", err);
        });
}, 20 * 1000);
	