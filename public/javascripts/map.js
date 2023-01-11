const axios = require('axios').default;
const dotenv = require('dotenv');

dotenv.config();

//Turns the center point coordinates and the radius in Km specified by the user into 2 opposite corners of a square area
const radiusToSquare = (radiusKm, centerPoint) => {
    //center point is an array of 2 numbers.
    //first value in the centerPoint array
    let centerLat = centerPoint[0];
    //second value in the centerPoint array
    let centerLng = centerPoint[1];

    //converts the radius in Km to degrees
    let radiusDeg = radiusKm / 111.4
    
    //transforms the center points latitude and longitude by the radius degrees to get the corners of the square area
    latMin = centerLat - radiusDeg
    latMax = centerLat + radiusDeg
    lngMin = centerLng - radiusDeg
    lngMax = centerLng + radiusDeg

    //returns 2 coordinate points at opposite corners of a square area around the centerPoint
    return [latMin, lngMin, latMax, lngMax]

}


//generates a set of random coordinates within a set range, seperated by a minimum distance
const genreateRandomPoints = async (boundsMin, boundsMax, amountSections) => {
    // 5km divided by 111.4 gets the minimum distance that the points must be seprated by
    const SEARCH_BOX_SIDE_LENGTH_DEG = 0.0448833

    //The latitude from the maximum bounds array
    latMax = boundsMax[0];
    //The longitude from the maximum bounds array
    lngMax = boundsMax[1];
    //The latitude from the minimum bounds array
    latMin = boundsMin[0];
    //The longitude from the minimum bounds array
    lngMin = boundsMin[1];

    //an array that holds the latitudes of the points
    let pointsLat = []
    //an array that holds the longitudes of the points
    let pointsLng = []

    
    let numberPoints = 0
    //number of iterations of the while loop
    let numberIterations = 0

    //Keeps on looping until the length of the pointsLat array is the same as the amount of sections and the number of iterations is less than 3000 
    while(numberPoints < amountSections && numberIterations < 3000) {
        //prints the amount of points currently stored in its array
        numberIterations++;

        //console.log(`Number of iterations: ${numberIterations}`);
        //console.log("Top of the while loop");
        //console.log(`Number of points = ${pointsLat.length}`);

        //generates a random number within the range of max latitude and min latitude up to 4 decimal points, '+' operator turns the result back to a number
        let newLat = +(Math.random() * (latMax - latMin) + latMin).toFixed(4);
        //generates a random number within the range of max longitude and min longitude up to 4 decimal points, '+' operator turns the result back to a number
        let newLng = +(Math.random() * (lngMax - lngMin) + lngMin).toFixed(4);

        //if the array of generated latitudes is empty
        if(pointsLat.length == 0){
            //add the genrated points to their respective lists without any extra checks
            //console.log("In the end of the outermost if block")
            pointsLat.push(newLat);
            pointsLng.push(newLng);
            numberPoints++;
            //console.log(`First point found! ${newLat},${newLng}`)

            //if the arrays of latitudes and longitudes are not empty
        } else {

            let passTests = true;

            //iterates through all the already generated points
            for (let i = 0; i < numberPoints; i++){
                //console.log("Start of for loop")

                //if the new coordinates are within the range of one of the points in the points arrays 
                if (isWithinRange(newLat, newLng, pointsLat[i], pointsLng[i], SEARCH_BOX_SIDE_LENGTH_DEG)){
                //stop the current for loop and move onto the next while iteration
                //console.log("Break out of innermost if")
                    passTests = false;
                    break;
                }


                //if the new coordinates generated are the same as one of the previously generated coordinates
                else if (newLat == pointsLat[i] && newLng == pointsLng[i]){
                    // stop the current for loop and move onto the next while iteration
                    //console.log("Break out of innermost if else")
                    passTests = false;
                    break;
                }
                 else{
                    //otherwise continue the for loop to check the next iterations points
                    continue;             
                }
            }
            if (passTests == true) {
            //if the for loop checks that the new points meet the requirements  -> add the points to their arrays
            pointsLat.push(newLat)
            pointsLng.push(newLng)
            //increase the numberPoints variable
            numberPoints++;
            //console.log(`Number of points = ${pointsLat.length}`);
            //console.log(`New point found! ${newLat},${newLng}`)
            }
            
        }
        //console.log("In the end of the outermost else block")
    }
    return [pointsLat, pointsLng]

}

const findNumberPoints = (radiusKm) => {
    //This is the area of the searchBoxes -> Search Box has height and width of 5km
    const SEARCH_BOX_AREA_KM_SQR = 25;
    //The area of the search based on the given radius turned into a square
    const searchSquareAreaKmSqr =  (2 * radiusKm) ** 2;
    //THe amount of sections 
    const amountPoints = Math.ceil(searchSquareAreaKmSqr / SEARCH_BOX_AREA_KM_SQR)
    return amountPoints;
}

const forwardGeocode = async (location) => {
    const params = {
        //api key from .env file
        access_key: process.env.GEO_ACCESS_KEY,
        //the location we want to geocode
        query: location,
        //the amount of results we want to recieve
        limit: 1,
      }

    //creates coordinates array
      let coordinates = []
      //api call to the positionstack api with the parameters above
      await axios.get('http://api.positionstack.com/v1/forward', {params})
        .then(response => {
            //gets the latitude and longitude of the location from the api call.
            let latitude = response.data.data[0].latitude;
            let longitude = response.data.data[0].longitude;
            //adds the varibles to the array
            coordinates = [latitude, longitude];
            
        }).catch(error => {
          console.log(error);
        });
        //returns the coordinates of the location from the api call.
    return coordinates;
}

//returns true if the coordenates1 are within the range of the coordinates2
let isWithinRange = (lat1, long1, lat2, long2, rangeDegrees) => {
    //calculates the distance between the 2 coordinates using the pythagorean theorem
    const distance = Math.sqrt((lat2 - lat1) ** 2 + (long2 - long1) ** 2);
    //console.log(distance);
    //returns true if the distance is lessthan or equal to the rangeDegrees value, otherwise false
    return distance <= rangeDegrees;
}

let closestToCenterPoint = (listLats, listLongs, centerLat, centerLng) => {
    //object that stores the closest distance to the centerPoint and the index of the entry
    let closestData = {
        // starts as -1 as a defualt distance value
        pointFound: false,
        distance: -1,
        lat: centerLat,
        long: centerLng
    }

    //loops while i is lessthan the length of listLats
    for (let i = 0; i < listLats.length; i++) {
        //gets the distance between the centerPoint and the current iterations coordinates using pythagoreas theoerm
        let distanceFromCenter = Math.sqrt((centerLat - listLats[i]) ** 2 + (centerLng - listLongs[i]) ** 2);

        //if the distance vairable in the closestData object has its default value of -1
        if (closestData.distance == -1){
            //sets the pointFound varaible to true
            closestData.pointFound = true;
            //set the distanceFromCenter variable  as the closestData objects distance field
            closestData.distance = distanceFromCenter;
            //set the value at the first index of listLats as the objects lat value
            closestData.lat = listLats[0]
            //set the value at the first index of listLongs as the objects long value
            closestData.long = listLongs[0]
        } 

        //if the distanceFromCenter is less than the closestData objects distance field
        if (distanceFromCenter < closestData.distance){
            //sets the pointFound varaible to true
            closestData.pointFound = true;
            //set the distanceFromCenter variable  as the closestData objects distance field
            closestData.distance = distanceFromCenter;
            //set the value at the current index of listLats as the objects lat value
            closestData.lat = listLats[i]
            //set the value at the current index of listLongs as the objects long value
            closestData.long = listLongs[i]
        }
    }

    return closestData;
}

let findClearSkys = async (listLat, listLong) => {
    const params = {
        //api key from .env file
        access_key: process.env.WEATHER_ACCESS_KEY,
      }

      //array with the latitudes of the places with clearskys
      let listClearSkysLat = [];
      //array with the longitudes of the places with clearskys
      let listClearSkysLong = [];
      //array with the percentage of cloud cover
      let listDataCloudy = [];

    //loops while i is lessthan length 
    for (let i = 0; i < listLat.length; i++) {
        //calls the weatherapi with the api key and the latitude and longitude as a GET request
        await fetch(`https://api.weatherapi.com/v1/current.json?key=${params.access_key}&q=${listLat[i]},${listLong[i]}&aqi=no`, {
            method: 'GET'
          })
          //if returns the response as a json
          .then(response => response.json())
          //returns the data
          .then(data => {
            //if the cloud percentage is lessthan 20
            if (data.current.cloud <= 20){
                //add the latitude, longitude and cloud percentage to their respective list
                listClearSkysLat.push(listLat[i])
                listClearSkysLong.push(listLong[i])
                listDataCloudy.push(data.current.cloud)
            }
          })
          //catches error and prints error
          .catch(error => {
        console.log("Error!")
          console.log(error);
        });
    }
    //retuns the arrays with the clear sky data
    return [listClearSkysLat, listClearSkysLong, listDataCloudy]
}

module.exports = {radiusToSquare, genreateRandomPoints, findNumberPoints, forwardGeocode, isWithinRange, closestToCenterPoint, findClearSkys}