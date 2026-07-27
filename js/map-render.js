// ==============================================
// map-render.js
// Inicializa el mapa de Leaflet (mapa base de OpenStreetMap) y expone
// las funciones que dibujan las capas visuales: zonas restringidas,
// edificios (coloreados según su altura aleatoria) y la grilla de nodos.
//
// Depende de: Leaflet (variable global L, cargada desde CDN en index.html)
//             config.js (CENTER, AIRSPACE_ZONES, colorForAlt)
//             graph.js (nodeId, nodePos, blocked, ROWS, COLS)
//             buildings.js (buildings)
// ==============================================

const map = L.map('map', {zoomControl:true}).setView(CENTER, 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom:19
}).addTo(map);

const layers = {
  buildings: L.layerGroup().addTo(map),
  grid: L.layerGroup().addTo(map),
  zones: L.layerGroup().addTo(map),
  route: L.layerGroup().addTo(map),
  points: L.layerGroup().addTo(map)
};

function drawZones(){
  for(const z of AIRSPACE_ZONES){
    L.circle([z.lat,z.lon], {radius:z.radiusKm*1000, color:'#e6743a', fillColor:'#e6743a', fillOpacity:0.15, weight:1.5}).addTo(layers.zones);
  }
}

function drawBuildings(){
  for(const b of buildings){
    // mismo color que usará la ruta si el dron vuela justo por encima de este edificio
    const col = colorForAlt(b.maxAlt);
    L.polygon(b.coords, {color:col, weight:1, fillColor:col, fillOpacity:0.4}).addTo(layers.buildings);
  }
}

function drawGrid(){
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const id = nodeId(r,c,50);
    const p = nodePos[id];
    L.circleMarker([p.lat,p.lon], {radius:1.2, color: blocked.has(id) ? '#e6543a' : '#33473b', weight:1, fillOpacity: blocked.has(id)?0.9:0.4}).addTo(layers.grid);
  }
}
