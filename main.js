

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Fill, Stroke, Style } from 'ol/style';
import TextButton from 'ol-ext/control/TextButton';
import {Circle as CircleStyle } from 'ol/style.js';
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import Bar from 'ol-ext/control/Bar';
import FullScreen from 'ol/control/FullScreen';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import Rotate from 'ol/control/Rotate';
import Toggle from 'ol-ext/control/Toggle'; // Importieren Sie Toggle
import { Draw, Modify, Select } from 'ol/interaction'; // Importieren Sie Draw


import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';


import LayerGroup from 'ol/layer/Group';
import { Circle } from 'ol/geom';

const mapView = new View({
  center: proj.fromLonLat([7.35, 52.7]),
  zoom: 9
});

const map = new Map({
  target: "map",
  view: mapView,
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
    url: './Layer/gew.geojson', // Verwenden Sie ein festes URL-Format
    strategy: LoadingStrategy.bbox 
  }),
  title: 'gew', // Titel für den Layer-Switcher
  name: 'gew',
  style: new Style({
    fill: new Fill({ color: 'rgba(0, 28, 240, 0.4)' }),
    stroke: new Stroke({ color: 'blue', width: 2 })
  })
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

map.addLayer(osmTileCr);
//map.addLayer(gew_layer_layer);
CreateMyControlBar();
