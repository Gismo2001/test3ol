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
import GeolocationButton from 'ol-ext/control/GeolocationButton';
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

 
var controlModification; // Globale Variable für die Interaktion

function CreateMyControlBar() {
  var mainBarCustom = new Bar();
  map.addControl(mainBarCustom);
  mainBarCustom.setPosition('left');

  var styleDrawing = new Style({
    fill: new Fill({
      color: 'rgba(0, 142, 2, 0.5)',
    }),
    stroke: new Stroke({
      color: '#008e02',
      width: 5
    }),
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: '#008e02'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 142, 2, 0.5)',
        width: 2,
      })
    })
  }); 

  var myMainBar = new Bar({
    group: true,
    toggleOne: true,
  });
  mainBarCustom.addControl(myMainBar);
  
  var vectorSource = new VectorSource();
  var vector = new VectorLayer({
    source: vectorSource,
    title: 'Punkte',
    displayInLayerSwitcher: false,
    style: styleDrawing,
  });
  map.addLayer(vector);

  controlModification = new Modify({source: vector.getSource() });
  map.addInteraction(controlModification);
  
  var controlPun = new Toggle({
    title: 'Punkt',
    html: '<i class="fa fa-map-marker" ></i>',
    interaction: new Draw({ 
      type: 'Point',
      source: vectorSource, 
    }),
  });
  myMainBar.addControl(controlPun);
  
  var controlLin = new Toggle({
    title: 'Linie',
    html: '<i class="fa fa-share-alt" ></i>',
    interaction: new Draw({ 
      type: 'LineString',
      source: vectorSource, 
    }),
    bar:  new Bar({
      controls:[
        new TextButton({
         title: 'rückgängig',
         html: 'rückgängi',
         handleClick: function(){
          controlLin.getInteraction().removeLastPoint();
         }
        }),
        new TextButton({
          title: 'Beenden',
          html: 'Beenden',
          handleClick: function(){
           controlLin.getInteraction().finishDrawing();
          }
        })
      ]
    })
  });
  myMainBar.addControl(controlLin);
  
  var controlFl = new Toggle({
    title: 'Flaeche',
    html: '<i class="fa fa-bookmark-o fa-rotate-270" ></i>',
    interaction: new Draw({ 
      type: 'Polygon',
      source: vectorSource, 
    }),
    bar:  new Bar({
      controls:[
        new TextButton({
         title: 'rückgängig',
         html: 'rückgängig',
         handleClick: function(){
          controlFl.getInteraction().removeLastPoint();
         }
        }),
        new TextButton({
          title: 'Beenden',
          html: 'Beenden',
          handleClick: function(){
           controlFl.getInteraction().finishDrawing();
          }
        })
      ]

    })
  });
  myMainBar.addControl(controlFl);
  
  var controlSelect = new Toggle({
    title: 'Element auswählen',
    html: '<i class="fa fa-hand-pointer-o"></i>',
    interaction: new Select(), 
    //active: false,
    onToggle: function(active) 
      {
        if (active) {
          console.log("Element auswählen ist aktiviert");
          map.removeInteraction(controlModification);
        } else {
          console.log("Element auswählen ist deaktiviert");
          map.addInteraction(controlModification);
        }
      },
    bar: new Bar({
      controls: [
        new TextButton({
        title: 'löschen',
        html: 'löschen',
        handleClick: function()
          {
            var features = controlSelect.getInteraction().getFeatures(); 
            if(features.getLength())
            {
              for(var i=0,f;f=features.item(i);i++)
                {vector.getSource().removeFeature(f); }
                controlSelect.getInteraction().getFeatures().clear();
            }
          }
        })
      ]  
    }),
  })
  
  myMainBar.addControl(controlSelect);
};

//---------------------------------------------Layergruppen
const BwGroupP = new LayerGroup({
  title: "Bauw.(P)",
  fold: true,
  fold: 'close',  
  layers: [ exp_bw_son_pun_layer, exp_bw_ein_layer, exp_bw_bru_andere_layer, exp_bw_bru_nlwkn_layer, exp_bw_que_layer, exp_bw_due_layer, exp_bw_weh_layer, exp_bw_sle_layer]
});

map.addLayer(osmTileCr);
map.addLayer(gew_layer_layer);
map.addLayer(BwGroupP);
CreateMyControlBar();

    // Add control
  var geoloc = new GeolocationButton({
    title: 'Where am I?',
    delay: 2000 // 2s
  });
    map.addControl(geoloc);
    
    // Show position
    var here = new Popup({ positioning: 'bottom-center' });
    map.addOverlay(here);
    geoloc.on('position', function(e) {
      if (e.coordinate) here.show(e.coordinate, "You are<br/>here!");
      else here.hide();
    });

