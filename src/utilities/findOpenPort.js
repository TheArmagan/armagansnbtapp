const fetch = require("node-fetch").default;

async function findOpenPort(point = 8987) {
  console.log(`Checking port ${point}.`);
  let isInUse = false;
  try {
    isInUse = await fetch(`http://127.0.0.1:${point}`, { timeout: 250 }).then(d => {
      return d.status == 200
    })
  } catch { };
  if (isInUse) {
    console.log(`Port ${point} in use.`);
    return await findOpenPort(++point);
  } else {
    console.log(`Free port ${point} found.`);
    return point;
  }
}

module.exports = findOpenPort;