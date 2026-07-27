// ==============================================
// geo-utils.js
// Funciones matemáticas puras de geografía: distancia entre coordenadas,
// punto-dentro-de-polígono y rumbo (bearing). No dependen de ningún
// otro archivo del proyecto.
// ==============================================

// Distancia en línea recta entre dos coordenadas (fórmula de Haversine)
function haversineKm(lat1,lon1,lat2,lon2){
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// Ray casting: ¿el punto (lat,lon) cae dentro del polígono "coords"?
// Se usa para saber si un nodo de la grilla está dentro de un edificio.
function pointInPolygon(lat, lon, coords){
  let inside = false;
  for(let i=0, j=coords.length-1; i<coords.length; j=i++){
    const [yi,xi] = coords[i], [yj,xj] = coords[j];
    const intersect = ((yi>lat) !== (yj>lat)) && (lon < (xj-xi)*(lat-yi)/(yj-yi)+xi);
    if(intersect) inside = !inside;
  }
  return inside;
}

// Rumbo en grados (0-360) desde el punto "a" hacia el punto "b"
// Se usa para rotar el ícono del dron durante la animación de vuelo.
function computeBearing(a, b){
  const lat1 = a.lat*Math.PI/180, lat2 = b.lat*Math.PI/180;
  const dLon = (b.lng-a.lng)*Math.PI/180;
  const y = Math.sin(dLon)*Math.cos(lat2);
  const x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
  const brng = Math.atan2(y,x)*180/Math.PI;
  return (brng+360)%360;
}

// Factor de viento: compara la longitud de origen y destino de un tramo
// horizontal. Volar hacia el este (a favor del viento) reduce el costo;
// volar hacia el oeste (en contra) lo aumenta. batteryPref controla cuánto
// pesa esto (en 0 no importa el viento, en 1 pesa al máximo).
function windFactor(fromPos, toPos, batteryPref){
  const dLon = toPos.lon - fromPos.lon;
  const align = dLon >= 0 ? -WIND_TAILWIND_BONUS : WIND_HEADWIND_PENALTY;
  return 1 + batteryPref*align;
}

