

// Inhalt von myFunc.js
function initializeWMS(WMSCapabilities,map ) {
    var cap = new WMSCapabilities({
        target: document.body,
        srs: ['EPSG:4326', 'EPSG:3857', 'EPSG:32632'],
        cors: true,
        popupLayer: true,
        placeholder: 'WMS link hier einfügen...',
        title: 'WMS-Dienste',
        searchLabel: 'Suche',
        optional: 'token',
        services: {
        
    'Verwaltungsgrenzen NI ': 'https://opendata.lgln.niedersachsen.de/doorman/noauth/verwaltungsgrenzen_wms',                      
    'Hydro, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'WRRL, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/WRRL_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'Natur, Umweltkarten NI': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'HW-Schutz, Umwelkarten NI':'https://www.umweltkarten-niedersachsen.de/arcgis/services/HWSchutz_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
    'schutzgebiete, NL': 'https://service.pdok.nl/provincies/aardkundige-waarden/wms/v1_0?request=GetCapabilities&service=WMS',
    'wateren, NL': 'https://service.pdok.nl/kadaster/hy/wms/v1_0?',
    'EU-Waterbodies 3rd RBMP': 'https://water.discomap.eea.europa.eu/arcgis/services/WISE_WFD/WFD2022_SurfaceWaterBody_WM/MapServer/WMSServer?request=GetCapabilities&service=WMS'
    
        },
        trace: true
    });
    map.addControl(cap);
    cap.on('load', function (e) {
        map.addLayer(e.layer);
        e.layer.set('legend', e.options.data.legend);
   });
};

function checkForLinkInTH(html) {
    const table = document.createElement('table');
    table.innerHTML = html;

    const trs = table.querySelectorAll('tr');
    const secondTr = trs[1];

    if (secondTr) {
        const tds = secondTr.querySelectorAll('td');
        
        // Durchlaufe alle td-Tags im zweiten tr-Tag
        for (const td of tds) {
            // Prüfe, ob der Inhalt des td-Tags "https://" enthält
            if (td.textContent.includes('https://') || td.textContent.includes('http://')) {
                // Wenn ja, erstelle ein a-Element und setze den Link
                const link = td.textContent.trim();
                const aElement = document.createElement('a');
                aElement.href = link;
                aElement.target = '_blank';
                aElement.textContent = 'Link';
                
                // Lösche den Inhalt des td-Tags und füge das a-Element hinzu
                td.innerHTML = '';
                td.appendChild(aElement);
            }
        }
    }
    return table.outerHTML;
}


function dragElement(elmnt) {
    alert("Hall");
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown;
    }
  
    function dragMouseDown(e) {
      
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
  
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
}


function UTMToLatLon_Fix(east, north, zone, isNorthernHemisphere) {
  const a = 6378137;
  const e = 0.081819191;
  const k0 = 0.9996;
  const pi = Math.PI;

  if (!isNorthernHemisphere) {
      north -= 10000000;
  }

  let longOrigin = (zone - 1) * 6 - 180 + 3;
  let M = north / k0;
  let e1 = (1 - Math.sqrt(1 - e ** 2)) / (1 + Math.sqrt(1 - e ** 2));
  let mu = M / (a * (1 - e ** 2 / 4 - 3 * (e ** 4) / 64 - 5 * (e ** 6) / 256));
  
  let phi1Rad = mu + (3 * e1 / 2 - 27 * (e1 ** 3) / 32) * Math.sin(2 * mu)
              + (21 * (e1 ** 2) / 16 - 55 * (e1 ** 4) / 32) * Math.sin(4 * mu)
              + (151 * (e1 ** 3) / 96) * Math.sin(6 * mu);

  let N1 = a / Math.sqrt(1 - e ** 2 * Math.sin(phi1Rad) ** 2);
  let T1 = Math.tan(phi1Rad) ** 2;
  let C1 = (e ** 2) * Math.cos(phi1Rad) ** 2 / (1 - e ** 2);
  let R1 = a * (1 - e ** 2) / Math.pow(1 - e ** 2 * Math.sin(phi1Rad) ** 2, 1.5);
  let D = (east - 500000) / (N1 * k0);

  let lat = (phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D ** 2 / 2
      - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * e ** 2) * (D ** 4) / 24
      + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * e ** 2 - 3 * C1 ** 2) * (D ** 6) / 720)) * 180 / pi;

  let lon = longOrigin + ((D - (1 + 2 * T1 + C1) * (D ** 3) / 6
      + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * e ** 2 + 24 * T1 ** 2) * (D ** 5) / 120) / Math.cos(phi1Rad)) * 180 / pi;

  return `${lat.toFixed(6)},${lon.toFixed(6)}`;
}


