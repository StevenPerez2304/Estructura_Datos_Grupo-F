// ==============================================
// graph.js
// Construye el grafo 3D del espacio aéreo: un nodo por cada
// (fila, columna, altitud), conectado con hasta 8 vecinos horizontales
// en la misma capa y 1 vecino vertical (capa de arriba/abajo). Los nodos
// dentro de un edificio o de una zona de espacio aéreo restringido se
// marcan como bloqueados y quedan fuera del grafo.
//
// Depende de: config.js (ROWS, COLS, ALTS, latMin, lonMin, stepLat,
//             stepLon, AIRSPACE_ZONES, CLIMB_COST)
//             geo-utils.js (haversineKm)
//             buildings.js (isBlockedByBuilding)
// ==============================================

const nodeId = (r,c,alt)=>`${r}_${c}_${alt}`;
const nodePos = {}; // id -> {lat,lon,alt,r,c}
const blocked = new Set();
const adj = {}; // id -> [{to, dist, edgeType:'h'|'v'}]

function addEdge(a,b,dist,type){
  if(blocked.has(a)||blocked.has(b)) return;
  (adj[a]=adj[a]||[]).push({to:b, dist, edgeType:type});
  (adj[b]=adj[b]||[]).push({to:a, dist, edgeType:type});
}

// 8 direcciones (incluye diagonales) para los vecinos horizontales
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

function isBlockedByAirspace(lat, lon, alt){
  for(const z of AIRSPACE_ZONES){
    if((z.alts.includes('all') || z.alts.includes(alt)) && haversineKm(lat,lon,z.lat,z.lon) <= z.radiusKm) return true;
  }
  return false;
}

function buildGraph(){
  // 1) marcar nodos bloqueados
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const lat = latMin + r*stepLat, lon = lonMin + c*stepLon;
      for(const alt of ALTS){
        const id = nodeId(r,c,alt);
        nodePos[id] = {lat,lon,alt,r,c};
        if(isBlockedByAirspace(lat,lon,alt) || isBlockedByBuilding(lat,lon,alt)){
          blocked.add(id);
        }
      }
    }
  }
  // 2) conectar nodos no bloqueados
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      for(const alt of ALTS){
        const id = nodeId(r,c,alt);
        if(blocked.has(id)) continue;
        for(const [dr,dc] of DIRS){
          const nr=r+dr, nc=c+dc;
          if(nr<0||nr>=ROWS||nc<0||nc>=COLS) continue;
          if(nr>r || (nr===r && nc>c)){ // evita duplicar la misma arista dos veces
            const nid = nodeId(nr,nc,alt);
            if(blocked.has(nid)) continue;
            const d = haversineKm(nodePos[id].lat,nodePos[id].lon,nodePos[nid].lat,nodePos[nid].lon);
            addEdge(id,nid,d,'h');
          }
        }
        const altIdx = ALTS.indexOf(alt);
        if(altIdx < ALTS.length-1){
          const upId = nodeId(r,c,ALTS[altIdx+1]);
          if(!blocked.has(upId)) addEdge(id, upId, CLIMB_COST, 'v');
        }
      }
    }
  }
}

// Encuentra el nodo libre más cercano a una coordenada real (clic del usuario)
function nearestNode(lat, lon, alt){
  let best=null, bestD=Infinity;
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const id = nodeId(r,c,alt);
    if(blocked.has(id)) continue;
    const d = haversineKm(lat,lon,nodePos[id].lat,nodePos[id].lon);
    if(d<bestD){bestD=d; best=id;}
  }
  return best;
}
