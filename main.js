import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS.js';
import TileImage from 'ol/source/TileImage.js';
import XYZ from 'ol/source/XYZ.js';

import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import events from 'ol/events/Event'
import { singleClick } from 'ol/events/condition';
import { Fill, Stroke, Style } from 'ol/style';
import TextButton from 'ol-ext/control/TextButton';
import Button from 'ol-ext/control/Button';
//import Overlay from 'ol-ext/control/Overlay';
import Tooltip from 'ol-ext/overlay/Tooltip';
//import Popup from 'ol-ext/overlay/Popup';
import PopupFeature from 'ol-ext/overlay/PopupFeature';
import Overlay from 'ol/Overlay.js';
import Notification from 'ol-ext/control/Notification';
import EditBar from 'ol-ext/control/EditBar';
import GeolocationButton from 'ol-ext/control/GeolocationButton';
import GeolocationDraw from 'ol-ext/interaction/GeolocationDraw';
import {Circle as CircleStyle } from 'ol/style.js';
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control } from 'ol/control.js';
import { DragRotateAndZoom } from 'ol/interaction.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import Bar from 'ol-ext/control/Bar';
import Toggle from 'ol-ext/control/Toggle'; // Importieren Sie Toggle
import { Draw, Modify, Select } from 'ol/interaction'; // Importieren Sie Draw
import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import { Circle } from 'ol/geom';
import WMSCapabilities from 'ol-ext/control/WMSCapabilities';
import { 
  bru_nlwknStyle,
    sleStyle,
    wehStyle, 
    bruAndereStyle, 
    dueStyle,
    queStyle,
    getStyleForArtSonLin, 
    km10scalStyle,
    gehoelz_vecStyle,
    getStyleForArtFSK,
    getStyleForArtEin,
    getStyleForArtSonPun,
    getStyleForArtUmn,
    getStyleForArtGewInfo,
    km100scalStyle,
    km500scalStyle,
    combinedStyle,
    
  
} from './extStyle';


var schalterGeoloc = false;
var schalterEditBar = false;
let schalterFeatPopup = true;

const attribution = new Attribution({
  collapsible: false,
  html: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});
const mapView = new View({
  center: proj.fromLonLat([7.35, 52.7]),
  zoom: 9,
});
const map = new Map({
  target: "map",
  view: mapView,
  controls: 
  defaultControls().extend([
    new FullScreen(),
    new ZoomToExtent({extent: [727361, 6839277, 858148, 6990951] }),
    attribution 
  ]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()])
});

var layerSwitcher = new LayerSwitcher({
  activationMode: 'click', 
  reverse: true, 
  trash: true, 
  tipLabel: 'Legende', 
});
map.addControl(layerSwitcher);
//Start Layer--------------------------------------------------


const gehoelz_vecLayer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gehoelz_vec.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Gehölz(Plan)', // Titel für den Layer-Switcher
  name: 'gehoelz_vec',
  style: gehoelz_vecStyle,
  visible: false
});
const exp_allgm_fsk_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_allgm_fsk.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'fsk',
  name: 'fsk', 
  style: getStyleForArtFSK,
  visible: false,
  minResolution: 0,
  maxResolution: 4
})
const exp_bw_son_lin_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_son_lin.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }), 
  title: 'Sonstig, Linien', 
  name: 'son_lin',
  style: getStyleForArtSonLin,
  visible: false
});
const exp_gew_umn_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_gew_umn.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'U-Maßnahmen', 
  name: 'gew_umn',
  style: getStyleForArtUmn,
  visible: false
});
const exp_gew_info_layer = new VectorLayer({
  source: new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {return './myLayers/exp_gew_info.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Gew, Info', 
  name: 'gew_info',
  style: combinedStyle,
  visible: false
});

const gew_layer_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gew.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'gew', // Titel für den Layer-Switcher
  name: 'gew',
  style: new Style({
    fill: new Fill({ color: 'rgba(0,28, 240, 0.4)' }),
    stroke: new Stroke({ color: 'blue', width: 2 })
  })
})

const exp_bw_son_pun_layer = new VectorLayer({
  source: new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {return './myLayers/exp_bw_son_pun.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Sonstige, Punkte', 
  name: 'son_pun', 
  style: getStyleForArtSonPun,
  visible: false
});
const exp_bw_ein_layer = new VectorLayer({
  source: new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {return './myLayers/exp_bw_ein.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Einläufe', 
  name: 'ein', 
  style: getStyleForArtEin,
  visible: false
});
const exp_bw_que_layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return './myLayers/exp_bw_que.geojson' + '?bbox=' + extent.join(',');
    },
    strategy: LoadingStrategy.bbox
  }),
  title: 'Querung', 
  name: 'que', // Titel für den Layer-Switcher
  style: queStyle,
  visible: false
});
const exp_bw_due_layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return './myLayers/exp_bw_due.geojson' + '?bbox=' + extent.join(',');
    },
    strategy: LoadingStrategy.bbox
  }),
  title: 'Düker', // Titel für den Layer-Switcher
  name: 'due', // Titel für den Layer-Switcher
  style: dueStyle,
  visible: false
});
const exp_bw_weh_layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return './myLayers/exp_bw_weh.geojson' + '?bbox=' + extent.join(',');
    },
    strategy: LoadingStrategy.bbox
  }),
  title: 'Wehr', // Titel für den Layer-Switcher
  name: 'weh', // Titel für den Layer-Switcher
  style: wehStyle,
  visible: false
});
const exp_bw_bru_nlwkn_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_bru_nlwkn.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Brücke (NLWKN)', 
  name: 'bru_nlwkn', // Titel für den Layer-Switcher
  style: bru_nlwknStyle,
  visible: false
});
const exp_bw_bru_andere_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_bru_andere.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Brücke (andere)', 
  name: 'bru_andere', 
  style: bruAndereStyle,
  visible: false
});
const exp_bw_sle_layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return './myLayers/exp_bw_sle.geojson' + '?bbox=' + extent.join(',');
    },
    strategy: LoadingStrategy.bbox
  }),
  title: 'Schleuse', // Titel für den Layer-Switcher
  name: 'sle', // Titel für den Layer-Switcher
  style: sleStyle,
  visible: true,
  trash: false,
});


const km10scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_10_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km10scal', // Titel für den Layer-Switcher
  style: km10scalStyle,
  visible: false,
  minResolution: 0,
  maxResolution: 1
});
const km100scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_100_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km100scal', // Titel für den Layer-Switcher
  style: function(feature, resolution) {
    return km100scalStyle(feature, feature.get('km'), resolution);
  },
  visible: true,
  minResolution: 0,
  maxResolution: 3 
});
const km500scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_500_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km500scal', // Titel für den Layer-Switcher
  style: function(feature, resolution) {
    return km500scalStyle(feature, feature.get('km'), resolution);
  },
  visible: true  
});



const wmsNsgLayer = new TileLayer({
  title: "NSG",
  name: "NSG",
  source: new TileWMS({
    url: 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Naturschutzgebiet',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: .5,
});
const wmsLsgLayer = new TileLayer({
  title: "LSG",
  name: "LSG",
  source: new TileWMS({
    url: 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Landschaftsschutzgebiet',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: .5,
});
const wmsUesgLayer = new TileLayer({
  title: "ÜSG",
  name: "ÜSG",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/HWSchutz_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Überschwemmungsgebiete_Verordnungsfläechen_Niedersachsen11182',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: .5,
});
const wmsWrrlFgLayer = new TileLayer({
  title: "Fließgew.",
  name: "Fließgew.",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/WRRL_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Natuerliche_erheblich_veraenderte_und_kuenstliche_Fliessgewaesser',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: 1,
});
const wmsGewWmsFgLayer = new TileLayer({
  title: "GewWms",
  name: "GewWms",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Gewässernetz',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: 1,
});

const gnAtlas2023 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "10", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2023",
  opacity: 1.000000,
  visible: false,
});
//Ende Layer--------------------------------------------------
const gnAtlas2020 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "9", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2020",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2017 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "8", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2017",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2014 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "7", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2014",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2012 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "6", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2012",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2010 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "5", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2010",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2009 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "4", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2009",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas2002 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "3", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "2002",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas1970 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "2", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "1970",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas1957 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "1", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "1957",
  opacity: 1.000000,
  visible: false,
});
const gnAtlas1937 = new TileLayer({
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "0", "TILED": "true", "VERSION": "1.3.0"},
    })),
  title: "1937",
  opacity: 1.000000,
  visible: false,
});




var baseDE_layer = new TileLayer({
  title: "Base-DE",
  name: "Base-DE",
  opacity: 1.000000,
  visible: false,
  type: 'base',
  source: new TileWMS({
    url: "https://sgx.geodatenzentrum.de/wms_basemapde",
    attributions: '© GeoBasis-DE / BKG (Jahr des letzten Datenbezugs) CC BY 4.0',
    params: {
      "LAYERS": "de_basemapde_web_raster_farbe",
      "TILED": true, // "true" sollte ohne Anführungszeichen sein
      "VERSION": "1.3.0"
    },
  }),
});
var dop20ni_layer = new TileLayer({
  title: "DOP20 NI",
  opacity: 1.000000,
  visible: false,
  type: 'base',
  source: new TileWMS({
    url: "https://www.geobasisdaten.niedersachsen.de/doorman/noauth/wms_ni_dop",
    attributions: 'Orthophotos Niedersachsen, LGLN',
    params: {
      "LAYERS": "dop20",
      "TILED": true, // "true" sollte ohne Anführungszeichen sein
      "VERSION": "1.3.0"
    },
  }),
});
const googleSatLayer = new TileLayer({
  title: "GoogleSat",
  type: 'base',
  baseLayer: false,
  visible: false,
  source: new TileImage({url: 'http://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}' })
});
const googleHybLayer = new TileLayer({
  title: "GoogleHybrid",
  type: 'base',
  baseLayer: false,
  visible: false,
  source: new TileImage({url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' })
});
const ESRIWorldImagery = new TileLayer({
  title: 'ESRI-Sat',
  type: 'base',
  opacity: 1.000000,
  visible: false,
  source: new XYZ({
      attributions: 'Powered by Esri',
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  })
});
const ESRIWorldGrey = new TileLayer({
  title: 'ESRI-Grey',
  type: 'base',
  opacity: 1.000000,
  visible: false,
  source: new XYZ({
      attributions: 'Powered by Esri',
      url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
  })
});
const osmTileGr = new TileLayer({
  title: "osm-grey",
  className: 'bw',
  type: 'base',
  visible: false,
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
});
const osmTileCr = new TileLayer({
  title: "osm-color",
  name:  "osm-color",
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  visible: true,
  opacity: 0.75
});



//---------------------------------------------Layergruppen
const BwGroupP = new LayerGroup({
  title: "Bauw.(P)",
  name: "bauwP",
  fold: true,
  fold: 'close',
  layers: [ exp_bw_son_pun_layer, exp_bw_ein_layer, exp_bw_bru_andere_layer, exp_bw_bru_nlwkn_layer, exp_bw_que_layer, exp_bw_due_layer, exp_bw_weh_layer, exp_bw_sle_layer],
});
const BwGroupL = new LayerGroup({
  title: "Bauw.(L)",
  name: "BauwL",
  fold: true,
  fold: 'close',  
  layers: [ gehoelz_vecLayer, exp_gew_umn_layer, exp_bw_son_lin_layer, exp_gew_info_layer ]
});

const wmsLayerGroup = new LayerGroup({
  title: "WMS-Lay",
  name: "WMS-Lay",
  fold: true,
  fold: 'close',
  visible: true,
  layers: [ wmsLsgLayer, wmsNsgLayer, wmsUesgLayer, wmsWrrlFgLayer, wmsGewWmsFgLayer ]
});
const NOHAtlasGroup = new LayerGroup({
  title: "NOH-Sat",
  name: "NOH-Sat",
  fold: true,
  fold: 'close',
  layers: [ gnAtlas2023, gnAtlas2020, gnAtlas2017, gnAtlas2014, gnAtlas2012, gnAtlas2010, gnAtlas2009, gnAtlas2002, gnAtlas1970, gnAtlas1957, gnAtlas1937]
});

const kmGroup = new LayerGroup({
  title: "Station",
  name: "station",
  fold: true,
  fold: 'close',
  layers: [km10scal_layer, km100scal_layer, km500scal_layer]
});

const BaseGroup = new LayerGroup({
  title: "Base",
  name: "Base",
  fold: true,
  fold: 'close',
  layers: [ESRIWorldImagery, ESRIWorldGrey, googleHybLayer, googleSatLayer, dop20ni_layer, baseDE_layer, osmTileGr, osmTileCr]
});

//Start Layer hinzufügen---------------------------------------
map.addLayer(BaseGroup);
map.addLayer(NOHAtlasGroup);
map.addLayer(gew_layer_layer);
map.addLayer(wmsLayerGroup);
map.addLayer(kmGroup);
map.addLayer(BwGroupL);
map.addLayer(BwGroupP);


//Ende Layer hinzufügen---------------------------------------

var toggleButtonU = new Toggle({
  html: '<i class="icon fa-fw fa fa-arrow-circle-down" aria-hidden="true"></i>',
  className: "select",
  title: "Select Info",
  active: true, // Button wird beim Start als aktiv gesetzt
  interaction: selectInteraction,
  onToggle: function(active) {
    alert("Select is " + (active ? "activated" : "deactivated"));
    selectInteraction.setActive(active);

    // Auswahl löschen, wenn deaktiviert
    if (!active) selectInteraction.getFeatures().clear();

    // FeaturPopup hinzufügen oder entfernen
    if (active) map.addOverlay(popup);
    else map.removeOverlay(popup);

    // Klasse 'active' je nach Zustand des Buttons setzen
    toggleButtonU.element.classList.toggle('active', active);
    toggleButtonU.element.querySelector('.icon').classList.toggle('active', active);

    // Ein- und Ausschalten der Interaktion
    
    if (active) map.un('singleclick', singleClickHandler);
    else map.on('singleclick', singleClickHandler);
  }
});
// Klasse 'active' zum Button hinzufügen, um sicherzustellen, dass er beim Start als aktiv dargestellt wird
toggleButtonU.element.classList.add('active');
toggleButtonU.element.querySelector('.icon').classList.add('active');
map.addControl(toggleButtonU);

//Vektorlayer für Featureauswahl
var vector = new VectorLayer({source: new VectorSource()});
map.addLayer(vector);

var selectInteraction = new Select({
  layers: [vector],
  hitTolerance: 5,
});

var selectFeat = new Select({
  hitTolerance: 5,
  multi: true,
  condition: singleClick,
});

let layer_selected = null; // Setze layer_selected auf null, um sicherzustellen, dass es immer definiert ist

var popup = new PopupFeature({
  popupClass: 'popup', // Verwenden Sie Ihre benutzerdefinierte Popup-Klasse hier
  select: selectFeat,
  canFix: true,
  closeBox: true,
  //autoPan: true,
  positioning: 'top-left',
  backgroundposition: 'center-center',
  onclose: function () {
      selectFeat.getFeatures().clear();
  },
  template: {
      title: function (feature) {
          let layname = layer_selected ? layer_selected.get('name') : null;
          //let layname = layer_selected.get('name'); // Wert des Attributs "bw_id"
          if (!layname || (layname == 'sle' || layname == 'weh' || layname == 'que') && layname !== 'gew') {
              var content = '<div class="popup-content">';
              var beschreibLangValue = feature.get('beschreib_lang');
              var beschreibLangHtml = '';
              if (beschreibLangValue && beschreibLangValue.trim() !== '') {
                  beschreibLangHtml = '<br>' + '<u>' + "Beschreib (lang): " + '</u>' + beschreibLangValue + '</p>';
              };
              content = "";
              var foto1Value = feature.get('foto1');
              var foto1Html = '';
              var foto2Value = feature.get('foto2');
              var foto2Html = '';
              var foto3Value = feature.get('foto3');
              var foto3Html = '';
              var foto4Value = feature.get('foto4');
              var foto4Html = '';
              if (foto1Value && foto1Value.trim() !== '') {
                  foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
              } else {
                  foto1Html = " Foto 1 ";
              }
              if (foto2Value && foto2Value.trim() !== '') {
                  foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
              } else {
                  foto2Html = " Foto 2 ";
              }
              if (foto3Value && foto3Value.trim() !== '') {
                  foto3Html = '<a href="' + foto3Value + '" onclick="window.open(\'' + foto3Value + '\', \'_blank\'); return false;">Foto 3</a>';
              } else {
                  foto3Html = " Foto 3 ";
              }
              if (foto4Value && foto4Value.trim() !== '') {
                  foto4Html = '<a href="' + foto4Value + '" onclick="window.open(\'' + foto4Value + '\', \'_blank\'); return false;">Foto 4</a>';
              } else {
                  foto4Html = " Foto 4 ";
              }
              content =
                  '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') +
                  '<br>' + feature.get('KTR') + ')' + '</p>' +
                  '<p style="font-weight: normal";>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html +
                  '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') +
                  '<br>' + beschreibLangHtml + '</p>' +
                  '</div>';
              return content;
          } else if (!layname || layname === 'gew_info') {
              var content = '<div class="popup-content">';
              console.log('angekommen');
              content = "";
              content =
                  '<div style="max-height: 300px; overflow-y: auto;">' +
                  '<p>Name: ' + feature.get('IDUabschn') + '<br>' +
                  '<p><a href="' + feature.get('link1') + '" onclick="window.open(\'' + feature.get('link1') + '\', \'_blank\'); return false;">Link 1</a> ' +
                  '<a href="' + feature.get('link2') + '" onclick="window.open(\'' + feature.get('link2') + '\', \'_blank\'); return false;">Link 2</a> ' +
                  '<a href="' + feature.get('foto1') + '" onclick="window.open(\'' + feature.get('foto1') + '\', \'_blank\'); return false;">Foto 1</a> ' +
                  '<a href="' + feature.get('foto2') + '" onclick="window.open(\'' + feature.get('foto2') + '\', \'_blank\'); return false;">Foto 2</a><br>' +
                  '<p><a href="' + feature.get('BSB') + '" onclick="window.open(\'' + feature.get('BSB') + '\', \'_blank\'); return false;">BSB  </a>' +
                  '<a href="' + feature.get('MNB') + '" onclick="window.open(\'' + feature.get('MNB') + '\', \'_blank\'); return false;">MNB</a><br> ' +
                  'Kat: ' + feature.get('Kat') + '</a>' +
                  ', KTR: ' + feature.get('REFID_KTR') + '</a>' +
                  '<br>' + "von " + feature.get('Bez_Anfang') + " bis " + feature.get('Bez_Ende') + '</p>' +
                  '</div>';
              return content;
          } else if (!layname || layname === 'gew') {
              content = "";
              selectFeat.getFeatures().clear();
              return content;
          }
      },
      attributes:
      {
          'bw_id': { title: 'ID' },
      }
  },
});


selectFeat.on('select', function (e) {
  e.selected.forEach(function (featureSelected) {
      const layerName = selectFeat.getLayer(featureSelected).get('name');

      if (layerName !== 'gew') {
          // Setze layer_selected nur, wenn das layerName nicht 'gew' ist
          layer_selected = selectFeat.getLayer(featureSelected);
          console.log(layer_selected);
      } else {
          selectFeat.getFeatures().clear(); // Hebt die Selektion auf
          layer_selected = null; // Setze layer_selected auf null, da die Selektion aufgehoben wurde
      }
  });
});

map.addInteraction(selectFeat);
map.addOverlay(popup);

// -------------------------------------------------------WMS
function getLayersInGroup(layerGroup) {
  const layers = [];
  layerGroup.getLayers().forEach(layer => {
      if (layer instanceof LayerGroup) {
          // Wenn der Layer ein LayerGroup ist, rufe die Funktion rekursiv auf
          layers.push(...getLayersInGroup(layer));
      } else {
          // Füge den Layer zur Liste hinzu, wenn er ein TileLayer ist
          layers.push(layer);
      }
  });
  return layers;
}

function singleClickHandler(evt) {
//map.on('singleclick', function (evt) {
  const visibleLayers = [];
  map.getLayers().forEach(layer => {
      const layerName = layer.get('name');
      
      if (layer.getVisible()) {
          if (layer instanceof LayerGroup) {
              
            console.log(layerName);
            if (layerName !== 'NOH-Sat' && layerName !== 'Base'){
              visibleLayers.push(...getLayersInGroup(layer));
            }
          } else {
              visibleLayers.push(layer);
              
          }
      }
  });
  const viewResolution = map.getView().getResolution();
  const viewProjection = map.getView().getProjection();

  visibleLayers.forEach(layer => {
    const layerName = layer.get('name');
   
    if (layer.getVisible()) {
        const source = layer.getSource();
        if (source instanceof TileWMS && typeof source.getFeatureInfoUrl === 'function') {
            
            const url = source.getFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection, {'INFO_FORMAT': 'text/html'});
            if (url) {
                fetch(url)
                    .then((response) => response.text())
                    .then((html) => {
                        if (html.trim() !== '') {
                            //removeExistingInfoDiv();
                            var bodyIsEmpty = /<body[^>]*>\s*<\/body>/i.test(html);
                            if (bodyIsEmpty === false) {
                              var modifiedHTML = checkForLinkInTH(html);
                              
                              const infoDiv = createInfoDiv(layerName, modifiedHTML);
                              document.body.appendChild(infoDiv);
                            } else {
                                console.log('nichts verwertbares gefunden');
                                //alert('nichts verwertbares gefunden');
                            }
                        }
                    })
                    .catch((error) => {
                      console.error('Fehler beim Abrufen der Daten:', error);
                      alert('Es ist ein Fehler aufgetreten');
                    });
            }
        }
      }   
    }
  );
};

function createInfoDiv(name, html) {
  const infoDiv = document.createElement('p');
  infoDiv.id = 'info';
  infoDiv.classList.add('info-container');
  //infoDiv.innerHTML = `<strong>${name} Layer</strong><br>${html}`;
  infoDiv.innerHTML = `${html}`;
  const closeIcon = document.createElement('p');
  closeIcon.innerHTML = '&times;';
  closeIcon.classList.add('close-icon');
  closeIcon.addEventListener('click', function () {
    infoDiv.style.display = 'none';
  });
  infoDiv.appendChild(closeIcon);
  return infoDiv;
}

function removeExistingInfoDiv() {
  const existingInfoDiv = document.getElementById('info');
  if (existingInfoDiv) { existingInfoDiv.remove(); }
}

var cap = new WMSCapabilities({
  target: document.body,
  srs: ['EPSG:4326', 'EPSG:3857', 'EPSG:32632'],
  cors: true,
  popupLayer: true,
  placeholder: 'WMS link hier einfügen...',
  title: 'WMS-Service',
  searchLabel: 'Suche',
  optional: 'token',
  services: {
        
    'Hydro, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'WRRL, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/WRRL_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'Natur, Umweltkarten NI': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'HW-Schutz, Umwelkarten NI':'https://www.umweltkarten-niedersachsen.de/arcgis/services/HWSchutz_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'schutzgebiete, NL': 'https://service.pdok.nl/provincies/aardkundige-waarden/wms/v1_0?request=GetCapabilities&service=WMS',
   
},
  trace: true
});
map.addControl(cap);
cap.on('load', function (e) {
  map.addLayer(e.layer);
  e.layer.set('legend', e.options.data.legend);
});

