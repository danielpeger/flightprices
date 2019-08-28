const fs = require("fs");
const { permute, cartesian, arraysMatch } = require("./utils");
const { getCheapestFlight } = require("./getCheapestFlight");

const Europe = ["Sweden", "Georgia", "Italy", "Ponta Delgada"];
const NorthAmerica = ["Montreal", "Portland", "Los Angeles"];
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

const A = ["Montreal", "Portland"];
const B = ["Thailand", "Indonesia"];
const permuted = permute([A, B]);
let variableRoutes = [];
for (let i = 0; i < permuted.length; i++) {
  variableRoutes = [
    ...variableRoutes,
    ...cartesian(permuted[i][0], permuted[i][1])
  ];
}
const testRoutes = variableRoutes.map(e => ["Budapest", ...e, "Budapest"]);
console.log(testRoutes);
async function run() {
  for (let i = 0; i < testRoutes.length; i++) {
    await priceOfRoute(testRoutes[i]);
  }
}

run();

async function priceOfRoute(route) {
  let results = require("./results.json");
  const resultAlreadyExists = results.find(e => arraysMatch(e.route, route));
  if (resultAlreadyExists) {
    console.log("\x1b[33m%s\x1b[0m", `Result for ${route} already saved.`);
  } else {
    console.log("\x1b[33m%s\x1b[0m", `Querying prices for ${route}...`);
    let routePrice = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const cheapestFlight = await getCheapestFlight(route[i], route[i + 1]);
      routePrice += cheapestFlight.price;
    }
    console.log("\x1b[32m%s\x1b[0m", `${route} route costs ${routePrice}Ft.`);
    const result = {
      route: route,
      price: routePrice
    };
    results = [...results, result];
    fs.writeFile("results.json", JSON.stringify(results), "utf8", err => {
      if (err) throw err;
      console.log(`Result saved.`);
    });
    return result;
  }
}
