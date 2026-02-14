import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';

import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control } from 'ol/control.js';
import { DragRotateAndZoom } from 'ol/interaction.js';

import { transform } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import LayerGroup from 'ol/layer/Group';
import {Fill, Stroke, Style} from 'ol/style.js';


import GeoTIFFSource from 'ol/source/GeoTIFF.js';
import { WebGLTile as WebGLTileLayer } from 'ol/layer.js';
import { fromArrayBuffer } from 'geotiff';

let activeDgmRasterLayer = null;

//projektion definieren und registrieren
proj4.defs('EPSG:32632', '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs +type=crs');
register(proj4);

const attribution = new Attribution({
  collapsible: true,
  html: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});



function createDgmGeoTiffStyle(minHeight, maxHeight) {
  const NO_DATA = -9999;
  
  // Sicherheitscheck: Falls min/max identisch sind (verhindert Division durch Null)
  const safeMax = maxHeight <= minHeight ? minHeight + 1 : maxHeight;

  return {
    color: [
      'case',
      // Falls NoData oder außerhalb der Range -> Transparent
      ['any', ['==', ['band', 1], NO_DATA], ['<', ['band', 1], minHeight]],
      [0, 0, 0, 0],
      [
        'interpolate',
        ['linear'],
        ['band', 1],
        minHeight, [0, 0, 255, 1],             // Blau
        minHeight + (safeMax - minHeight) * 0.2, [0, 255, 0, 1],   // Grün
        minHeight + (safeMax - minHeight) * 0.5, [255, 255, 0, 1], // Gelb
        minHeight + (safeMax - minHeight) * 0.8, [139, 69, 19, 1],  // Braun
        safeMax, [255, 255, 255, 1]            // Weiß
      ]
    ]
  };
}



async function getMinMaxFromMetadata(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' }); // Vorab-Check
    if (!response.ok) throw new Error('Datei nicht erreichbar');

    const tiff = await fromArrayBuffer(await (await fetch(url)).arrayBuffer());
    const image = await tiff.getImage(); // Evtl. getImage(1) für schnellere Statistik nutzen
    const meta = image.getGDALMetadata();

    if (meta?.STATISTICS_MINIMUM && meta?.STATISTICS_MAXIMUM) {
      return { 
        min: parseFloat(meta.STATISTICS_MINIMUM), 
        max: parseFloat(meta.STATISTICS_MAXIMUM) 
      };
    }

    // Fallback: Nur einen Ausschnitt oder Overview lesen statt das ganze File
    const raster = await image.readRasters({ samples: [0], interleave: false });
    const band = raster[0];
    let min = Infinity, max = -Infinity;
    
    for (let i = 0; i < band.length; i += 10) { // Performance: Nur jeden 10. Pixel prüfen
      const v = band[i];
      if (v !== -9999 && !isNaN(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return { min, max };
  } catch (err) {
    console.error('Statistik-Fehler:', err);
    return { min: 0, max: 100 };
  }
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
    title: `${id1} DGM_GeoTiff`,
    name: `${id1} DGM_GeoTiff`,
    visible: true,
    willReadFrequently : true,
    style: createDgmGeoTiffStyle(min, max), // dynamische Graustufen
  });

  // Extent der Kachel für Klickabfrage speichern
  GeoTIFFLayer1.bbox = bbox;

  map.addLayer(GeoTIFFLayer1);
  activeDgmRasterLayer = GeoTIFFLayer1;

  // Rasterdaten und Dimensionen global speichern
  activeDgmRasterData = { raster, width, height, bbox, min, max };


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


/**
 * Liefert einen Höhenwert (erste Band) an Karte-Koordinate zurück oder null.
 * Versucht mehrere Methoden (layer.getData, source.getView/readRasters).
 * @param {ol/layer/Layer} layer 
 * @param {Array<number>} coordinate map coordinate (vermutlich EPSG:3857)
 * @returns {Number|null}
 */
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


const heightInfo = document.getElementById('height-info');
const heightValue = document.getElementById('height-value');

map.on('pointermove', (evt) => {
  if (!activeDgmRasterLayer) {
    heightInfo.style.display = 'none';
    return;
  }

  // Daten an der aktuellen Pixelposition abfragen
  const data = activeDgmRasterLayer.getData(evt.pixel);

  if (data && data[0] !== -9999) { // Prüfen auf gültige Daten (kein NoData)
    const elevation = data[0].toFixed(2); // Auf 2 Nachkommastellen runden
    heightValue.innerText = elevation;
    heightInfo.style.display = 'block';
    
    // Optional: Anzeige folgt der Maus
    // heightInfo.style.left = (evt.pixel[0] + 15) + 'px';
    // heightInfo.style.top = (evt.pixel[1] + 15) + 'px';
  } else {
    heightInfo.style.display = 'none';
  }
});
