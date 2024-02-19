const fs = require("fs");

const mapData = {};

const hillData = [
  { x: 100, y: 550, width: 150, height: 60, flat: 50 },
  { x: 350, y: 550, width: 200, height: 80, flat: 50 },
  { x: 600, y: 550, width: 150, height: 60, flat: 50 },
  { x: 850, y: 550, width: 200, height: 80, flat: 50 },
  { x: 1100, y: 550, width: 150, height: 60, flat: 50 }
];

for (let x = 0; x <= 1199; x++) {
  mapData[x] = { y: 550, angle: 0 };
}

hillData.forEach((hill) => {
  const halfWidth = hill.width / 2;
  const startX = hill.x - halfWidth - hill.flat; 
  const endX = hill.x + halfWidth + hill.flat;    
  const topY = hill.y - hill.height;

  for (let x = startX; x < hill.x - halfWidth; x++) {
    mapData[x] = { y: 550, angle: 0 };
  }

  for (let x = hill.x - halfWidth; x <= hill.x; x++) {
    const proportion = (x - (hill.x - halfWidth)) / halfWidth;
    const y = hill.y - proportion * hill.height;
    const angle = Math.atan2(hill.height, halfWidth) * (180 / Math.PI);
    mapData[x] = { y, angle };
  }

  for (let x = hill.x; x <= hill.x + halfWidth; x++) {
    const proportion = (hill.x + halfWidth - x) / halfWidth;
    const y = hill.y - proportion * hill.height;
    const angle = -Math.atan2(hill.height, halfWidth) * (180 / Math.PI);
    mapData[x] = { y, angle };
  }

  for (let x = hill.x + halfWidth + 1; x <= endX; x++) {
    mapData[x] = { y: 550, angle: 0 };
  }
});

fs.writeFile("mapData.json", JSON.stringify(mapData, null, 2), (err) => {
  if (err) {
    console.log("Error writing file:", err);
  } else {
    console.log("File written successfully");
  }
});
