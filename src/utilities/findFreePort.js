const fetch = require("node-fetch").default;

async function findFreePort(point = 1025) {
  let isInUse = false;
  try {
    isInUse = await fetch(`http://127.0.0.1:${point}`, { timeout: 250 }).then(d => {
      return d.status == 200
    })
  } catch { };
  if (isInUse) {
    return await findFreePort(++point);
  } else {
    return point;
  }
}

module.exports = findFreePort;