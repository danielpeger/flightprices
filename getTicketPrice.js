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
    console.log(`Got ${from}->${to} session key...`);
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

exports.getTicketPrice = getTicketPrice;
