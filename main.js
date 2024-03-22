import './style.css';
import Map from 'ol/Map.js';
import MousePosition from 'ol/control/MousePosition.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import Overlay from 'ol/Overlay.js';
import {createStringXY} from 'ol/coordinate.js';
import {defaults as defaultControls} from 'ol/control.js';

const map = new Map({
  controls: defaultControls(),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(2),
  projection: 'EPSG:3586',
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});

map.addControl(mousePositionControl);

const projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', function (event) {
  const projectionValue = event.target.value;
  mousePositionControl.setProjection(projectionValue);
  mousePositionControl.setCoordinateFormat(createStringXY(2));
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

    // Koordinaten für das MousePosition-Control aktualisieren
    mousePositionControl.setCoordinateFormat(createStringXY(2));
    mousePositionControl.setProjection('EPSG:3857');

    // Koordinaten ins MousePosition-Control einfügen
    const coordinates = createStringXY(2)(event.coordinate);
    const mousePositionElement = document.getElementById('mouse-position');
    mousePositionElement.innerHTML = `Coordinates: ${coordinates}`;
  }
}


const toggleCheckbox = document.getElementById('toggle-checkbox');
toggleCheckbox.addEventListener('change', function() {
   if (this.checked) {
    map.removeControl(mousePositionControl); 
      //const mousePositionElement = document.getElementById('mouse-position');
      //map.removeControl(mousePositionElement);
      // Koordinaten für das MousePosition-Control aktualisieren
      mousePositionControl.setCoordinateFormat(createStringXY(2));
      mousePositionControl.setProjection('EPSG:3857');
       
   
  } else {
    map.addControl(mousePositionControl);
    console.log('Checkbox ist deaktiviert');
  }
});

map.on('click', placeMarkerAndShowCoordinates);

const toggleButton = document.createElement('button');
toggleButton.textContent = 'Toggle Mouse Position';
toggleButton.id = 'toggle-button';
toggleButton.addEventListener('click', function () {
  toggleCheckbox.checked = !toggleCheckbox.checked;
  toggleCheckbox.dispatchEvent(new Event('change'));
});

document.body.appendChild(toggleButton);



const hideButton = document.createElement('button');
toggleButton.textContent = 'hide coord';
toggleButton.id = 'hide-button'; // Setze die ID des Buttons
toggleButton.addEventListener('click', function () {
  const mousePositionDiv = document.getElementById('mouse-position');
  mousePositionDiv.classList.toggle('hidden');
});

document.body.appendChild(hideButton);

document.getElementById('hide-button').addEventListener('click', function() {
  const controls = document.querySelector('.controls');
  controls.classList.toggle('hidden');
});
