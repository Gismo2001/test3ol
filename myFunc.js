import {Circle as CircleStyle, Fill, RegularShape, Icon, Stroke, Style, Text} from 'ol/style.js';
import { Point} from 'ol/geom.js';

const arrowStyle = new Style({
    stroke: new Stroke({
        color: 'black',
        width: 4,
    }),
});
const endpointStyle = new Style({
    geometry: function (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        return new Point(coordinates[coordinates.length - 1]);
    },
    image: new CircleStyle({
        radius: 6,          // Radius des Kreises (Endpunkt)
        fill: new Fill({ color: 'red' }), // Füllfarbe des Kreises
        stroke: new Stroke({
        color: 'black',    // Randfarbe des Kreises
        width: 2,          // Breite des Randes
        }),
    }),
});
const combinedStyle = [arrowStyle, endpointStyle];

export { 
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
    km100scalStyle,
    km500scalStyle,
    combinedStyle,
    machWasMitFSK
};
    