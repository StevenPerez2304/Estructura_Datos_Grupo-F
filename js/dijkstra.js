// ==============================================
// dijkstra.js
// LA VARIANTE DEL ALGORITMO. Es Dijkstra clásico (cola de prioridad +
// relajación de aristas) pero el peso de cada arista no es solo
// distancia: se combina con el factor de energía de la capa de destino.
// El parámetro "batteryPref" (0 a 1, controlado por el slider del panel)
// decide cuánto pesa el ahorro de batería frente a la distancia pura:
//   batteryPref = 0   -> ruta más corta en distancia (Dijkstra clásico)
//   batteryPref = 1   -> ruta que más ahorra batería, aunque sea más larga
// Con esto, la MISMA función de Dijkstra devuelve rutas distintas según
// la preferencia, y con edificios de altura aleatoria (buildings.js) el
// algoritmo se ve obligado a elegir entre "rodear" (más distancia, menos
// energía) o "sobrevolar" (menos distancia, más energía) según el caso.
//
// Depende de: config.js (ENERGY_FACTOR)
//             graph.js (nodePos, adj)
// ==============================================

// peso(arista) = distancia * factor_energía(altitud_destino) * factor_viento
//              * (según preferencia)
// El factor de energía depende de la altitud del tramo (solo importa si el
// dron cambia de capa). El factor de viento depende de la dirección del
// tramo, y actúa incluso cuando el dron nunca cambia de altitud — así el
// slider siempre tiene efecto sobre la ruta, con o sin obstáculos de por medio.
function computeWeight(fromId, edge, batteryPref){
  const toAlt = nodePos[edge.to].alt;
  if(edge.edgeType === 'v') return edge.dist * (1 + batteryPref*2.0); // subir/bajar cuesta más si se prioriza batería
  const factor = ENERGY_FACTOR[toAlt];
  const altBlend = 1 + batteryPref*(factor-1);
  const wind = windFactor(nodePos[fromId], nodePos[edge.to], batteryPref);
  return edge.dist * altBlend * wind;
}

// ------------------------------------------------------------------
// CONSUMO REAL DE BATERÍA (para la animación / estadística mostrada)
// ------------------------------------------------------------------
// computeWeight() de arriba NO sirve para esto: es un costo de
// OPTIMIZACIÓN que se escala con batteryPref, así que su magnitud
// cambia de significado según la preferencia (a veces sube, a veces
// baja, según el viento del tramo). Usar ese número directo como "%
// de batería" es lo que causaba el error reportado: con "ahorro de
// batería" (batteryPref=1) el número podía salir MÁS alto que con
// "ruta más corta" (batteryPref=0), aunque la ruta elegida en modo
// ahorro consuma realmente menos energía.
//
// Aquí se calcula el consumo FÍSICO real de la ruta ya elegida, con
// el factor de energía y el viento aplicados al 100% (sin escalarlos
// por batteryPref), para que sea un número comparable entre rutas sin
// importar qué preferencia se usó para encontrarlas.
function computeRealWeight(fromId, edge){
  const toAlt = nodePos[edge.to].alt;
  if(edge.edgeType === 'v') return edge.dist; // costo físico de subir/bajar, sin escalar
  const factor = ENERGY_FACTOR[toAlt];
  const wind = windFactor(nodePos[fromId], nodePos[edge.to], 1); // viento al 100%, siempre real
  return edge.dist * factor * wind;
}

function pathRealBatteryCost(path, batteryPref){
  let total = 0;
  for(let i=1;i<path.length;i++){
    const fromId = path[i-1], toId = path[i];
    const edge = (adj[fromId]||[]).find(e=>e.to===toId);
    if(edge) total += computeRealWeight(fromId, edge);
  }
  // Ruta más corta = vuelo directo y rápido = más demanda de batería.
  // Ahorro de batería = vuelo lento y económico = menos demanda.
  // (ver speedEnergyFactor en config.js)
  return total * speedEnergyFactor(batteryPref);
}

function dijkstra(startId, endId, batteryPref){
  const dist = {}, prev = {}, visited = new Set();
  dist[startId] = 0;
  let frontier = [{id:startId, d:0}];
  let explored = 0;

  while(frontier.length){
    frontier.sort((a,b)=>a.d-b.d); // cola de prioridad simple (suficiente para ~4500 nodos)
    const {id:u} = frontier.shift();
    if(visited.has(u)) continue;
    visited.add(u); explored++;
    if(u === endId) break;
    for(const edge of (adj[u]||[])){
      if(visited.has(edge.to)) continue;
      const w = computeWeight(u, edge, batteryPref);
      const nd = dist[u] + w;
      if(dist[edge.to] === undefined || nd < dist[edge.to]){
        dist[edge.to] = nd;
        prev[edge.to] = u;
        frontier.push({id:edge.to, d:nd});
      }
    }
  }

  if(dist[endId] === undefined) return null; // no hay camino posible
  const path = [];
  let cur = endId;
  while(cur !== undefined){ path.unshift(cur); cur = prev[cur]; }
  return {path, cost:dist[endId], explored};
}
