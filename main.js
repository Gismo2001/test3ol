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
import GeoTIFF from 'ol/source/GeoTIFF.js';
import WebGLTileLayer from 'ol/layer/WebGLTile.js';

//projektion definieren und registrieren
proj4.defs('EPSG:32632', '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs +type=crs');
register(proj4);

// einfache Farbklassifizierung
const heightColorMap = [
  { max: 1, color: 'rgb(0,60,0)' },
  { max: 5, color: 'rgb(0,150,0)' },
  { max: 10, color: 'rgb(200,200,0)' },
  { max: 15, color: 'rgb(255,120,0)' },
  { max: 25, color: 'rgb(255,255,255)' },
];
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

const GeoTIFFLayer = new WebGLTileLayer({
  source: source,
  title: 'geotiffLayer',
  name: 'geotiffLayer',
  visible: true,

 style: (pixel) => 
  { 
    console.log('pixel:', pixel ); 
    const height = pixel.get('Kanal 1'); 
    let fillColor = 'gray'; 
    for (const range of heightColorMap) {
       if (height <= range.max) { 
        fillColor = range.color; 
        break; 
      }
     } return new Style({ 
      fill: new Fill({ 
        color: fillColor 
      }) 
    }); 
  },
});

const dgmSource = new VectorSource({
  url: '/data/dgm_kacheln.geojson',  // relativer Pfad im Projekt
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

//-------------------------------------------sonstige Layer und Layer-Switcher
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

layerSwitcher.on('layer:visible', function(event) {
 const layer = event.layer; // Überprüfe die Struktur des Events
 console.log('Layer:', layer);
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


// --- Popup für Info / Auswahl ---
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

// globale Variable für aktuell geladenes GeoTIFF-DGM:
let activeDgmRasterLayer = null; // wird in addDgmLayer gesetzt

map.on('singleclick', async (evt) => {
  const coordinate = evt.coordinate;
  console.log('Klick-Koordinaten:', coordinate);

  // Sichtbarkeit des DGM-Kacheln-Layers prüfen
  const kachelnVisible = dgmLayer && dgmLayer.getVisible();
  console.log('DGM-Kacheln sichtbar:', kachelnVisible);

  // Popup vorbereiten (falls noch nicht angelegt)
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

  // --- FALL 1: DGM-Kacheln-Layer sichtbar -> Popup mit Kachel-Infos anzeigen
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

      // Klick auf "DGM laden" lädt GeoTIFF
      document.getElementById('loadDgmBtn').onclick = function () {
        addDgmLayer(tifUrl, bbox, props.tile_id);
        popup.style.display = 'none';
      };
    });

    // Wenn keine Kachel getroffen wurde → Popup ausblenden
    if (!featureFound) popup.style.display = 'none';

    return; // fertig für diesen Fall
  }

  // --- FALL 2: DGM-Kacheln-Layer NICHT sichtbar -> Höhe aus aktivem DGM abfragen
  let pixelValues = null;
  try {
    if (activeDgmRasterLayer && typeof activeDgmRasterLayer.getData === 'function') {
      pixelValues = await activeDgmRasterLayer.getData(coordinate);
    } else if (typeof GeoTIFFLayer !== 'undefined' && GeoTIFFLayer?.getData) {
      pixelValues = await GeoTIFFLayer.getData(coordinate);
    }
  } catch (err) {
    console.warn('Fehler beim Abrufen von DGM-Daten:', err);
  }

  if (pixelValues && pixelValues.length && pixelValues[0] != null) {
    const height = pixelValues[0];
    console.log(`Höhe an Klickposition: ${height.toFixed(2)} m`);

    popup.style.left = evt.pixel[0] + 10 + 'px';
    popup.style.top = evt.pixel[1] - 15 + 'px';
    popup.innerHTML = `Höhe: <b>${height.toFixed(2)} m</b>`;
    popup.style.display = 'block';
  } else {
    popup.style.left = evt.pixel[0] + 10 + 'px';
    popup.style.top = evt.pixel[1] - 15 + 'px';
    popup.innerHTML = `<i>Keine DGM-Daten geladen oder verfügbar</i>`;
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2000);
  }
});


function addDgmLayer(url, bbox, id) {
  const source = new GeoTIFFSource({
    sources: [{ url }],
    projection: 'EPSG:25832',
    normalize: true,
  });

  const dgmLayer = new WebGLTileLayer({
    source,
    title: `DGM1 Kachel ${id}`,
    name: `dgm1_${id}`,
    visible: true,
    opacity: 0.95,
    style: (pixel) => 
  { 
    console.log('pixel:', pixel ); 
    const height = pixel.get('Kanal 1'); 
    let fillColor = 'gray'; 
    for (const range of heightColorMap) {
       if (height <= range.max) { 
        fillColor = range.color; 
        break; 
      }
     } return new Style({ 
      fill: new Fill({ 
        color: fillColor 
      }) 
    }); 
  },
  });

  map.addLayer(dgmLayer);

  // 🟢 hier merken wir uns das aktuelle Layer
  activeDgmRasterLayer = dgmLayer;
}

