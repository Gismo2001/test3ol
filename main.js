import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';

import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control } from 'ol/control.js';
import { DragRotateAndZoom, Interaction } from 'ol/interaction.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';

import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';

import {Fill, Stroke, Style} from 'ol/style.js';

import Rotate from 'ol/control/Rotate';
import { Draw, Modify, Select } from 'ol/interaction'; // Importieren Sie Draw
import Polygon from 'ol/geom/Polygon.js';
import LineString from 'ol/geom/LineString';
import Feature from 'ol/Feature';
import CircleGeom from 'ol/geom/Circle';
import {getArea, getLength} from 'ol/sphere.js';
import Observable, {unByKey} from 'ol/Observable.js';

import TextButton from 'ol-ext/control/TextButton';
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import Bar from 'ol-ext/control/Bar';
import Button from 'ol-ext/control/Button';
import Toggle from 'ol-ext/control/Toggle'; // Importieren Sie Toggle
import '@fortawesome/fontawesome-free/css/all.css';

import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';

import { Overlay } from 'ol';
import CircleStyle from 'ol/style/Circle';


/// Erstellung des Layer-Switchers
var layerSwitcher = new LayerSwitcher({
  activationMode: 'click'
});
 

const mapView = new View({
  center: proj.fromLonLat([7.35, 52.7]),
  zoom: 9
});

const map = new Map({
  target: "map",
  view: mapView,
  controls: defaultControls().extend([
    new FullScreen(),
    // new ZoomToExtent({
    //   extent: [727361, 6839277, 858148, 6990951] // Geben Sie hier das Ausdehnungsintervall an
    // }),
   // attribution // Fügen Sie hier Ihre benutzerdefinierte Attribution-Steuerung hinzu
  ]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
  
});

const osmTileCr = new TileLayer({
  title: "osm-color",
  type: 'base',
  source: new OSM({
    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  }),
  visible: true,
  opacity: 1
});

const gew_layer_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gew.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'gew', // Titel für den Layer-Switcher
  name: 'gew',
  style: new Style({
    fill: new Fill({ color: 'rgba(0,28, 240, 0.4)' }),
    stroke: new Stroke({ color: 'blue', width: 2 })
  })
});


map.addControl(layerSwitcher);

map.addLayer(osmTileCr);
map.addLayer(gew_layer_layer);

var lengthButton = document.createElement('button');
lengthButton.innerHTML = 'L';
lengthButton.className = 'myButton';
lengthButton.id = 'lengthButton';

var lengthElement = document.createElement('div');
lengthElement.className = 'lengthButtonDiv';
lengthElement.appendChild(lengthButton);

var lengthControl = new Control({
  element: lengthElement
})

var lengthFlag = false;
lengthButton.addEventListener('click', () => {
  lengthButton.classList.toggle('clicked');
  lengthFlag = !lengthFlag;
  document.getElementById("map").style.cursor="default";
  if (lengthFlag){    
    map.removeInteraction(draw);
    addInteraction('LineString');
  } else { 
    map.removeInteraction(draw);
    source.clear();
    const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
    while (elements.length > 0) elements[0].remove;
  }
});

map.addControl(lengthControl);

var areaButton = document.createElement('button');
areaButton.innerHTML = 'A';
areaButton.className = 'myButton';
areaButton.id = 'areaButton';

var areaElement = document.createElement('div');
areaElement.className = 'areaButtonDiv';
areaElement.appendChild(areaButton);

var areaControl = new Control({
  element: areaElement
});

var areaFlag = false;
areaButton.addEventListener('click', () => {
  
  areaButton.classList.toggle('clicked');
  areaFlag = !areaFlag;
    document.getElementById("map").style.cursor="default";
  if (areaFlag){
    map.removeInteraction(draw);
    addInteraction('Polygon');
  } else { 
    map.removeInteraction(draw);
    source.clear();
    const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
    while (elements.length > 0) elements[0].remove;
  }
});

map.addControl(areaControl);

var continuePolygonMsg = "Click to continue Polygon, DoubleClick to end";

var continueLineMsg = "Click to continue Polygon, DoubleClick to end";

var draw;

var source = new VectorSource;
var vector = new VectorLayer({
  source: source,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255,255,255,0.5)',
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33',
      }),
    }),
  }),
});

map.addLayer(vector);

function addInteraction(initType) {
  
  draw = new Draw({
    source: source,
    type: initType,
    style: new Style({
      fill: new Fill({
        color: 'rgba(200,200,200,0.6)',
      }),
      stroke: new Stroke({
        color: 'rgba(0,0,0,0.5)',
        lineDash: [10,10],
        width: 2,
      }),
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke ({
          color: 'rgba(0,0,0,0.7)',
        }),
        fill: new Fill({
          color: 'rgba(22,85,167,0.6)',
        }),
      }),
    }),
  });
  map.addInteraction(draw);
  
  createMeasureTooltip();
  createHelpTooltip();

  var sketch;

  var pointerMoveHandler = function (evt) {
    if (evt.dragging) {
      return;
    }
    var helpMsg = 'click to start drawing';
    if (sketch) {
      var geom = sketch.getGeometry();
      //if (geom instanceof Polygon){
      //  helpMsg = continuePolygonMsg;
      // } else if (geom instanceof LineString) {
      // helpMsg = continueLineMsg;
      // }
    }
    //helpTooltipElement.innerHTML = helpMsg;
    //helpTooltip.setPosition(evt.coordinate); 

    //helpTooltipElement.classList.remove('hidden');
  };

  map.on('pointermove', pointerMoveHandler);
  
  //var listener
  draw.on('drawstart', function(evt) {
    //set sketch
    sketch = evt.feature;

    var tooltipCoord = evt.coordinate;
    
    sketch.getGeometry().on('change',function (evt) {
        var geom = evt.target;
        var output;
        if (geom instanceof Polygon) {
            output = formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
            output = formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
    });
  });

  draw.on('drawend', function() {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
    //unByKey(listener);
  });
};

var helpTooltipElement;
var helpTooltip;

function createHelpTooltip() {
  if (helpTooltipElement){
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15,0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);

  // Code, der auf helpTooltipElement zugreift, hier platzieren
  map.getViewport().addEventListener('mouseout', function() {
    helpTooltipElement.classList.add('hidden');
  });
}

// Funktion createHelpTooltip() aufrufen, um helpTooltipElement zu initialisieren
createHelpTooltip();

var measureTooltipElement;
var measureTooltip;

function createMeasureTooltip() {
  if(measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0,15],
    positioning: 'bottom-center',
  });
  map.addOverlay(measureTooltip);
}


var formatLength = function(line) {
  var length = getLength(line);
  var output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' km';
  } else {
    output = Math.round(length * 100) / 100 + ' m';
  }
  return output;
};

var formatArea = function(polygon) {
  var area = getArea(polygon);
  var output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' m<sup>2</sup>';
  }
  return output;
};

 


