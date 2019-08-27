const { permute } = require("./permute");
const { cartesian } = require("./cartesian");
const { getCheapestFlight } = require("./getCheapestFlight");

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
const Asia = ["Thailand", "Indonesia"];
const Oceania = ["Tasmania", "Melbourne", "Gold Coast"];
const Contintents = [Europe, NorthAmerica, SouthAmerica, Africa, Asia, Oceania];

let testRoute = [...cartesian(Europe, Africa)][0];
testRoute = ["Budapest", "Malaysia", "Budapest"];

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
