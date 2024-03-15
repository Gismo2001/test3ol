import 'ol/ol.css'; // Sie müssen die OpenLayers-CSS-Datei weiterhin importieren, da das geo.okapi-Framework OpenLayers verwendet
new okapi.MapBuilder()
        .setLayers({
            baseLayers: [
                {
                    type: 'BKG',
                    name: 'WebAtlasDE',
                    ref: 'webatlasde_light',
                    visibility: true,
                    minResolution: 0.0001,
                    maxResolution: 156545
                }
            ],
            overlays: [
                {
                    type: 'MARKER',
                    name: 'Marker Leipzig',
                    visibility: true,
                    srsName: 'EPSG:4326',
                    markers: [
                        {
                            coordinates: {
                                lat: 50.091176,
                                lon: 8.663281
                            },
                            content: '<h3>Zentrale Dienststelle in Frankfurt am Main</h3><p>Bundesamt für Kartographie und Geodäsie<br>Richard-Strauss-Allee 11<br>60598 Frankfurt am Main<br>Deutschland</p>'

                        },
                        {
                            coordinates: {
                                lat: 51.354210,
                                lon: 12.374295
                            },
                            content: '<h3>Außenstelle Leipzig</h3><p>Bundesamt für Kartographie und Geodäsie<br> - Außenstelle Leipzig -<br>Karl-Rothe-Straße 10-14<br>04105 Leipzig<br>Deutschland</p>'
                        }
                    ],
                    minResolution: 0.0001,
                    maxResolution: 156545,
                    edit: false
                }
            ]
        })
        .create();