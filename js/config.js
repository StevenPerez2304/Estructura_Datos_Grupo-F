// ==============================================
// config.js
// Constantes globales: ubicación, grilla 3D del espacio aéreo,
// modelo de consumo de batería, colores por capa y zonas de
// espacio aéreo restringido. No depende de ningún otro archivo.
// ==============================================

const CENTER = [-3.9931, -79.2042]; // Loja, Ecuador

// Grilla 3D del espacio aéreo: 30x30 nodos x 5 capas de altitud = 4500 nodos.
// Aumentar ROWS/COLS = más densidad en la misma área.
// Aumentar SPAN_LAT/SPAN_LON = cubrir más terreno (con el mismo número de nodos, quedan más separados).
const ROWS = 30, COLS = 30;
const ALTS = [50, 75, 100, 125, 150];
const SPAN_LAT = 0.015, SPAN_LON = 0.018;
const latMin = CENTER[0] - SPAN_LAT/2, lonMin = CENTER[1] - SPAN_LON/2;
const stepLat = SPAN_LAT/(ROWS-1), stepLon = SPAN_LON/(COLS-1);

// Modelo de consumo de batería por capa (volar más alto = más viento/energía)
const ENERGY_FACTOR = {50:1.00, 75:1.12, 100:1.25, 125:1.40, 150:1.55};
// Antes: 0.08 (equivalente a 80 m), pero el desnivel REAL entre capas es de
// solo 25 m (ver ALTS arriba: 50->75->100->125->150). Ese valor inflado
// penalizaba subir/bajar de capa ~3.2x más de lo físicamente correcto, y
// por eso Dijkstra terminaba SIEMPRE rodeando los edificios en vez de
// sobrevolarlos, incluso cuando volar por encima era la ruta más corta.
// Se corrige a 0.03 (25 m reales + un pequeño extra por la maniobra de
// ascenso/descenso), para que "subir de capa" compita en igualdad de
// condiciones con "rodear" y el algoritmo elija de verdad la mejor opción.
const CLIMB_COST = 0.03; // costo fijo (km equivalentes) por subir o bajar un nivel de altitud

// Viento predominante (sopla de oeste a este). Sin esto, una ruta que nunca
// cambia de altitud pesa EXACTAMENTE igual sin importar la preferencia del
// slider (porque el factor de energía es el mismo para toda la ruta). Con
// el viento, volar a favor (hacia el este) cuesta menos batería y en contra
// (hacia el oeste) cuesta más — así el slider SIEMPRE tiene efecto, incluso
// en tramos completamente despejados sin edificios de por medio.
const WIND_TAILWIND_BONUS = 0.30;   // volar a favor del viento: -30% costo
const WIND_HEADWIND_PENALTY = 0.55; // volar en contra del viento: +55% costo

// Colores por capa — ÚNICA fuente de verdad, reutilizada por edificios,
// tramos de ruta y la leyenda del panel, para que todo coincida siempre.
const layerColor = {50:'#453ddc', 75:'#3d9adc', 100:'#7c088e', 125:'#c9088e', 150:'#e6543a'};
function colorForAlt(alt){ return layerColor[alt] || '#c98b52'; }

// Zonas de espacio aéreo restringido (ej. aeropuerto/zona militar).
// A diferencia de los edificios, estas bloquean las capas indicadas
// independientemente de si hay una construcción real ahí debajo.
const AIRSPACE_ZONES = [
  {lat: CENTER[0]+0.003, lon: CENTER[1]+0.002, radiusKm: 0.25, alts:['all']},
  {lat: CENTER[0]-0.003, lon: CENTER[1]-0.002, radiusKm: 0.20, alts:[50, 75, 100]}
];

// ------------------------------------------------------------------
// ZONAS DE ALTURA FIJA POR COLOR
// ------------------------------------------------------------------
// En vez de sortear la altura de CADA edificio al azar, los edificios que
// caen dentro de uno de estos rectángulos reciben una altura fija según
// el color de la zona:
//   azul     -> capa más alta disponible - 20 m (el dron pasa justo por encima)
//   morada   -> 115 m
//   naranja  -> 100 m
//   amarilla -> 60 m
//
//   1) Abre index.html, mantén presionada la tecla Shift y haz clic sobre
//      las esquinas del edificio que te interesa marcar.
//   2) El mensaje del panel (y la consola del navegador, F12) mostrarán
//      la coordenada exacta (lat, lon) de ese clic.
//   3) Reemplaza latMin/latMax/lonMin/lonMax de la zona correspondiente
//      aquí abajo con esos valores.
const HEIGHT_ZONE_ALT = {
  azul: Math.max(...ALTS) - 20, // 150 - 20 = 130 m
  morada: 115,
  naranja: 100,
  amarilla: 60
};

const HEIGHT_ZONES = [
  {color:'azul',     latMin:-3.994360, latMax:-3.992170, lonMin:-79.204308, lonMax:-79.202454},
  {color:'azul',     latMin:-3.993880, latMax:-3.992095, lonMin:-79.200834, lonMax:-79.198296},
  {color:'azul',     latMin:-3.998260, latMax:-3.995755, lonMin:-79.203210, lonMax:-79.200834},
  {color:'morada',   latMin:-3.989740, latMax:-3.987625, lonMin:-79.213020, lonMax:-79.210680},
  {color:'morada',   latMin:-3.994615, latMax:-3.991120, lonMin:-79.208214, lonMax:-79.205406},
  {color:'morada',   latMin:-4.000540, latMax:-3.998995, lonMin:-79.206684, lonMax:-79.203048},
  {color:'morada',   latMin:-3.999565, latMax:-3.997210, lonMin:-79.198386, lonMax:-79.195254},
  {color:'naranja',  latMin:-3.994615, latMax:-3.992575, lonMin:-79.212102, lonMax:-79.209726},
  {color:'naranja',  latMin:-3.997450, latMax:-3.995425, lonMin:-79.212516, lonMax:-79.210230},
  {color:'naranja',  latMin:-4.000135, latMax:-3.998110, lonMin:-79.211004, lonMax:-79.208628},
  {color:'amarilla', latMin:-3.990310, latMax:-3.988030, lonMin:-79.208880, lonMax:-79.206090},
  {color:'amarilla', latMin:-3.990310, latMax:-3.988030, lonMin:-79.198044, lonMax:-79.195254}
];
