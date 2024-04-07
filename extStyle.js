import {Circle as CircleStyle, Fill, RegularShape, Icon, Stroke, Style, Text} from 'ol/style.js';
import { Point} from 'ol/geom.js';


//extfunc.js
const sleStyle = new Style({
    image: new Icon({
        src: './data/sle.svg',
        scale: .9 
    })
  });
const wehStyle = new Style({
    image: new Icon({
        src: './data/weh.svg',
        scale: .9 
    })
  });
const bru_nlwknStyle = new Style({
    image: new Icon({
    src: './data/bru_nlwkn.svg',
    scale: .9 
    })
});
const bru_andereStyle = new Style({
    image: new Icon({
    src: './data/bru_andere.svg',
    scale: .9 
    })
});
const dueStyle = new Style({
    image: new Icon({
        src: './data/due.svg',
        scale: .9
    })
});
const queStyle = new Style({
    image: new Icon({
    src: './data/que.svg',
    scale: .9
    })
});

const gehoelz_vecStyle = new Style({
    stroke: new Stroke({
    color: 'rgba(173, 114, 3, 1)',
    width: 3
    }),
});

function getStyleForArtUmn(feature) {
    const mnIdValue = feature.get('Massn_ID');
    let strokeColor;
  
    switch (mnIdValue) {
        // keine Mahd
        case 3:
        case 4:
        case 5:
            strokeColor = 'blue';
            break;
        // zweimalige Mahd
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
            strokeColor = 'black';
            break;
        // einmalige Mahd
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 26:
        case 27:
            strokeColor = 'green';
            break;
        // Schilfsaum belassen
        case 22:
        case 23:
            strokeColor = 'rgba(255, 190, 190, 0.5)';
            break;
        // keine Mahd am der unteren Böschung
        case 24:
        case 50:
        case 2:
            strokeColor = 'rgba(230, 152, 0, 0.5)';
            break;
        // Mahd an Bauwerken
        case 200:
        case 201:
            strokeColor = 'rgba(205, 205, 205, 1)';
            break;
        // Schilfkrautung
        case 300:
            strokeColor = 'rgba(230, 230, 0, 0.5)';
            break;
        // Bauwerksunterhaltung
        case 400:
            strokeColor = 'rgba(130, 130, 130, 1)';
            break;
        // beobachtende Unterhaltung
        default:
            strokeColor = 'grey';
    }
    return new Style({
        stroke: new Stroke({
            color: strokeColor,
            width: 5
        })
    });
};

function getStyleForArtGewInfo(feature) {
    const uIdValue = parseInt(feature.get('U_NR')); // Wandelt die Zeichenkette in eine Zahl um
    const uArt = feature.get('Kat');
    let strokeColor;
    let strokeWidth;
    let lineDash;

    if (!isNaN(uIdValue)) { // Überprüfen, ob die Umwandlung erfolgreich war
        if (uIdValue % 2 === 0) { // Überprüfen, ob die Zahl gerade ist
            strokeColor = 'green'; // Beispiel: grüne Farbe für gerade Zahlen
        } else {
            strokeColor = 'red'; // Beispiel: rote Farbe für ungerade Zahlen
        }
        strokeWidth = 5;
        // Überprüfen, ob "Kat" gleich "E" ist
        if (uArt === 'E') {
            lineDash = [10, 15]; // Gestrichelte Linie für "E"
        }
    } else {
        // Handle den Fall, wenn die Umwandlung fehlschlägt
        // Zum Beispiel: standardmäßige Farben und Stil für den Fehlerfall
        strokeColor = 'gray';
        strokeWidth = 5;
    }
    
    return new Style({
        fill: new Fill({
            color: strokeColor
        }),
        stroke: new Stroke({
            color: strokeColor,
            width: strokeWidth,
            lineDash: lineDash // Verwendung der lineDash-Eigenschaft für gestrichelte Linie, falls definiert
        })
    });    
};


function getStyleForArtSonLin(feature) {   
    const artValue = feature.get('bauart');
    let strokeColor;
    let strokeWidth;
    let lineDash;
    
    switch (artValue) {
        case 'Anlegehilfe':
            strokeColor = 'blue';
            strokeWidth = 3;
            break;
        case 'Sohlgleite':
            strokeColor = 'red';
            strokeWidth = 10;
            lineDash = [10, 5]; // Array mit Längen der Striche und Lücken
            break;
        default:
            strokeColor = 'black';
            lineDash = undefined; // Keine gestrichelte Linie für den Standardfall
    }
    
    return new Style({
        fill: new Fill({
            color: strokeColor
        }),
        stroke: new Stroke({
            color: strokeColor,
            width: strokeWidth,
            lineDash: lineDash // Verwendung der lineDash-Eigenschaft für gestrichelte Linie
        })
    });
}
function getStyleForArtEin(feature) {   
    const artValue = feature.get('Ein_ord');
    let iconSrc;
    switch (artValue) {
        case '1. Ordnung':
            iconSrc = './data/einErsterOrdnung.svg';
            break;
        case '2. Ordnung':
            iconSrc = './data/einZweiterOrdnung.svg';
            break;
        case '3. Ordnung':
            iconSrc = './data/einDritterOrdnung.svg';
            break;
        case 'Einleitung':
            iconSrc = './data/einEinleitung.svg';
            break;
        case 'Sonstige':
            iconSrc = './data/einSonstige.svg';
            break;
        default:
            iconSrc = './data/einSonstige.svg';
    }

    return new Style({
        image: new Icon({
            src: iconSrc,
            scale: .9 
        })
    });
}

function getStyleForArtSonPun(feature) {   
    const artValue = feature.get('bauart');
    let iconSrc;
    switch (artValue) {
        case 'Bootsanleger':
            iconSrc = './data/bwSonPun_Anleger.svg';
            break;
        case 'Betriebsgebäude':
            iconSrc = './data/sonPunBetrieb.svg';
            break;
        case 'Infotafel':
            iconSrc = './data/sonPunInfo.svg';
            break;
        case 'Auskolkung':
            iconSrc = './data/sonPunKolk.svg';
            break;
        case 'Furt':
            iconSrc = './data/bwSonPun_Furt.svg';
            break;
        case 'Tor':
            iconSrc = './data/bwSonPun_Tor.svg';
            break;
        case 'Überfahrt':
            iconSrc = './data/bwSonPun_Ueberfahrt.svg';
            break;
                case 'Betriebspegel':
            iconSrc = './data/bwSonPun_Betriebspegel.svg';
            break;
        default:
            iconSrc = './data/sonPunSonstige.svg';
    }
    return new Style({
        image: new Icon({
            src: iconSrc,
            scale: .9 
        })
    });
};
function machWasMitFSK(feature){
    console.log (feature.get('Art'));
};
function getStyleForArtFSK(feature) {
    const artValue = feature.get('Art');
    let fillColor, strokeColor;
    switch (artValue) {
    case 'p':
        fillColor = 'rgba(200, 200, 200, .6)';
        strokeColor = 'black';
        break;
    case 'o':
        fillColor = 'rgba(255, 220, 220, .6)';
        strokeColor = 'black';
        break;
    case 'l':
        fillColor = 'rgba(255, 190, 150, .6)';
        strokeColor = 'black';
        break;
    default:
        fillColor = 'rgba(255, 255, 255, 1)';
        strokeColor = 'grey';
    }
    return new Style({
        fill: new Fill({
            color: fillColor
        }),
        stroke: new Stroke({
            color: strokeColor,
            width: 0.5
        })
    });
};

const km10scalStyle = new Style({
    stroke: new Stroke({
        color: 'grey',
        width: .5
    })
});
const km100scalStyle = function(feature, km, resolution) {
    var minResolution = 0;
    var maxResolution = 5; 
    var kmInKilometer = km / 1000;
    var kmFormatted = kmInKilometer.toFixed(2);
    
    if (resolution > minResolution && resolution < maxResolution) {
        return new Style({
            text: new Text({
                text: kmFormatted.toString(), // Verwenden Sie den Wert von km als Text
                font: 'normal 18px "Arial Light", "Helvetica Neue Light", Arial, sans-serif',
                offsetX: -20,
                offsetY: 10,        
            }),
            stroke: new Stroke({
                color: 'black', // oder eine andere Linienfarbe
                width: 1 // oder eine andere Linienbreite  
            })
        });
    } else {
        return null;
    }
};
const km500scalStyle = function(feature, km, resolution) {
    var minResolution = 0;
    var maxResolution = 14; 
    var kmInKilometer = km / 1000;
    var kmFormatted = kmInKilometer.toFixed(2);
    if (resolution > minResolution && resolution < maxResolution) {
        return new Style({
            text: new Text({
                text: kmFormatted.toString(), // Verwenden Sie den Wert von km als Text
                font: 'bold 20px "Arial Light", "Helvetica Neue Light", Arial, sans-serif', // Fett formatierter Text
                offsetX: -35,
                offsetY: 10,
                fill: new Fill({
                    color: 'rgba(0, 0, 0, 1)'
                }),
            }),
            stroke: new Stroke({
                color: 'black', // oder eine andere Linienfarbe
                width: 2 // oder eine andere Linienbreite  
            })
        });
    } else {
        return null;
    }
};

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
    bru_andereStyle, 
    sleStyle,
    wehStyle, 
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
    machWasMitFSK
};
    
  

