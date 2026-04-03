import './style.css';
import {Map, View} from 'ol';
import * as LoadingStrategy from 'ol/loadingstrategy';
//import {bbox as bboxStrategy, tile} from 'ol/loadingstrategy.js';
import jsPDF from 'jspdf';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay.js';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS.js';
import TileImage from 'ol/source/TileImage.js';
import XYZ from 'ol/source/XYZ.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer} from 'ol/layer.js';

import Bar from 'ol-ext/control/Bar';
import EditBar from 'ol-ext/control/EditBar';
import Tooltip from 'ol-ext/overlay/Tooltip';
import Notification from 'ol-ext/control/Notification';
import {ScaleLine} from 'ol/control.js';
import TextButton from 'ol-ext/control/TextButton';
import Button from 'ol-ext/control/Button';
import Toggle from 'ol-ext/control/Toggle';
import Permalink from 'ol-ext/control/Permalink';

import {Select} from 'ol/interaction.js';
import {Draw} from 'ol/interaction.js';
import {getLength as getLengthLine, getArea as getAreaPolygon} from 'ol/sphere.js';   
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';


import {FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control, Rotate } from 'ol/control.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import KML from 'ol/format/KML.js';

import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';


import {circular} from 'ol/geom/Polygon';
import {LineString, Polygon, Point, Circle} from 'ol/geom.js';

import * as proj from 'ol/proj';

import {getArea, getLength} from 'ol/sphere.js';
import {unByKey} from 'ol/Observable.js';

import { DragRotateAndZoom } from 'ol/interaction.js';
import { DragAndDrop } from 'ol/interaction.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import { singleClick } from 'ol/events/condition';

import LayerGroup from 'ol/layer/Group';

import CanvasAttribution from 'ol-ext/control/CanvasAttribution';
import CanvasTitle from 'ol-ext/control/CanvasTitle';
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine';
import PrintDialog from 'ol-ext/control/PrintDialog';
import Legend from 'ol-ext/control/Legend';

import { toLonLat, transform } from 'ol/proj';
import { format } from 'ol/coordinate';



import { Text } from 'ol/style';
import { Icon } from 'ol/style';


import GeoTIFFSource from 'ol/source/GeoTIFF.js';
import { WebGLTile as WebGLTileLayer } from 'ol/layer.js';
import { fromArrayBuffer } from 'geotiff';

import { 
  myFuncInfoDiv,
  UTMToLatLon_Fix,
  generatePopupHTML,
  zoomToFeature,
  makeDivDraggable
} from './myFunctions';


import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import SearchPhoton from 'ol-ext/control/SearchPhoton';
import WMSCapabilities from'ol-ext/control/WMSCapabilities';
import { getCenter } from 'ol/extent'; // ❗ WICHTIG: oben importieren

import {extend as extendExtent, createEmpty as createEmptyExtent} from 'ol/extent';

import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

import Split from 'split.js';

let splitInstance = null;

const attribution = new Attribution({
  collapsible: true,
  html: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});


let activeDgmRasterLayers = [];  
let activeDgmRasterData = [];  

let dgmClickListener = null;
let dgmPointerMoveListener = null;
let loadedDgms = [];   // speichert {tile_id, bbox}

let activeDomRasterLayers = [];  
let activeDomRasterData = [];  
let domClickListener = null;
let loadedDoms = [];   // speichert {tile_id, bbox}

let profileMode = false;
let ismobile = false;


let permaFunktionality; // Nur deklarieren, noch nicht definieren

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const mapView = new View({
  center: proj.fromLonLat([7.35, 52.7]),
  zoom: 9
});
const map = new Map({
  target: "map",
  view: mapView,
   controls: defaultControls().extend([
    new FullScreen(),
    new ZoomToExtent({
      extent: [727361, 6839277, 858148, 6990951] 
    }),
    attribution,
  ]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()])
});

const gew_layer_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gew.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'gew', 
  name: 'gew',
  style: new Style({fill: new Fill({ color: 'rgba(0,28, 240, 0.4)' }),stroke: new Stroke({ color: 'blue', width: 2 }) }),
  visible: true
})
const osmTileGr = new TileLayer({
  title: "osm-grey",
  name: "osm-grey",
  className: 'bw',
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  opacity: 1,
  visible: true,
});
const osmTileCr = new TileLayer({
  title: "osm-color",
  name: "osm-color",
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  opacity: 1,
  visible: true, 
});

const wmsNsgLayer = new TileLayer({
  title: "NSG",
  name: "NSG",
  permalink:'NSG',  
  source: new TileWMS({
    url: 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Naturschutzgebiet',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: true,
  opacity: .5,
});
const wmsLsgLayer = new TileLayer({
  title: "LSG",
  name: "LSG",
  permalink:'LSG',  
  source: new TileWMS({
    url: 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Landschaftsschutzgebiet',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  
  visible: true,
  opacity: .5,
});
const wmsUesgLayer = new TileLayer({
  title: 'ÜSG',
  name: 'UESG',
  permalink:'UESG',
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/HWSchutz_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Überschwemmungsgebiete_Verordnungsfläechen_Niedersachsen11182',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: true,
  opacity: .5,
});
 
const layerSwitcher = new LayerSwitcher({ 
  activationMode: 'click', 
  reverse: true, 
  trash: true, 
  tipLabel: 'Legende',
 /*  onchangeCheck: function(layer, checked) {
      if (checked) {
        //    console.log('Layer wurde aktiviert:', layer.get('name'));
     
      } else {
        // console.log('Layer wurde deaktiviert:', layer.get('name'));
        
      }
  } */
});

map.addControl(layerSwitcher);

 // 1. Tabelle initialisieren (außerhalb des Klicks)
const table = new Tabulator("#wms_data_table", {
    height: "100%",
    layout: "fitColumns",
    autoColumns: true,
    autoColumnsDefinitions: function(definitions) {
        // Blendet die Hilfs-Spalte 'Ebene' aus, da wir sie im Dropdown schon sehen
        definitions.forEach((column) => {
            if (column.field === "Ebene") {
                column.visible = false;
            }
        });
        return definitions;
    },
});


// WICHTIG die Karte sich neu berechnen:
map.updateSize();

// Funktion zum Anzeigen/Verstecken
function toggleTable(show) {
    const el = document.getElementById("wms_data_table");
    el.style.display = show ? "block" : "none";
}

function showTable(data) {
    const container = document.getElementById("wms-table-container");
    container.style.display = "flex";
    // Split.js initialisieren, falls noch nicht geschehen
    if (!splitInstance) {
        splitInstance = Split(['#map', '#wms-table-container'], {
            sizes: [95, 5], // Startverteilung in %
            minSize: [150, 100], // Mindesthöhen
            direction: 'vertical',
            gutterSize: 5,
            onDrag: () => {
                map.updateSize(); // Karte anpassen
                table.redraw();   // Tabulator anpassen
            }
        });
    } else {
        // Falls schon da, nur Größe auf Standard zurücksetzen
        splitInstance.setSizes([95, 5]);
    }

    table.setData(data);
    map.updateSize();
}

// Beim Schließen:
window.closeTable = function() {
    if (splitInstance) {
        splitInstance.destroy(); // Split-Verhalten aufheben
        splitInstance = null;
    }
    document.getElementById("wms-table-container").style.display = "none";
    map.updateSize();
};

/* const BaseGroup = new LayerGroup({
  title: "Base",
  name: "Base",
  fold: true,
  fold: 'close',
  visible: true,
  layers: [ osmTileGr, osmTileCr]
});
map.addLayer(BaseGroup);
 */
map.addLayer(osmTileCr);
//map.addLayer(osmTileGr);

map.addLayer(gew_layer_layer);

map.addLayer(wmsNsgLayer);
map.addLayer(wmsLsgLayer);
map.addLayer(wmsUesgLayer);

// Dein Karten-Event
let currentClickResults = {}; // Speichert { 'NSG': [data], 'UESG': [data] }

map.on('singleclick', function (evt) {
    const promises = [];
    const viewResolution = map.getView().getResolution();
    currentClickResults = {}; // Reset

    map.getLayers().getArray().forEach(layer => {
        if (layer.getVisible() && layer.getSource()?.getFeatureInfoUrl) {
            const name = layer.get('name');
            const url = layer.getSource().getFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857', {
                'INFO_FORMAT': 'text/xml',
                'QUERY_LAYERS': layer.getSource().getParams().LAYERS,
                'LAYERS': layer.getSource().getParams().LAYERS
            });

            if (url) {
                promises.push(
                    fetch(url)
                        .then(res => res.text())
                        .then(xml => {
                            const data = parseArcGISXml(xml, name);
                            if (data.length > 0) currentClickResults[name] = data;
                        })
                );
            }
        }
    });

    Promise.all(promises).then(() => {
        const layerNames = Object.keys(currentClickResults);
        if (layerNames.length > 0) {
            updateSelector(layerNames);
            showTable(currentClickResults[layerNames[0]]); // Zeige den ersten gefundenen Layer
        } else {
            closeTable();
        }
    });
});

// Hilfsfunktion: Füllt das Dropdown
function updateSelector(names) {
    const selector = document.getElementById('layer-selector');
    selector.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join('');
}

// Hilfsfunktion: Schaltet die Daten in Tabulator um
window.switchLayerData = function() {
    const selectedLayer = document.getElementById('layer-selector').value;
    const data = currentClickResults[selectedLayer];

    // Tabelle komplett löschen und neu aufbauen
    if (table) table.destroy();
    
    table = new Tabulator("#wms_data_table", {
        data: data,
        autoColumns: true,
        layout: "fitColumns",
        height: "100%",
    });
};


function parseArcGISXml(xmlString, layerName) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const featureNodes = xmlDoc.getElementsByTagName("FIELDS");
    const data = [];

    for (let i = 0; i < featureNodes.length; i++) {
        const attributes = featureNodes[i].attributes;
        // WICHTIG: Hier setzen wir das Feld 'Ebene' für die Gruppierung
        let row = { "Ebene": layerName }; 
        for (let j = 0; j < attributes.length; j++) {
            row[attributes[j].nodeName] = attributes[j].nodeValue;
        }
        data.push(row);
    }
    return data;
}



// Nach der Initialisierung der map:
window.addEventListener('load', () => {
    map.updateSize();
});
