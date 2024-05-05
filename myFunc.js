
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



