var express = require('express');
var mapRouter = express.Router();
const axios = require('axios').default;
const map = require('../public/javascripts/map');


/* GET users listing. */
mapRouter.get('/', function(req, res, next) {
  res.send('This is the map route');
});

mapRouter.route('/location')
.post(async (req, res) => {
    //the location input of the form
    let locationName = req.body.city;
    //the range input of the form
    let rangeKm = req.body.range;

    //gets an array with the coordinates of the locationName
    let locationCoordinates = await map.forwardGeocode(locationName);

    //gets an array with coordinates for 2 corners of the search area box
    let squareBoundBox = map.radiusToSquare(rangeKm, locationCoordinates);

    //the min value corner coordinates for the bounding box
    let boundsMin = [squareBoundBox[0], squareBoundBox[1]]
    //the max value corner coordinates for the bounding box
    let boundsMax = [squareBoundBox[2], squareBoundBox[3]]

    //finds the number of points to search within the search box, (minus 1 so that the algorithm can find points easier within the range)
    //if the maximum of points that can fit wihtin the search area is used, the generateRandomPoints function takes alot longer
    amountPoints = map.findNumberPoints(rangeKm) - 1;

    //generates random points within the min and max coorninates of the search box -> returns as nested arrays
    let generatedPoints = await map.genreateRandomPoints(boundsMin, boundsMax, amountPoints);

    //sets genLat to the first array in generatedPoints
    let genLat = generatedPoints[0]
    //sets genLong to the second array in generatedPoints
    let genLong = generatedPoints[1]

    // checks the weather for all the coordinates in the arrays inputed, and retuns the coordinate and cloud percentage data as a nested array
    let clearSkyData = await map.findClearSkys(genLat, genLong);
    //sets listClearSkyLat to the first array in clearSkyData array
    let listClearSkysLat = clearSkyData[0]
    //sets listClearSkyLong to the second array in clearSkyData array
    let listClearSkysLong = clearSkyData[1]
    //sets listDataCloudy to the third array in clearSkyData array
    let listDataCloudy = clearSkyData[2]

    //initialises the closestPoint variable -> defualt variable is null
    let closestPoint = null;

    //find the coordinates to the center
    closestPoint = map.closestToCenterPoint(listClearSkysLat, listClearSkysLong, locationCoordinates[0], locationCoordinates[1])

    //an object with all the data necessary to render the maps markers
    let data = {
        locationName,
        locationCoordinates,
        rangeKm,
        closestPoint
    }

    //reders the location.ejs file with the variables title and data
    res.render('location', {title: "Stargazer", data: data})
});

module.exports = mapRouter;
