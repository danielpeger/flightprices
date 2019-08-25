const { permute } = require("./permute");
const { cartesian } = require("./cartesian");
const { getAirports } = require("./getAirports");
const { getTicketPrice } = require("./getTicketPrice");

async function getCheapestFlight(from, to) {
  const airports = await getAirports(from, to);
  let flights = [];
  for (let i = 0; i < airports.length; i++) {
    const price = await getTicketPrice(airports[i][0], airports[i][1]);
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
  console.log(
    "\x1b[33m%s\x1b[0m",
    `Cheapest flight from ${from} to ${to} is ${cheapest.from}->${cheapest.to} for ${cheapest.price}Ft.`
  );
  return cheapest;
}

const Europe = ["Sweden", "Georgia", "Italy", "Ponta Delgada"];
const NorthAmerica = ["Montreal", "Portland"];
const SouthAmerica = [
  "Peru",
  "Uruguay",
  "Mexico",
  "Brazil",
  "Costa Rica",
  "Ecuador"
];
const Africa = ["Madagascar", "Mauritius", "Rwanda", "Tanzania"];
const Asia = ["Thailand", "Indonesia", "South Korea"];
const Oceania = ["Tasmania", "Melbourne", "Gold Coast"];
const Contintents = [Europe, NorthAmerica, SouthAmerica, Africa, Asia, Oceania];

let testRoute = [...cartesian(Europe, Africa)][0];
testRoute = ["Budapest", "Berlin", "Budapest"];

async function priceOfRoute(route) {
  console.log("\x1b[33m%s\x1b[0m", `Querying prices for ${route}...`);
  let routePrice = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const cheapestFlight = await getCheapestFlight(route[i], route[i + 1]);
    routePrice += cheapestFlight.price;
  }
  console.log("\x1b[32m%s\x1b[0m", `${route} route costs ${routePrice}Ft.`);
  return routePrice;
}

priceOfRoute(testRoute);

//TODO: Write cache
