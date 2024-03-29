const { cartesian } = require("./utils");
const fetch = require("node-fetch");

async function getAirportIDs(query) {
  const response = await fetch(
    `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/HU/HUF/en-US/?query=${query}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host":
          "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "de35fcd005msh6f281908e7d370bp158a1ajsn4b97dc4e3d15"
      }
    }
  );
  const json = await response.json();
  const places = json.Places;
  let airportIDs = [];
  for (var i = 0; i < places.length; i++) {
    if (places[i].CityId.length > 4) {
      airportIDs = [...airportIDs, places[i].PlaceId];
    }
  }
  return airportIDs;
}

async function getAirports(from, to) {
  const cache = require("./cache.json");
  const cachedRoute = cache.find(function(element) {
    return element.from === from && element.to === to;
  });
  const cachedRouteBackwards = cache.find(function(element) {
    return element.to === from && element.from === to;
  });
  if (cachedRoute) {
    return cachedRoute.optimal;
  } else if (cachedRouteBackwards) {
    return cachedRouteBackwards.optimal.map(e => e.slice().reverse());
  } else {
    const fromResult = await getAirportIDs(from);
    const toResult = await getAirportIDs(to);
    return [...cartesian(fromResult, toResult)];
  }
}

exports.getAirports = getAirports;
