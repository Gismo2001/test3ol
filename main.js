import 'ol/ol.css'; // Sie müssen die OpenLayers-CSS-Datei weiterhin importieren, da das geo.okapi-Framework OpenLayers verwendet

new okapi.MapBuilder()
  .setTarget('map')             
  .setView({
      projection: 'EPSG:25832'  
  })
  .setLayers({
      baseLayers: [
          {
              type: 'BKG',
              name: 'TopPlusOpen',
              ref: 'topplus_open',
              visibility: true
          }
      ],
      overlays: [
        {
            type: 'GPS',
            name: 'GPS Layer',
            url: 'data/exp_bw_weh.gpx',
            visibility: true,
            minResolution: 0.0001,
            maxResolution: 156545,
            edit: false
        }
    ]
  })
  .setView({
    projection: 'EPSG:25832',
    center: {
        lon: 472624.676559,
        lat: 5554554.520574
    },
    zoom: 9
})
  .setControls({
    panelPosition: 'right',
      tools: {
        layerSwitcher: {
          active: true,
          style: 'customLayerSwitcher',
          editStyle: false,
          changeVisibility: true,
          showWMSLayers: true,
          changeOrder: true,
          openLevel: 0
           },
          copyright: {active: true},
          //copyCoordinates: { active: true },
          showAttributes: {active: true},
          //showCoordinates: {active: true},
          zoom: {active: true}
          
      }
  })
  .create();

 
