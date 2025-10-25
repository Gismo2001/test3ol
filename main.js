import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import KML from 'ol/format/KML.js';
import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay.js';
import Draw from 'ol/interaction/Draw.js';

import {LineString, Polygon, Point, Circle} from 'ol/geom.js';
//import circular from 'ol/geom/Polygon';
import { circular } from 'ol/geom/Polygon';
import Geolocation from 'ol/Geolocation.js';

import jsPDF from "jspdf";
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import Text from 'ol/style/Text';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import TileWMS from 'ol/source/TileWMS.js';
import TileImage from 'ol/source/TileImage.js';
import XYZ from 'ol/source/XYZ.js';
import GeoTIFF from 'ol/source/GeoTIFF.js';
//import WebGLTile from 'ol/layer/WebGLTile.js';

import WebGLTileLayer from 'ol/layer/WebGLTile.js';

import { fromLonLat } from 'ol/proj.js';

import RasterSource from 'ol/source/Raster.js';
import ImageLayer from 'ol/layer/Image.js';

import {getArea, getLength} from 'ol/sphere.js';
import {unByKey} from 'ol/Observable.js';
import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control } from 'ol/control.js';
import { DragRotateAndZoom } from 'ol/interaction.js';
import { DragAndDrop } from 'ol/interaction.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import { singleClick } from 'ol/events/condition';

import MousePosition from 'ol/control/MousePosition.js';
import { transform } from 'ol/proj';
import {createStringXY} from 'ol/coordinate.js';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

import SearchPhoton from 'ol-ext/control/SearchPhoton';
import SearchFeature from 'ol-ext/control/SearchFeature';
//import SearchNominatim from 'ol-ext/control/SearchNominatim';
import WMSCapabilities from'ol-ext/control/WMSCapabilities';
import collection from 'ol/Collection';


import CanvasAttribution from 'ol-ext/control/CanvasAttribution';
import CanvasTitle from 'ol-ext/control/CanvasTitle';
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine';
import PrintDialog from 'ol-ext/control/PrintDialog';

import { format } from 'ol/coordinate';
import contextFeature from 'ol/Feature';

import FeatureList from 'ol-ext/control/FeatureList';

import Icon from 'ol/style/Icon'; // Hinzufügen Sie diesen Import

import Bar from 'ol-ext/control/Bar';
import Toggle from 'ol-ext/control/Toggle'; // Importieren Sie Toggle
import { Modify, Select } from 'ol/interaction'; // Importieren Sie Draw
import TextButton from 'ol-ext/control/TextButton';
import EditBar from 'ol-ext/control/EditBar';
import Tooltip from 'ol-ext/overlay/Tooltip';
import Notification from 'ol-ext/control/Notification';

import Button from 'ol-ext/control/Button';

import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import LayerGroup from 'ol/layer/Group';

import colormap from 'colormap';
import GeoTIFFSource from 'ol/source/GeoTIFF.js';



//projektion definieren und registrieren
proj4.defs('EPSG:32632', '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs +type=crs');
register(proj4);



const attribution = new Attribution({
  collapsible: true,
  html: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});

const source = new GeoTIFFSource({
  sources: [
    {
      url: 'https://dgm.s3.eu-de.cloud-object-storage.appdomain.cloud/323955834/2017-03-15/dgm1_32_395_5834_1_ni_2017.tif',
      min: 10,
      max: 30, // Replace with your data's min/max elevation
      nodata: 0,
    },
    
  ],
  projection: 'EPSG:25832',
  normalize: true,
  sourceOptions: {
    allowFullFile: true, // Useful for single-file sources
  },
});

// einfache Farbklassifizierung
const heightColorMap = [
  { max: 1, color: 'rgb(0,60,0)' },
  { max: 5, color: 'rgb(0,150,0)' },
  { max: 10, color: 'rgb(200,200,0)' },
  { max: 15, color: 'rgb(255,120,0)' },
  { max: 25, color: 'rgb(255,255,255)' },
];


const GeoTIFFLayer = new WebGLTileLayer({
  source: source,
  title: 'geotiffLayer',
  name: 'geotiffLayer',
  visible: true,
   style: (pixel) => {
    console.log(pixel);
    const height = pixel.get('Kanal 1'); // Annahme: 'height' Eigenschaft ist verfügbar
    let fillColor = 'gray';
    for (const range of heightColorMap) {
      if (height <= range.max) {
        fillColor = range.color;
        break;
      }
    }
    return new Style({
      fill: new Fill({
        color: fillColor
      })
    });
  },
  
});


const dgmSource = new VectorSource({
  url: '/data/lgln-opengeodata-dgm1.geojson',  // relativer Pfad im Projekt
  format: new GeoJSON(),
});


const dgmLayer = new VectorLayer({
  source: dgmSource,
  title: 'DGM-Kacheln',
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 150, 255, 0.8)',
      width: 1.5,
    }),
    fill: new Fill({
      color: 'rgba(0, 150, 255, 0.1)',
    }),
  }),
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
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  opacity: 1,
  visible: false,
});
const osmTileCr = new TileLayer({
  title: "osm-color",
  name: "osm-color",
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  opacity: 0.75,
  visible: true, 
});
const layerSwitcher = new LayerSwitcher({ 
  activationMode: 'click', 
  reverse: true, 
  trash: true, 
  tipLabel: 'Legende',
  onchangeCheck: function(layer, checked) {
     // console.log('Layer:', layer);  // Das gesamte Layer-Objekt
      //console.log('Layer Name:', layer.get('name')); // Den Namen des Layers abrufen

      if (checked) {
      //    console.log('Layer wurde aktiviert:', layer.get('name'));
          // Hier  weitere Aktionen
      } else {
         // console.log('Layer wurde deaktiviert:', layer.get('name'));
          // Hier weitere Aktionen
      }
  }
});
map.addControl(layerSwitcher);

// Event-Listener für Sichtbarkeitsänderung
layerSwitcher.on('layer:visible', function(event) {
 // Hier weitere Aktionen
 //console.log('Layer visibility changed event triggered:', event);
 const layer = event.layer; // Überprüfe die Struktur des Events
 //console.log('Layer:', layer);
});


const BaseGroup = new LayerGroup({
  title: "Base",
  name: "Base",
  fold: true,
  fold: 'close',
  visible: true,
  layers: [ osmTileGr, osmTileCr]
});
map.addLayer(BaseGroup);

map.addLayer(gew_layer_layer);

map.addLayer(GeoTIFFLayer);

map.addLayer(dgmLayer);



// --- Popup für Info / Auswahl
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
document.body.appendChild(popup);

map.on('singleclick', async (evt) => {
  const coordinate = evt.coordinate;
  console.log(evt.coordinate);
  let foundFeature = false;

  map.forEachFeatureAtPixel(evt.pixel, (feature) => {
    foundFeature = true;
    const props = feature.getProperties();
    const tifUrl = props.dgm1;
    const bbox = feature.getGeometry().getExtent();
    console.log('Feature-Eigenschaften:', props);
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
    };
  });

  if (!foundFeature) {
    // Höhenwert aus DGM ermitteln
    const pixelValues = await GeoTIFFLayer.getData(coordinate);
    if (pixelValues) {
      const height = pixelValues[0];
      popup.style.left = evt.pixel[0] + 10 + 'px';
      popup.style.top = evt.pixel[1] - 15 + 'px';
      popup.innerHTML = `Höhe: <b>${height.toFixed(2)} m</b>`;
      popup.style.display = 'block';
    }
  }
});




// --- Funktion: GeoTIFF-Layer hinzufügen
function addDgmLayer(url, bbox, id) {
  const source = new GeoTIFF({
    sources: [
      {
        url: url,
        min: 10,
        max: 30, // passe an deine Höhenwerte an
        nodata: 0,
      },
    ],
    projection: 'EPSG:25832',
    normalize: true,
    sourceOptions: {
      allowFullFile: true, // wichtig für lokale oder Einzel-TIFs
    },
  });

  const dgmLayer = new WebGLTileLayer({
    source: source,
    title: `DGM1 Kachel ${id}`,
    name: `dgm1_${id}`,
    visible: true,
    opacity: 0.95,

    style: (pixel) => {
    const height = pixel.get('Kanal 1'); // Annahme: 'height' Eigenschaft ist verfügbar
    let fillColor = 'gray';
    for (const range of heightColorMap) {
      if (height <= range.max) {
        fillColor = range.color;
        break;
      }
    }
    return new Style({
      fill: new Fill({
        color: fillColor
      })
    });
  },
  
  });

 
  map.addLayer(dgmLayer);
  map.getView().fit(bbox, {size: map.getSize(), maxZoom: 15});
  popup.style.display = 'none';
}


// --- Klick-Ereignis: Höhenwert abfragen
map.on('singleclick', async (evt) => {
  const coordinate = evt.coordinate;

  // Den Wert aus der GeoTIFF-Quelle abrufen
  const pixelValues = await dgmLayer.getData(coordinate);
  if (!pixelValues) {
    console.warn('Kein Wert verfügbar an dieser Position.');
    return;
  }

  const height = pixelValues[0]; // erstes Band = Höhenwert
  console.log(`Höhe an Klickposition: ${height.toFixed(2)} m`);

  // Popup anzeigen
  popup.style.left = evt.pixel[0] + 10 + 'px';
  popup.style.top = evt.pixel[1] - 15 + 'px';
  popup.innerHTML = `Höhe: <b>${height.toFixed(2)} m</b>`;
  popup.style.display = 'block';
});