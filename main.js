import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';

import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import { fromLonLat } from 'ol/proj.js';
import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control } from 'ol/control.js';
import { DragRotateAndZoom } from 'ol/interaction.js';

import { defaults as defaultInteractions } from 'ol/interaction.js';
import { singleClick } from 'ol/events/condition';

import MousePosition from 'ol/control/MousePosition.js';
import { transform } from 'ol/proj';
import {createStringXY} from 'ol/coordinate.js';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import LayerGroup from 'ol/layer/Group';
import {Fill, Stroke, Style} from 'ol/style.js';


import GeoTIFFSource from 'ol/source/GeoTIFF.js';
import { WebGLTile as WebGLTileLayer } from 'ol/layer.js';
import { fromArrayBuffer } from 'geotiff';

import colormap from 'colormap';


let activeDgmRasterData = null; // globale Variable für aktuell geladenes GeoTIFF-DGM:
let activeDgmRasterLayer = null; // wird in addDgmLayer gesetzt

//projektion definieren und registrieren
proj4.defs('EPSG:32632', '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs +type=crs');
register(proj4);

const attribution = new Attribution({
  collapsible: true,
  html: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});
function createDgmGeoTiffStyle(minHeight, maxHeight) {
  const KNOWN_NODATA = -9999;

  return {
    color: [
      'case',
      ['==', ['band', 1], KNOWN_NODATA],
      [0, 0, 0, 0],
      ['<', ['band', 1], minHeight],
      [0, 0, 0, 0],
      [
        'interpolate',
        ['linear'],
        ['band', 1],
        minHeight, [0, 0, 0, 1],
        (minHeight + maxHeight) / 2, [128, 128, 128, 1],
        maxHeight, [255, 255, 255, 1],
      ]
    ]
  };
}
async function getMinMaxFromMetadata(url) {
  if (!url || typeof url !== 'string' || !url.endsWith('.tif')) {
    console.error('Ungültige TIFF-URL:', url);
    return { min: 0, max: 100 };
  }

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const tiff = await fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();
  const meta = image.getGDALMetadata();

  let min, max;
  
  if (meta?.STATISTICS_MINIMUM && meta?.STATISTICS_MAXIMUM) {
    // 🟢 Fall 1: GDAL hat Statistik → direkt übernehmen
    min = parseFloat(meta.STATISTICS_MINIMUM);
    max = parseFloat(meta.STATISTICS_MAXIMUM);
    console.log(`GDAL Statistik gefunden: min=${min}, max=${max}`);
  } else {
    const raster = await image.readRasters({ samples: [0] });
    const band = raster[0];
    min = Infinity;
    max = -Infinity;
    for (let i = 0; i < band.length; i++) {
      const v = band[i];
      if (v !== -9999 && !isNaN(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }

    //console.log('Beispielwerte (erste 20 Pixel):', Array.from(band.slice(0, 20)));
    //console.log(`Berechnete Statistik: min=${min}, max=${max}`);
    //console.log('SampleFormat:', image.getSampleFormat());
    //console.log('BitsPerSample:', image.getBitsPerSample());

  }

  return { min, max };
}

async function addDgmLayer(url, bbox, id1) {
  // min/max aus GDAL-Metadaten ermitteln
  const { min, max, raster, width, height } = await getMinMaxFromMetadata(url);

  // GeoTIFF Layer
  const TiffSource1 = new GeoTIFFSource({ 
    sources: [{ url }], 
    projection: 'EPSG:25832', 
    normalize: false, 
    sourceOptions: { allowFullFile: true }, 
  });

  const GeoTIFFLayer1 = new WebGLTileLayer({
    source: TiffSource1,
    title: `${id1} DGM1 Kachel`,
    name: `${id1} DGM1 Kachel`,
    visible: true,
    style: createDgmGeoTiffStyle(min, max), // dynamische Graustufen
  });

  // Extent der Kachel für Klickabfrage speichern
  GeoTIFFLayer1.bbox = bbox;

  map.addLayer(GeoTIFFLayer1);
  activeDgmRasterLayer = GeoTIFFLayer1;

  // Rasterdaten und Dimensionen global speichern
  activeDgmRasterData = { raster, width, height, bbox, min, max };

  console.log(`✅ DGM-Layer hinzugefügt: ${id1} (min=${min}, max=${max})`);
}


const dgmKachelSource = new VectorSource({
  url: '/data/dgm_kacheln.geojson',  // relativer Pfad im Projekt
  format: new GeoJSON(),
});
const dgmKachelLayer = new VectorLayer({
  source: dgmKachelSource,
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
      if (checked) {
        //    console.log('Layer wurde aktiviert:', layer.get('name'));
     
      } else {
        // console.log('Layer wurde deaktiviert:', layer.get('name'));
        
      }
  }
});
map.addControl(layerSwitcher);

layerSwitcher.on('layer:visible', function(event) {
 const layer = event.layer; // Überprüfe die Struktur des Events 
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
map.addLayer(dgmKachelLayer);


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



map.on('singleclick', async (evt) => {
  const coordinate = evt.coordinate;
  const kachelnVisible = dgmKachelLayer && dgmKachelLayer.getVisible();
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
      console.log(props)
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
    const height = HoeheErmitteln(evt);
    popup.style.left = evt.pixel[0] + 10 + 'px';
    popup.style.top = evt.pixel[1] - 15 + 'px';
    popup.innerHTML = `Höhe: <b>${height.toFixed(2)} m</b>`;
    popup.style.display = 'block';


});


 function HoeheErmitteln (evt) {
  const dataObject = activeDgmRasterLayer.getData(evt.pixel);
  const elevationValue = dataObject["0"]; 
  return elevationValue;
};

