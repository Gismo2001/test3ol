import './style.css';
import Map from 'ol/Map.js';
import MousePosition from 'ol/control/MousePosition.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import Overlay from 'ol/Overlay.js';
import {createStringXY} from 'ol/coordinate.js';
import {defaults as defaultControls} from 'ol/control.js';
import {fromLonLat} from 'ol/proj'; // Import für 'proj'
import { transform } from 'ol/proj';

const map = new Map({
  controls: defaultControls(),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([7.35, 52.7]), // Verwendung von fromLonLat
    zoom: 9
  }),
});

const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(6),
  projection: 'EPSG:4326', // Start-Projektion
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});
map.addControl(mousePositionControl);

// Projektion für Maus anwenden
const projectionSelect = document.getElementById('projecSelect');
projectionSelect.addEventListener('change', function (event) {
  if (projectionSelect.value === 'EPSG:3857') {
    const format = createStringXY(2);
    mousePositionControl.setCoordinateFormat(format);
    mousePositionControl.setProjection(event.target.value);
  } else if (projectionSelect.value === 'EPSG:4326') {
    const format = createStringXY(6);
    mousePositionControl.setCoordinateFormat(format);
    mousePositionControl.setProjection(event.target.value);
  }
});

function placeMarkerAndShowCoordinates(event) {
  map.getOverlays().clear();
  const mousePositionElement = document.getElementById('mouse-position'); // Auswahl des HTML-Elements
  if (toggleCheckbox.checked) {
    const marker = document.createElement('div');
    marker.className = 'marker';
    const markerOverlay = new Overlay({
      position: event.coordinate,
      element: marker,
      stopEvent: false,
    });
    map.addOverlay(markerOverlay);
    if (projectionSelect.value === 'EPSG:3857') {
      const format = createStringXY(2);
      mousePositionElement.innerHTML = `Coordinates: ${format(event.coordinate)}`;
     } else if (projectionSelect.value === 'EPSG:4326') {
      const format = createStringXY(6);
      const transformedCoordinate = transformCoordinateToMousePosition(event.coordinate);
      mousePositionElement.innerHTML = `Coordinates: ${format(transformedCoordinate)}`;
    }
  }
}
map.on('click', placeMarkerAndShowCoordinates);

const toggleCheckbox = document.getElementById('toggle-checkbox');
toggleCheckbox.addEventListener('change', function() {
  if (this.checked) {
    console.log('gecheckt');
    
    document.getElementById('mouse-position').innerHTML = "";
    map.removeControl(mousePositionControl); 
    
  } else {
    map.addControl(mousePositionControl);
  }
});

document.getElementById('hide-button').addEventListener('click', function() {
  const controls = document.querySelector('.controls');
  controls.classList.toggle('hidden');
  if (controls.classList.contains('hidden')) {
    map.getOverlays().clear();
    document.getElementById('toggle-checkbox').checked = false;
    map.un('click', placeMarkerAndShowCoordinates);
  } else {
    
    map.addControl(mousePositionControl);
    map.on('click', placeMarkerAndShowCoordinates);
  }
});


//Umrechnung geclickter Kartenpositionen in mousePositionControl-Format
//für EPSG:4326
function transformCoordinateToMousePosition(coordinate) {
  // Koordinaten in das Format von mousePositionControl (EPSG:4326) umwandeln
  return transform(coordinate, map.getView().getProjection(), 'EPSG:4326');
}