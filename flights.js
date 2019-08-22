const fetch = require("node-fetch");

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
		return;
	} else {
		const sessionKey = location.substring(
	    location.lastIndexOf("/") + 1,
	    location.length
	  );
	  console.log(`Got ${from}->${to} session key.`);
	  setTimeout(async function() {
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
			if (json.Itineraries) {
				const price = Math.round(json.Itineraries[0].PricingOptions[0].Price);
				console.log(`${from}->${to} is ${price}Ft.`);
			} else {
				console.log(`No ${from}->${to} itineraries found.`);
			}
	  }, 10000);
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
			airportIDs = [...airportIDs, places[i].PlaceId]
		}
	}
	return airportIDs;
}

function* cartesian(head, ...tail) {
  let remainder = tail.length ? cartesian(...tail) : [[]];
  for (let r of remainder) for (let h of head) yield [h, ...r];
}

async function getCombinations(from, to){
	const fromResult = await getAirportIDs(from);
	const toResult = await getAirportIDs(to);
	return [...cartesian(fromResult, toResult)];
}

getCombinations("Hungary", "Madagascar").then(res => console.log(res));

// getTicketPrice(from, to).catch(err => {
//   console.error(err);
// });
