// ==============================================
// main.js
// Punto de entrada del proyecto. Orquesta la carga inicial (edificios +
// construcción del grafo), maneja los eventos del usuario (clics en el
// mapa, botones, slider) y ejecuta runRoute(), que vuelve a llamar a
// dijkstra() cada vez que cambia el origen/destino o la preferencia de
// ruta (más corta vs. ahorro de batería).
//
// Depende de TODOS los archivos anteriores — se carga último.
// ==============================================

let originPt = null, destPt = null;
let lastRouteCoords = null, lastRouteCost = 0;
const msg = document.getElementById('msg');
let graphReady = false;

async function init(){
  msg.textContent = 'Cargando infraestructura urbana de Loja (OpenStreetMap)…';
  try{
    buildings = await fetchBuildings();
  } catch(err){
    buildings = [];
    msg.textContent = 'Aviso: no se pudo conectar con Overpass. Se continúa solo con zonas restringidas.';
  }
  buildGraph();
  drawZones();
  drawBuildings();
  drawGrid();
  graphReady = true;
  msg.textContent = `Listo. Edificios: ${buildings.length}. Nodos del grafo: ${ROWS*COLS*ALTS.length}. Haz clic para elegir un origen.`;
}
init();

map.on('click', e=>{
  // Herramienta de calibración: Shift + clic muestra la coordenada exacta,
  // sin afectar la selección de origen/destino. Úsala para ajustar los
  // bordes de las zonas de altura (HEIGHT_ZONES en config.js).
  if(e.originalEvent && e.originalEvent.shiftKey){
    const lat = e.latlng.lat.toFixed(6), lon = e.latlng.lng.toFixed(6);
    console.log('Coordenada:', lat, lon);
    msg.textContent = `Coordenada (Shift+clic): lat ${lat}, lon ${lon} — cópiala en HEIGHT_ZONES.`;
    return;
  }
  if(!graphReady) return;
  if(!originPt){
    originPt = e.latlng;
    layers.points.clearLayers();
    L.marker(originPt,{title:'Origen'}).addTo(layers.points).bindTooltip('Origen', {permanent:true, direction:'top'});
    msg.textContent = 'Ahora haz clic en el destino.';
  } else if(!destPt){
    destPt = e.latlng;
    L.marker(destPt,{title:'Destino'}).addTo(layers.points).bindTooltip('Destino', {permanent:true, direction:'top'});
    runRoute();
  }
});

document.getElementById('resetBtn').onclick = ()=>{
  stopDroneAnimation();
  clearDroneVisuals();
  originPt=null; destPt=null;
  lastRouteCoords=null; lastRouteCost=0;
  layers.points.clearLayers(); layers.route.clearLayers();
  document.getElementById('stats').style.display='none';
  msg.textContent = 'Puntos reiniciados. Haz clic para elegir un origen.';
};

// Cada vez que el usuario mueve el slider, se vuelve a calcular la ruta
// con el mismo origen/destino pero un "batteryPref" distinto — así se ve
// en vivo cómo cambia entre la ruta más corta y la de ahorro de batería.
document.getElementById('weightSlider').oninput = ()=>{ if(originPt && destPt) runRoute(); };

document.getElementById('animateBtn').onclick = ()=>{
  if(animationActive) return;
  if(!lastRouteCoords){ msg.textContent = 'Primero calcula una ruta.'; return; }
  startDroneAnimation(lastRouteCoords, lastRouteCost);
};

function runRoute(){
  stopDroneAnimation();
  clearDroneVisuals();
  layers.route.clearLayers();

  const batteryPref = document.getElementById('weightSlider').value/100;
  const startId = nearestNode(originPt.lat, originPt.lng, 50);
  const endId = nearestNode(destPt.lat, destPt.lng, 50);

  const result = dijkstra(startId, endId, batteryPref);
  if(!result){
    msg.textContent = 'No se encontró ruta posible (zonas restringidas o edificios bloquean el paso).';
    document.getElementById('stats').style.display='none';
    return;
  }

  // dibujar segmentos coloreados por altitud, con el MISMO mapa de color
  // que se usa para los edificios y la leyenda (colorForAlt, en config.js)
  const coords = [originPt, ...result.path.map(id=>L.latLng(nodePos[id].lat, nodePos[id].lon)), destPt];
  let totalDist = 0, climbs = 0;
  for(let i=0;i<coords.length-1;i++){
    let color = colorForAlt(50);
    if(i>0 && i<result.path.length){
      color = colorForAlt(nodePos[result.path[i]].alt);
    }
    L.polyline([coords[i],coords[i+1]], {color, weight:4, opacity:0.9}).addTo(layers.route);
    totalDist += haversineKm(coords[i].lat,coords[i].lng,coords[i+1].lat,coords[i+1].lng);
  }
  for(let i=1;i<result.path.length;i++){
    if(nodePos[result.path[i]].alt !== nodePos[result.path[i-1]].alt) climbs++;
  }

  // Perfil de altitud: secuencia de capas distintas y consecutivas que
  // atraviesa la ruta (ej. "50m → 100m → 50m"). Sirve como confirmación
  // explícita de si el dron cambió de altura, sin depender solo del color.
  const profile = [];
  for(const id of result.path){
    const a = nodePos[id].alt;
    if(profile.length === 0 || profile[profile.length-1] !== a) profile.push(a);
  }
  document.getElementById('statProfile').textContent = profile.map(a=>a+'m').join(' → ');

  document.getElementById('statDist').textContent = totalDist.toFixed(2)+' km';
  document.getElementById('statClimb').textContent = climbs;
  document.getElementById('statCost').textContent = result.cost.toFixed(3);
  document.getElementById('statNodes').textContent = result.explored;
  document.getElementById('statBattery').textContent = '100 %';
  document.getElementById('stats').style.display = 'block';
  msg.textContent = 'Ruta calculada. Presiona "Animar recorrido" o ajusta la preferencia para recalcular.';

  lastRouteCoords = coords;
  // OJO: para la animación/batería usamos el consumo REAL de la ruta
  // (pathRealBatteryCost), no result.cost. result.cost es el puntaje de
  // OPTIMIZACIÓN usado internamente por Dijkstra para comparar aristas
  // según el slider, y su magnitud no es un "% de batería" comparable
  // entre preferencias distintas (por eso "ahorro de batería" podía
  // mostrar un % de consumo mayor que "ruta más corta").
  lastRouteCost = pathRealBatteryCost(result.path);
}
