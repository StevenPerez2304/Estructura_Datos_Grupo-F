// ==============================================
// buildings.js
// Obtiene edificios reales de OpenStreetMap a través de Overpass API
// (la interfaz de consultas de OSM) y les asigna una ALTURA ALEATORIA,
// sorteada entre los 5 niveles de la grilla (ALTS). Esto es necesario
// porque Overpass casi nunca trae el dato real de altura, y además
// permite variar los obstáculos en cada carga para poner a prueba el
// algoritmo con distintos escenarios cada vez que se recarga la página.
//
// Depende de: config.js (latMin, lonMin, SPAN_LAT, SPAN_LON, ALTS)
//             geo-utils.js (pointInPolygon)
// ==============================================

let buildings = []; // [{coords:[[lat,lon],...], maxAlt}]

// Centroide simple de un polígono (promedio de sus vértices) — suficiente
// para decidir en qué zona de altura cae el edificio.
function centroidOf(coords){
  let sLat=0, sLon=0;
  for(const [lat,lon] of coords){ sLat+=lat; sLon+=lon; }
  return {lat: sLat/coords.length, lon: sLon/coords.length};
}

// ¿El centroide del edificio cae dentro de alguna zona de altura fija?
// Devuelve la altura correspondiente al color de esa zona, o null si no
// cae en ninguna (en cuyo caso se sortea al azar, como antes).
function fixedAltForBuilding(centroid){
  for(const z of HEIGHT_ZONES){
    if(centroid.lat >= z.latMin && centroid.lat <= z.latMax &&
       centroid.lon >= z.lonMin && centroid.lon <= z.lonMax){
      return HEIGHT_ZONE_ALT[z.color];
    }
  }
  return null;
}

async function fetchBuildings(){
  const south = latMin, north = latMin+SPAN_LAT, west = lonMin, east = lonMin+SPAN_LON;
  const query = `[out:json][timeout:25];(way["building"](${south},${west},${north},${east}););out geom;`;
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  const res = await fetch(url);
  if(!res.ok) throw new Error('overpass error');
  const data = await res.json();
  const possibleAlts = ALTS; // fallback: el edificio puede "alcanzar" cualquiera de las 5 capas
  return data.elements
    .filter(el => el.type === 'way' && el.geometry)
    .map(el => {
      const coords = el.geometry.map(g => [g.lat, g.lon]);
      const centroid = centroidOf(coords);
      const fixed = fixedAltForBuilding(centroid);
      const maxAlt = fixed !== null ? fixed : possibleAlts[Math.floor(Math.random() * possibleAlts.length)];
      return {coords, maxAlt};
    });
}

// Un edificio bloquea todas las capas iguales o por debajo de su altura sorteada
// (ej. si maxAlt=100, bloquea 50/75/100 pero deja libres 125/150).
function isBlockedByBuilding(lat, lon, alt){
  for(const b of buildings){
    if(alt <= b.maxAlt && pointInPolygon(lat, lon, b.coords)) return true;
  }
  return false;
}
