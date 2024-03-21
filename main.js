import './style.css';
import Map from 'ol/Map.js';
import MousePosition from 'ol/control/MousePosition.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
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
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});

map.addControl(mousePositionControl);

const projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', function (event) {
  const projectionValue = event.target.value;
  mousePositionControl.setProjection(projectionValue);
  mousePositionControl.setCoordinateFormat(createStringXY(4)); // Set coordinate format back to default
});

const precisionInput = document.getElementById('precision');
precisionInput.addEventListener('change', function (event) {
  const format = createStringXY(event.target.valueAsNumber);
  mousePositionControl.setCoordinateFormat(format);
});


const toggleButton = document.createElement('button');
toggleButton.textContent = 'Toggle Coordinates';
toggleButton.id = 'toggle-button'; // Setze die ID des Buttons
toggleButton.addEventListener('click', function () {
  const mousePositionDiv = document.getElementById('mouse-position');
  mousePositionDiv.classList.toggle('hidden');
});

// Füge den Button dem Dokument hinzu
document.body.appendChild(toggleButton);

document.getElementById('toggle-button').addEventListener('click', function() {
  const controls = document.querySelector('.controls');
  controls.classList.toggle('hidden');
});

document.getElementById('toggle-checkbox').addEventListener('change', function() {
   if (this.checked) {
    // Checkbox ist aktiviert
    console.log('Checkbox ist aktiviert');
  } else {
    // Checkbox ist deaktiviert
    console.log('Checkbox ist deaktiviert');
  }
});