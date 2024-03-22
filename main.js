import './style.css';
import Map from 'ol/Map.js';
import MousePosition from 'ol/control/MousePosition.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import Overlay from 'ol/Overlay.js';
import * as proj from 'ol/proj';
import {createStringXY} from 'ol/coordinate.js';
import {defaults as defaultControls} from 'ol/control.js';

import { toStringHDMS } from 'ol/coordinate.js';
import { transform } from 'ol/proj.js';

const map = new Map({
  controls: defaultControls(),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: proj.fromLonLat([7.35, 52.7]),
    zoom: 9
  }),
});


const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(0),
  projection: document.getElementById('projection').value,
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});
map.addControl(mousePositionControl);


const projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', function (event) {
  const projectionValue = event.target.value;
  mousePositionControl.setProjection(projectionValue); // Aktualisiere die Projektion
  mousePositionControl.setCoordinateFormat(createStringXY(1)); // Setze das Koordinatenformat entsprechend der neuen Projektion
});

function placeMarkerAndShowCoordinates(event) {
  map.getOverlays().clear();
  if (toggleCheckbox.checked) {
    const marker = document.createElement('div');
    marker.className = 'marker';
    const markerOverlay = new Overlay({
      position: event.coordinate,
      element: marker,
      stopEvent: false,
    });
    map.addOverlay(markerOverlay);

    const selectedProjection = projectionSelect.value;
    
    const transformedCoordinate = proj.transform(event.coordinate, 'EPSG:3857', selectedProjection);
    
    mousePositionControl.setCoordinateFormat(createStringXY(4));

    if (selectedProjection === 'EPSG:3587') {
      const formattedCoordinate = convertToDegreeDecimalMinutes(transformedCoordinate);
      const mousePositionElement = document.getElementById('mouse-position');
      mousePositionElement.innerHTML = `Coordinates: ${formattedCoordinate}`;
    } else {
      const mousePositionElement = document.getElementById('mouse-position');
      mousePositionElement.innerHTML = `Coordinates: ${transformedCoordinate.map(coord => coord.toFixed(4)).join(', ')}`;
    }
  }
}

function convertToDegreeDecimalMinutes(coordinate) {
  const lon = coordinate[0];
  const lat = coordinate[1];

  const lonDirection = lon >= 0 ? 'E' : 'W';
  const latDirection = lat >= 0 ? 'N' : 'S';

  const lonAbs = Math.abs(lon);
  const latAbs = Math.abs(lat);

  const lonDegree = Math.floor(lonAbs);
  const latDegree = Math.floor(latAbs);

  const lonMinutes = (lonAbs - lonDegree) * 60;
  const latMinutes = (latAbs - latDegree) * 60;

  return `${lonDegree},${lonMinutes.toFixed(5)} ${lonDirection}, ${latDegree},${latMinutes.toFixed(5)} ${latDirection}`;
}

map.on('click', placeMarkerAndShowCoordinates);

const toggleCheckbox = document.getElementById('toggle-checkbox');
toggleCheckbox.addEventListener('change', function() {
   if (this.checked) {
    //Mouse-Position abschalten und auf Nutzereingabe mit Marker waren
    console.log(document.getElementById('projection').value);
    map.removeControl(mousePositionControl); 
    
  } else {
    //Mouse-Position wieder einschalten
    console.log(document.getElementById('projection').value);
    map.addControl(mousePositionControl);
    
  }
});


document.getElementById('hide-button').addEventListener('click', function() {
  const controls = document.querySelector('.controls');
  controls.classList.toggle('hidden');
  
  // Überprüfen, ob das Element sichtbar oder verborgen ist
  if (controls.classList.contains('hidden')) {
    console.log('Element ist verborgen');

    // Marker entfernen
    map.getOverlays().clear();

    // Event-Listener für Klicks auf der Karte entfernen
    map.un('click', placeMarkerAndShowCoordinates);
  } else {
    console.log('Element ist sichtbar');

    // Event-Listener für Klicks auf der Karte wieder hinzufügen
    map.on('click', placeMarkerAndShowCoordinates);
  }
});
