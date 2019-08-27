const fs = require("fs");
const { getAirports } = require("./getAirports");
const { priceOfFlight } = require("./priceOfFlight");

async function getCheapestFlight(from, to) {
  const airports = await getAirports(from, to);
  let flights = [];
  for (let i = 0; i < airports.length; i++) {
    const price = await priceOfFlight(airports[i][0], airports[i][1]);
    if (price) {
      flights = [
        ...flights,
        {
          from: airports[i][0],
          to: airports[i][1],
          price: price
        }
      ];
    }
  }
  const cheapest = flights.reduce(function(prev, current) {
    return prev.price < current.price ? prev : current;
  });
  const airportsToCache = flights.filter(function(element) {
    return element.price < cheapest.price * 1.2;
  });
  if (airportsToCache) {
    let cache = require("./cache.json");
    const cachedRoute = cache.find(function(element) {
      return element.from === from && element.to === to;
    });
    const cachedRouteBackwards = cache.find(function(element) {
      return element.to === from && element.from === to;
    });
    if (cachedRoute || cachedRouteBackwards) {
      console.log("Optimal airports already cached.");
    } else {
      const toCache = {
        from: from,
        to: to,
        optimal: []
      };
      for (let i = 0; i < airportsToCache.length; i++) {
        toCache.optimal = [
          ...toCache.optimal,
          [airportsToCache[i].from, airportsToCache[i].to]
        ];
      }
      cache = [...cache, toCache];
      fs.writeFile("cache.json", JSON.stringify(cache), "utf8", err => {
        if (err) throw err;
        console.log(
          `Optimal airports between ${from} and ${to} have been cached.`
        );
      });
    }
  }
  console.log(
    "\x1b[33m%s\x1b[0m",
    `Cheapest flight from ${from} to ${to} is ${cheapest.from}->${cheapest.to} for ${cheapest.price}Ft.`
  );
  return cheapest;
}

exports.getCheapestFlight = getCheapestFlight;
