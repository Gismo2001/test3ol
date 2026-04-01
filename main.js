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

//map.addLayer(gew_layer_layer);
//map.addLayer(dgmKachelLayer);

// --- Popup für Info / Auswahl ---

/* 
const popup = document.createElement('div');
popup.id = 'popup';
popup.style.cssText = `
  position: absolute;
  background: white;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 13px;
`;
document.body.appendChild(popup); */
 

/* 
map.on('singleclick', async (evt) => {
  const coordinate = evt.coordinate;
  const kachelnVisible = dgmKachelLayer && dgmKachelLayer.getVisible();

  const popup = document.getElementById('popup') || (() => {
    const div = document.createElement('div');
    div.id = 'popup';
    div.style.cssText = `
      position: absolute;
      background: white;
      padding: 6px;
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 13px;
    `;
    document.body.appendChild(div);
    return div;
  })();

  // 🟢 FALL 1: DGM-Kacheln-Layer sichtbar → Auswahl einer Kachel
  if (kachelnVisible) {
    let featureFound = false;

    map.forEachFeatureAtPixel(evt.pixel, (feature) => {
      featureFound = true;
      const props = feature.getProperties();
      const tifUrl = props.dgm1;
      const bbox = feature.getGeometry().getExtent();

      popup.style.left = evt.pixel[0] + 'px';
      popup.style.top = evt.pixel[1] + 'px';
      popup.innerHTML = `
        <b>Kachel:</b> ${props.tile_id}<br>
        <b>Datum:</b> ${props.Aktualitaet}<br>
        <button id="loadDgmBtn">DGM laden</button>
      `;
      popup.style.display = 'block';

      document.getElementById('loadDgmBtn').onclick = function () {
        addDgmLayer(tifUrl, bbox, props.tile_id);
        popup.style.display = 'none';
      };
    });

    if (!featureFound) popup.style.display = 'none';
    return;
  }

  // 🟢 FALL 2: Kacheln-Layer unsichtbar → Höhe aus allen DGM-Layern ermitteln
  const dgmLayers = map.getLayers().getArray().filter((layer) => {
    const name = layer.get('name');
    return name && name.endsWith('DGM_GeoTiff') && layer.getVisible();
  });
  
  if (dgmLayers.length === 0) {
    popup.style.display = 'none';
    console.warn('Keine sichtbaren DGM-Layer gefunden.');
    return;
  }
  // Versuche der Reihe nach, einen Höhenwert zu bekommen
  let height = null;
  for (const layer of dgmLayers) {
    // extra debug: welche Methoden hat der Layer?
    console.log('Prüfe Layer', layer.get('name'), {
      hasGetData: typeof layer.getData === 'function',
      sourceHasGetView: layer.getSource ? typeof layer.getSource().getView === 'function' : false
    });

    const val = await readHeightFromGeoTIFFLayer(layer, evt.pixel);

    if (val !== null && val !== undefined && !Number.isNaN(val)) {
      height = val;
      console.log(`Höhe von Layer "${layer.get('name')}": ${height.toFixed(2)} m`);
      break;
    }
  }

  // Popup-Ausgabe
  popup.style.left = evt.pixel[0] + 10 + 'px';
  popup.style.top = evt.pixel[1] - 15 + 'px';
  if (height !== null) {
    popup.innerHTML = `Höhe: <b>${height.toFixed(2)} m</b>`;
  } else {
    popup.innerHTML = `<i>Keine DGM-Daten an dieser Position verfügbar</i>`;
  }
  popup.style.display = 'block';
});

 */


/* /* 
map.on('pointermove', (evt) => {

  if (evt.dragging) return;

  const now = Date.now();
  if (now - lastCall < throttleDelay) return;
  lastCall = now;

  // Nur wenn ein DGM aktiv ist
  if (!activeDgmRasterLayer || !activeDgmRasterLayer.getVisible()) {
    heightStatus.style.display = 'none';
    return;
  }

  const data = activeDgmRasterLayer.getData(evt.pixel);

  if (data && data[0] !== -9999 && !Number.isNaN(data[0])) {
    heightValue.innerText = data[0].toFixed(2);
    heightStatus.style.display = 'block';
  } else {
    heightStatus.style.display = 'none';
  }
});

 *//*
 * Liefert einen Höhenwert (erste Band) an Karte-Koordinate zurück oder null.
 * Versucht mehrere Methoden (layer.getData, source.getView/readRasters).
 * @param {ol/layer/Layer} layer 
 * @param {Array<number>} coordinate map coordinate (vermutlich EPSG:3857)
 * @returns {Number|null}
 */

/* 
async function readHeightFromGeoTIFFLayer(layer, coordinate) {
  console.log('aufgerufen');
  if (!layer) return null;

  // 1) Wenn die einfache API verfügbar ist: layer.getData(coordinate)
  if (typeof layer.getData === 'function') {
    try {
      const val = await layer.getData(coordinate);
      if (val && val.length && val[0] !== undefined && val[0] !== null && !Number.isNaN(val[0])) {
        return val[0];
      }
    } catch (err) {
      console.warn('layer.getData() fehlgeschlagen für', layer.get('name'), err);
      // fallthrough zu nächster Methode
    }
  }

  // 2) Fallback: direkt mit der GeoTIFF-Source arbeiten (robuster)
  const source = layer.getSource && layer.getSource();
  if (!source) return null;

  if (typeof source.getView !== 'function') {
    console.warn('Source hat keine getView()-Methode — cannot read rasters directly', layer.get('name'));
    return null;
  }

  try {
    // wir wollen in die native Projektion des Geotiffs transformieren (hier EPSG:25832)
    // Karte proj ist z.B. EPSG:3857
    const mapView = map.getView();
    const mapProj = mapView.getProjection().getCode();
    const tifProj = source.projection || 'EPSG:25832'; // GeoTIFF-Quelle hast du in addDgmLayer mit EPSG:25832 gesetzt

    // Transformiere die Klick-Koordinate in die GeoTIFF-Projektion
    const coordInTifProj = transform(coordinate, mapProj, tifProj);

    // extent: benutze layer.bbox (falls gesetzt beim Laden), sonst viewport-extent in tifProj
    const extent = layer.bbox || transformExtent(mapView.calculateExtent(map.getSize()), mapProj, tifProj);

    // resolution: aktuell verwendete map resolution -> approximativ
    const resolution = mapView.getResolution();

    // Hol dir eine "View" (OpenLayers GeoTIFF source API)
    const dataView = await source.getView({
      extent: extent,
      resolution: resolution,
      projection: tifProj,
    });

    if (!dataView) {
      console.warn('getView() lieferte kein dataView für', layer.get('name'));
      return null;
    }

    // Lese nur das erste Band (samples: [0]) — speichere als 1D-Array
    const rasters = await dataView.readRasters({ samples: [0] });
    const band = rasters[0]; // typed array
    const width = dataView.width;
    const height = dataView.height;
    const dvExtent = dataView.extent; // [minX, minY, maxX, maxY] in tifProj

    // berechne Pixelkoordinaten innerhalb des dataView
    const xRatio = (coordInTifProj[0] - dvExtent[0]) / (dvExtent[2] - dvExtent[0]);
    const yRatio = (dvExtent[3] - coordInTifProj[1]) / (dvExtent[3] - dvExtent[1]); // y von top

    const px = Math.floor(xRatio * width);
    const py = Math.floor(yRatio * height);

    if (px < 0 || px >= width || py < 0 || py >= height) {
      // Klick außerhalb des gerenderten dataView
      return null;
    }

    const index = py * width + px;
    const value = band[index];

    if (value === undefined || value === null || Number.isNaN(value)) return null;
    return value;
  } catch (err) {
    console.warn('Fehler beim Lesen der GeoTIFF-Rasterdaten von', layer.get('name'), err);
    return null;
  }
}
const heightStatus = document.getElementById('height-status');
const heightValue = document.getElementById('height-value'); */

/* let lastCall = 0;
const throttleDelay = 60; // 50–80ms ideal
  */