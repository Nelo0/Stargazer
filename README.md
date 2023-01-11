# Stargazer

Stargazer is a webapp for finding areas with clear sky's near a specified area

## Logic

- This webapp recieves a location name and search radius in kilometers from the user

- The location name is then foward geocoded via the https://positionstack.com/ api into coordinates

- Using the location coordinates and the search radius, the coordinates of 2 opposite corners of a searchbox with side length of radius * 2 and the location coordinates as its centerpoint.

- We divide the searchbox area by an area of 25km squared (an area that could potentially have a diffrence in climate) into n number of sections (we round up to an even integer).
This reduces the amount of points that we need to get weather data for.

- Then generate n - 1 number of random coordinates within the searchbox area that are at least 5km from each other. (n - 1 because if we try to generate the maximum number of points within the searchbox, it becomes significantly less likely we randomly find the coordinates that fit our requirements)

- Then get the cloud percentage for each of the generated coordinates using the https://www.weatherapi.com/ api, if the cloud percentage is <= 20%, we store the coordinates

- We then get the distance between the each coordinates and the centerpoint/user coordinates, storing the coordinate thats closest to the user

- Then we display the output on a map using https://leafletjs.com/ and https://www.openstreetmap.org/

## Stack

I used:
1. Nodejs for backend
2. Express for routing
3. Leaflet https://leafletjs.com/ for maps

## APIs

This application calls 2 free apis for its data

1. https://www.weatherapi.com/
- You need to create a free account and add your api key to a .env file in the root of the app as WEATHER_ACCESS_KEY

2. https://positionstack.com/
- You need to create a free account and add your api key to a .env file in the root of the app as GEO_ACCESS_KEY


## Usage

Download this repo and install all the dependancies by running this command from the root of the directory in your terminal

```bash
npm install
```
Create a .env file in the root of the directory and add your api keys to it (view APIs section above)

```
WEATHER_ACCESS_KEY="<YOUR ACCESS KEY HERE>"
GEO_ACCESS_KEY="<YOUR ACCESS KEY HERE>"
```

To run the webapp enter this command from the root of the directory in your terminal.

```bash
npm run start
```

This will then run the app in localhost:3000

## Contributing
I open to any contributions that would improve the project or any adivce etc. in general to help imporve my skills.
