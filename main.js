import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';

import TextButton from 'ol-ext/control/TextButton';
import Overlay from 'ol-ext/control/Overlay';
import Tooltip from 'ol-ext/overlay/Tooltip';
import Popup from 'ol-ext/overlay/Popup';
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
  
} from './extStyle';

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
  source: new VectorSource({
    format: new GeoJSON(),
    url: './myLayers/gew.geojson', // Verwenden Sie ein festes URL-Format
    strategy: LoadingStrategy.bbox 
  }),
  title: 'gew', // Titel für den Layer-Switcher
  name: 'gew',
  style: new Style({
    fill: new Fill({ color: 'rgba(0, 28, 240, 0.4)' }),
    stroke: new Stroke({ color: 'blue', width: 2 })
  })
});
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
  style: bru_andereStyle,
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

 


//---------------------------------------------Layergruppen
const BwGroupP = new LayerGroup({
  title: "Bauw.(P)",
  fold: true,
  fold: 'close',  
  layers: [ exp_bw_son_pun_layer, exp_bw_ein_layer, exp_bw_bru_andere_layer, exp_bw_bru_nlwkn_layer, exp_bw_que_layer, exp_bw_due_layer, exp_bw_weh_layer, exp_bw_sle_layer]
});


// New vector layer
var vectorP = new VectorLayer({
  name: 'vectorP',
  source: new VectorSource()
});

map.addLayer(vectorP);
map.addLayer(osmTileCr);
map.addLayer(gew_layer_layer);
map.addLayer(BwGroupP);


 // Add control
 var geoloc = new GeolocationButton({
  title: 'Where am I?',
  delay: 2000 // 2s
});
map.addControl(geoloc);

//  Vector layer
var vector = new VectorLayer( { source: new VectorSource() })

map.addLayer(vector);

var note = new Notification();

map.addControl(note)

// Add the editbar
var select = new Select({ title: 'Sélection'});
select.set('title', 'Sélection');
var edit = new EditBar({
  edition: true,
  // Translate interaction title / label 
  interactions: { 
    // Use our own interaction > set the title inside
    Select: select,
    // Define button title
    DrawLine: 'Linie',
    //DrawRegular: { title: 'Forme régullière', ptsLabel: 'pts', circleLabel: 'cercle' }
  },
  source: vector.getSource() 
});
map.addControl(edit);

// Add a tooltip
var tooltip = new Tooltip();
map.addOverlay(tooltip);

edit.getInteraction('Select').on('select', function(e){
  if (this.getFeatures().getLength()) {
    tooltip.setInfo('Drag points on features to edit...');
  }
  else tooltip.setInfo();
});
edit.getInteraction('Select').on('change:active', function(e){
  tooltip.setInfo('');
});
edit.getInteraction('ModifySelect').on('modifystart', function(e){
  if (e.features.length===1) tooltip.setFeature(e.features[0]);
});
edit.getInteraction('ModifySelect').on('modifyend', function(e){
  tooltip.setFeature();
});
edit.getInteraction('DrawPoint').on('change:active', function(e){
  tooltip.setInfo(e.oldValue ? '' : 'Click map to place a point...');
});
edit.getInteraction('DrawLine').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing line...');
});
edit.getInteraction('DrawLine').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing line...');
});
edit.getInteraction('DrawPolygon').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing shape...');
});
edit.getInteraction('DrawPolygon').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');
});
 edit.getInteraction('DrawHole').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing hole...');
});
edit.getInteraction('DrawHole').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click polygon to start drawing hole...');
});
edit.getInteraction('DrawRegular').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Move and click map to finish drawing...');
});
edit.getInteraction('DrawRegular').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');
});


edit.on('info', function(e){
  console.log(e)
  note.show('<i class="fa fa-info-circle"></i> '+e.features.getLength()+' feature(s) selected');
});
 
  
