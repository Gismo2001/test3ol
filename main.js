import './style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Circle as CircleStyle, Fill, Stroke,Style} from 'ol/style.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control } from 'ol/control.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import * as LoadingStrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';
import SearchNominatim from 'ol-ext/control/SearchNominatim';
import VectorSource from 'ol/source/Vector';





const attribution = new Attribution({
  collapsible: false,
  html: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
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
      extent: [727361, 6839277, 858148, 6990951] // Geben Sie hier das Ausdehnungsintervall an
    }),
    attribution // Fügen Sie hier Ihre benutzerdefinierte Attribution-Steuerung hinzu
  ]),
  
});

// Fügen Sie die SearchNominatim-Steuerung zur Karte hinzu


const osmTileCr = new TileLayer({
  title: "osm-color",
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  visible: true,
  opacity: 0.75
});

map.addLayer(osmTileCr);

// Current selection
var sLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
      image: new CircleStyle({
          radius: 5,
          stroke: new Stroke ({
              color: 'rgb(255,165,0)',
              width: 3
          }),
          fill: new Fill({
              color: 'rgba(255,165,0,.3)'
          })
      }),
      stroke: new Stroke ({
          color: 'rgb(255,165,0)',
          width: 3
      }),
      fill: new Fill({
          color: 'rgba(255,165,0,.3)'
      })
  })
});
map.addLayer(sLayer);

// Set the search control 
var search = new SearchNominatim (
  {   //target: $(".options").get(0),
      polygon: $("#polygon").prop("checked"),
      position: true  // Search, with priority to geo position
  });
map.addControl (search);

// Select feature when click on the reference index
search.on('select', function(e)
  {   // console.log(e);
      sLayer.getSource().clear();
      // Check if we get a geojson to describe the search
      if (e.search.geojson) {
          var format = new ol.format.GeoJSON();
          var f = format.readFeature(e.search.geojson, { dataProjection: "EPSG:4326", featureProjection: map.getView().getProjection() });
          sLayer.getSource().addFeature(f);
          var view = map.getView();
          var resolution = view.getResolutionForExtent(f.getGeometry().getExtent(), map.getSize());
          var zoom = view.getZoomForResolution(resolution);
          var center = ol.extent.getCenter(f.getGeometry().getExtent());
          // redraw before zoom
          setTimeout(function(){
                  view.animate({
                  center: center,
                  zoom: Math.min (zoom, 16)
              });
          }, 100);
      }
      else {
          map.getView().animate({
              center:e.coordinate,
              zoom: Math.max (map.getView().getZoom(),16)
          });
      }
  });

  
 /*  var ve_hy = new TileLayer.VirtualEarth(
    "VirtualEarth Hybrid", 
    { type: VEMapStyle.Hybrid, 
      sphericalMercator: true
    }
);

// Stellen Sie sicher, dass 'map' definiert ist und 'addLayer()' eine gültige Methode für 'map' ist
map.addLayer(ve_hy); */

