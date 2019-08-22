const fetch = require("node-fetch");
const sleep = require("util").promisify(setTimeout);

async function getTicketPrice(from, to) {
  const date = "2020-06-01";
  const adults = 2;
  const sessionQuery = `country=HU&currency=HUF&locale=en-US&originPlace=${from}&destinationPlace=${to}&outboundDate=${date}&adults=${adults}`;
  const sessionResponse = await fetch(
    "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/v1.0",
    {
      method: "POST",
      headers: {
        "x-rapidapi-host":
          "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "de35fcd005msh6f281908e7d370bp158a1ajsn4b97dc4e3d15",
        "content-type": "application/x-www-form-urlencoded"
      },
      body: sessionQuery
    }
  );
  const location = await sessionResponse.headers.get("location");
  if (!location) {
    console.log(`No flight from ${from} to ${to}.`);
  } else {
    const sessionKey = location.substring(
      location.lastIndexOf("/") + 1,
      location.length
    );
    console.log(`Got ${from}->${to} session key.`);
    await sleep(10000);
    const pollResponse = await fetch(
      `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/uk2/v1.0/${sessionKey}?sortType=price&sortOrder=asc&pageIndex=0&pageSize=1`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host":
            "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
          "x-rapidapi-key": "de35fcd005msh6f281908e7d370bp158a1ajsn4b97dc4e3d15"
        }
      }
    );
    const json = await pollResponse.json();
    if (json.Itineraries[0]) {
      const price = Math.round(json.Itineraries[0].PricingOptions[0].Price);
      console.log(`${from}->${to} is ${price}Ft.`);
      return price;
    } else {
      console.log(`No ${from}->${to} itineraries found.`);
    }
  }
}

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

function* cartesian(head, ...tail) {
  let remainder = tail.length ? cartesian(...tail) : [[]];
  for (let r of remainder) for (let h of head) yield [h, ...r];
}

async function getAirportCombos(from, to) {
  const fromResult = await getAirportIDs(from);
  const toResult = await getAirportIDs(to);
  return [...cartesian(fromResult, toResult)];
}

async function getCheapestFlight(from, to) {
  const combos = await getAirportCombos(from, to);
  let flights = [];
  for (let i = 0; i < combos.length; i++) {
    const price = await getTicketPrice(combos[i][0], combos[i][1]);
    if (price) {
      flights = [
        ...flights,
        {
          from: combos[i][0],
          to: combos[i][1],
          price: price
        }
      ];
    }
  }
  const cheapest = flights.reduce(function(prev, current) {
    return prev.price < current.price ? prev : current;
  });
  console.log(
    "\x1b[33m%s\x1b[0m",
    `Cheapest flight from ${from} to ${to} is ${cheapest.from}->${
      cheapest.to
    } for ${cheapest.price}Ft`
  );
  return cheapest;
}

getCheapestFlight("Budapest", "Colombia");
