// ==============================================
// drone-animation.js
// Simula el vuelo del dron sobre la ruta ya calculada, usando
// requestAnimationFrame: avanza a velocidad constante, rota el ícono
// según el rumbo de cada tramo, deja una estela y descarga la batería
// estimada en tiempo real.
//
// Depende de: map-render.js (map, layers)
//             geo-utils.js (haversineKm, computeBearing)
// ==============================================

let droneMarker = null, droneTrail = null, animationActive = false, animationRAF = null;

function clearDroneVisuals(){
  if(droneMarker){ map.removeLayer(droneMarker); droneMarker = null; }
  if(droneTrail){ layers.route.removeLayer(droneTrail); droneTrail = null; }
}

function stopDroneAnimation(){
  animationActive = false;
  if(animationRAF){ cancelAnimationFrame(animationRAF); animationRAF = null; }
}

function startDroneAnimation(pathCoords, routeCost, cruiseSpeedMps){
  stopDroneAnimation();
  clearDroneVisuals();
  if(!pathCoords || pathCoords.length < 2) return;
  animationActive = true;

  // distancias acumuladas en metros, para avanzar a velocidad constante
  // sin importar qué tan separados estén los nodos entre sí
  const segLengths = [];
  let totalLength = 0;
  for(let i=0;i<pathCoords.length-1;i++){
    const d = haversineKm(pathCoords[i].lat, pathCoords[i].lng, pathCoords[i+1].lat, pathCoords[i+1].lng) * 1000;
    segLengths.push(d);
    totalLength += d;
  }
  if(totalLength <= 0) totalLength = 0.001;

  // Velocidad de crucero de ESTA ruta (varía según el slider: más corta y
  // directa -> más rápida; ahorro de batería -> más lenta). Antes era una
  // constante fija (60 m/s) sin relación con la preferencia elegida.
  const speedMps = cruiseSpeedMps || DRONE_SPEED_MAX;
  const durationMs = (totalLength / speedMps) * 1000;
  const estimatedBatteryUse = Math.min(95, routeCost * 14); // % aproximado, solo para la barra visual

  droneTrail = L.polyline([pathCoords[0]], {color:'#81e5e5', weight:3, opacity:0.75}).addTo(layers.route);

  droneMarker = L.marker(pathCoords[0], {
    icon: L.divIcon({
      className: 'drone-icon',
      html: '<div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:16px solid #81e5e5;filter:drop-shadow(0 0 6px #81e5e5);transform-origin:50% 60%;"></div>',
      iconSize: [14,16], iconAnchor:[7,10]
    })
  }).addTo(map);

  const statBattery = document.getElementById('statBattery');
  const msg = document.getElementById('msg');
  msg.textContent = 'Despegando...';
  let startTime = null;

  function frame(ts){
    if(!animationActive) return;
    if(startTime === null) startTime = ts;
    const elapsed = ts - startTime;
    const t = Math.min(1, elapsed/durationMs);

    const distAlong = t*totalLength;
    let acc=0, segIdx=0;
    while(segIdx < segLengths.length-1 && acc+segLengths[segIdx] < distAlong){
      acc += segLengths[segIdx]; segIdx++;
    }
    const segStart = pathCoords[segIdx];
    const segEnd = pathCoords[segIdx+1] || pathCoords[segIdx];
    const segLen = segLengths[segIdx] || 0.001;
    const segT = Math.min(1, Math.max(0, (distAlong-acc)/segLen));

    const curLat = segStart.lat + (segEnd.lat-segStart.lat)*segT;
    const curLng = segStart.lng + (segEnd.lng-segStart.lng)*segT;
    const curPos = L.latLng(curLat, curLng);

    droneMarker.setLatLng(curPos);
    const bearing = computeBearing(segStart, segEnd);
    const iconEl = droneMarker.getElement();
    if(iconEl){
      const inner = iconEl.querySelector('div');
      if(inner) inner.style.transform = `rotate(${bearing}deg)`;
    }

    droneTrail.addLatLng(curPos);
    map.panTo(curPos, {animate:false});

    if(statBattery){
      const usedNow = estimatedBatteryUse * t;
      statBattery.textContent = Math.max(0, (100-usedNow)).toFixed(1)+' %';
    }

    if(t < 0.06) msg.textContent = 'Despegando...';
    else if(t < 0.9) msg.textContent = 'En ruta...';
    else if(t < 1) msg.textContent = 'Entregando paquete...';

    if(t >= 1){
      droneMarker.setLatLng(pathCoords[pathCoords.length-1]);
      msg.textContent = 'Entrega completada.';
      animationActive = false;
      animationRAF = null;
      return;
    }
    animationRAF = requestAnimationFrame(frame);
  }
  animationRAF = requestAnimationFrame(frame);
}
