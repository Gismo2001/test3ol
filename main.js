import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Fill, Stroke, Style } from 'ol/style';

import FullScreen from 'ol/control/FullScreen';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import Rotate from 'ol/control/Rotate';
import { Draw, Modify, Select } from 'ol/interaction'; // Importieren Sie Draw
import Polygon from 'ol/geom/Polygon.js';
import LineString from 'ol/geom/LineString';


import TextButton from 'ol-ext/control/TextButton';
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import Bar from 'ol-ext/control/Bar';
import Button from 'ol-ext/control/Button';
import Toggle from 'ol-ext/control/Toggle'; // Importieren Sie Toggle
import '@fortawesome/fontawesome-free/css/all.css';

import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';


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

// Stildefinition für Linien
var lineStyle = new Style({
  stroke: new Stroke({
    color: 'blue', // Farbe der Linien
    width: 5 // Strichstärke in Pixeln
  })
});

// Vector layer mit benutzerdefiniertem Stil
var vector = new VectorLayer({
  source: new VectorSource(),
  style: lineStyle // Verwendung des benutzerdefinierten Stils für alle Linien im Layer
});


 
 // Main control bar
 var mainbar = new Bar();
 mainbar.setPosition('top-left');
 map.addControl(mainbar);

 // Edit control bar 
 var editbar = new Bar({
   toggleOne: true,	// one control active at the same time
   group:false			// group controls together
 });
 mainbar.addControl(editbar);

 // Add selection tool:
 //  1- a toggle control with a select interaction
 //  2- an option bar to delete / get information on the selected feature
 var sbar = new Bar();
 sbar.addControl (new Button({
   html: '<i class="fa fa-times"></i>',
   title: "Delete",
   handleClick: function() {
     var features = selectCtrl.getInteraction().getFeatures();
     if (!features.getLength()) info("Select an object first...");
     else info(features.getLength()+" object(s) deleted.");
     for (var i=0, f; f=features.item(i); i++) {
       vector.getSource().removeFeature(f);
     }
     selectCtrl.getInteraction().getFeatures().clear();
   }
 }));
 sbar.addControl (new Button({
   html: '<i class="fa fa-info"></i>',
   title: "Show informations",
   handleClick: function() {
     switch (selectCtrl.getInteraction().getFeatures().getLength()){
       case 0: info("Select an object first...");
         break;
       case 1:
         var f = selectCtrl.getInteraction().getFeatures().item(0);
         info("Selection is a "+f.getGeometry().getType());
         function info(i){
          alert(i || "");
         }
         break;
       default:
         info(selectCtrl.getInteraction().getFeatures().getLength()+ " objects seleted.");
         break;
     }
   }
 }));

 var selectCtrl = new Toggle({
   html: '<i class="fa fa-hand-pointer-o"></i>',
   title: "Select",
   interaction: new Select ({ hitTolerance: 2 }),
   bar: sbar,
   autoActivate:true,
   active:true
 });

 editbar.addControl (selectCtrl);

 // Add editing tools
 var pedit = new Toggle({
   html: '<i class="fa fa-map-marker" ></i>',
   title: 'Point',
   interaction: new Draw({
     type: 'Point',
     source: vector.getSource()
   })
 });
 editbar.addControl ( pedit );

 var ledit = new Toggle({
   html: '<i class="fa fa-share-alt" ></i>',
   title: 'LineString',
   interaction: new Draw({
     type: 'LineString',
     source: vector.getSource(),
     // Count inserted points
     geometryFunction: function(coordinates, geometry) {
         if (geometry) geometry.setCoordinates(coordinates);
       else geometry = new LineString(coordinates);
       this.nbpts = geometry.getCoordinates().length;
       return geometry;
     },
     
   }),
   // Options bar associated with the control
   bar: new Bar({
     controls:[ 
       new TextButton({
         html: 'undo',
         title: "Delete last point",
         handleClick: function() {
           if (ledit.getInteraction().nbpts>1) ledit.getInteraction().removeLastPoint();
         }
       }),
       new TextButton({
         html: 'Finish',
         title: "finish",
         handleClick: function() {
           // Prevent null objects on finishDrawing
          
           if (ledit.getInteraction().nbpts>2) ledit.getInteraction().finishDrawing();
         }
       })
     ]
   }) 
 });

 editbar.addControl ( ledit );

 var fedit = new Toggle({
   html: '<i class="fa fa-bookmark-o fa-rotate-270" ></i>',
     title: 'Polygon',
     interaction: new Draw({
       type: 'Polygon',
       source: vector.getSource(),
       // Count inserted points
       geometryFunction: function(coordinates, geometry) {
         this.nbpts = coordinates[0].length;
         if (geometry) geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
         else geometry = new Polygon(coordinates);
         return geometry;
       }
      }),
     // Options bar ssociated with the control
     bar: new Bar({
       controls:[ new TextButton({
         html: 'undo',//'<i class="fa fa-mail-reply"></i>',
         title: "undo last point",
         handleClick: function() {
           if (fedit.getInteraction().nbpts>1) fedit.getInteraction().removeLastPoint();
         }
       }),
       new TextButton({
         html: 'finish',
         title: "finish",
         handleClick: function() {
           // Prevent null objects on finishDrawing
           if (fedit.getInteraction().nbpts>3) fedit.getInteraction().finishDrawing();
         }
       })
     ]
   }) 
 });
 editbar.addControl ( fedit );

 // Add a simple push button to save features
 var save = new Button({
   html: '<i class="fa fa-download"></i>',
   title: "Save",
   handleClick: function(e) {
     var json= new GeoJSON().writeFeatures(vector.getSource().getFeatures());
     info(json);
   }
 });
 mainbar.addControl ( save );

/* 
 // Show info
 function info(i){
   $("#info").html(i||"");
 } */

function info(i){
  alert(i || "");
}

 map.addLayer(vector);