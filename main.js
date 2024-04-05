import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS.js';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';
import TextButton from 'ol-ext/control/TextButton';
import Button from 'ol-ext/control/Button';
import Overlay from 'ol-ext/control/Overlay';
import Tooltip from 'ol-ext/overlay/Tooltip';
//import Popup from 'ol-ext/overlay/Popup';
import PopupFeature from 'ol-ext/overlay/PopupFeature';
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
import { 
  sleStyle,
  getStyleForArtSonPun,
  getStyleForArtEin,
  queStyle,
  dueStyle,
  wehStyle,
  bru_nlwknStyle,
  bru_andereStyle,
  combinedStyle,
  
} from './extStyle';


var schalterGeoloc = false;
var schalterEditBar = false;
var schalterPopup = false;

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
  controls: defaultControls().extend([
    new FullScreen(),
    new ZoomToExtent({
       extent: [727361, 6839277, 858148, 6990951] // Geben Sie hier das Ausdehnungsintervall an
     }),
    attribution // Fügen Sie hier Ihre benutzerdefinierte Attribution-Steuerung hinzu
  ]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()])
});
var layerSwitcher = new LayerSwitcher({activationMode: 'click' });
map.addControl(layerSwitcher);
//Start Layer--------------------------------------------------
const osmTileCr = new TileLayer({
  title: "osm-color",
  type: 'base',
  source: new OSM({
    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  }),
  visible: true,
  opacity: 1
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
  visible: true
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
//Ende Layer--------------------------------------------------

const BwGroupP = new LayerGroup({
  title: "Bauw.(P)",
  fold: true,
  fold: 'close',  
  layers: [ exp_bw_que_layer, exp_bw_due_layer, exp_bw_weh_layer, exp_bw_sle_layer]
});

const BwGroupL = new LayerGroup({
  title: "Bauw.(L)",
  fold: true,
  fold: 'close',  
  layers: [ exp_gew_info_layer ]
});

//Start Layer hinzufügen---------------------------------------
map.addLayer(osmTileCr);
map.addLayer(wmsUesgLayer);
map.addLayer(BwGroupL);
map.addLayer(BwGroupP);

//Ende Layer hinzufügen---------------------------------------

var vector = new VectorLayer(
   { source: new VectorSource() })
map.addLayer(vector);
 

var selectFeat = new Select({
  hitTolerance: 5,
  multi: true,
  condition: ol.events.condition.singleClick
});


let layer_selected;
selectFeat.on('select', function(e) {
    let featureSelected = e.selected[0];
    layer_selected = selectFeat.getLayer(featureSelected);  
    console.log(layer_selected.get('name'));
});
map.addInteraction(selectFeat);




var popup = new PopupFeature({
  popupClass: 'popup', // Verwenden Sie Ihre benutzerdefinierte Popup-Klasse hier
  select: selectFeat,
  canFix: true,
  closeBox: true,
  template: {
    title: function(feature) {
      
      var layname = layer_selected.get('name');
      
      if (layname == 'sle' || layname == 'weh' || layname == 'que' ) {
      
      console.log(layer_selected.get('name'));
      var content = '<div class="popup-content">';
      var beschreibLangValue = feature.get('beschreib_lang');
      var beschreibLangHtml = '';
      if (beschreibLangValue && beschreibLangValue.trim() !== '') {
        beschreibLangHtml = '<br>' + '<u>' + "Beschreib (lang): " + '</u>' + beschreibLangValue + '</p>';
        // HTML-Tag Foto1
      };
     
       
        content= "";
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
         foto1Html =   " Foto 1 ";
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
          '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
          '<p>' + "Id = " + feature.get('bw_id') +  ' (' + feature.get('KTR') +')' +  '</p>' +
          '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
          '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
          '<p>' + beschreibLangHtml + '</p>' +
          '</div>';
        return content;

      } else if(layname === 'gew_info') {  
      
        content = "";
        console.log('angekommen info');      
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
        '<br>' + "von " + feature.get('Bez_Anfang') + " bis " + feature.get('Bez_Ende')  + '</p>' +
        '</div>';
        return content;
      }

      
    },  
    attributes: 
    {
    },
   
  },
});
map.addOverlay(popup);




