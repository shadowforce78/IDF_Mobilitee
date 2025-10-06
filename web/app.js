async function load() {
    try {
        const res = await fetch('/api/departures');
        const data = await res.json();

        // Filtrer les données valides
        const validItems = [];
        data.forEach(item => {
            const valid = item.departures.filter(d => d.time && !isNaN(new Date(d.time).getTime()));
            if (valid.length > 0) {
                validItems.push({ ...item, departures: valid });
            }
        });

        // Une seule colonne: on garde tous les éléments
        const singleColumnItems = validItems;

        // Fonction pour créer un tableau
        function createTable(items) {
            let html = '<table><thead><tr><th>Ligne</th><th>Arrêt</th><th>Destination</th><th>Départs</th></tr></thead><tbody>';
            items.forEach(item => {
                const lineColor = (item.line && item.line.color) || (item.departures && item.departures[0] && item.departures[0].lineColor) || '#888888';
                const times = item.departures.slice(0, 2).map(d => {
                    const min = Math.max(0, Math.floor((new Date(d.time) - new Date()) / 60000));
                    return '<div class="departure-time ' + (min <= 2 ? 'soon' : '') + '"><span class="minutes">' + min + ' min</span><span class="hour">' + '</span></div>';
                }).join('');
                html += '<tr style="border-left: 6px solid ' + lineColor + '">'
                    + '<td class="line-cell">'
                    + '<span class="line-badge" style="background:' + lineColor + '"></span>'
                    + '<b>' + item.line.name + '</b>'
                    + '</td>'
                    + '<td>' + item.stop.name + '</td>'
                    + '<td>' + item.destination + '</td>'
                    + '<td class="departures-cell">' + times + '</td>'
                    + '</tr>';
            });
            html += '</tbody></table>';
            return html;
        }

        // Afficher une seule colonne (un seul tableau)
        const html = '<div class="column">' + createTable(singleColumnItems) + '</div>';
        document.getElementById('app').innerHTML = html;

    } catch (e) {
        document.getElementById('app').innerHTML = '<p style="color:red">Erreur: ' + e.message + '</p>';
    }
}


function pageScroll() {
    // Get total size and current scroll position
    const totalHeight = document.body.scrollHeight; // Marge en bas
    const currentScroll = window.scrollY + window.innerHeight;
    // If not at the bottom, scroll down
    if (currentScroll < totalHeight) {
        window.scrollBy(0, 1);
        console.log('Scrolling... Current:', currentScroll, 'Total:', totalHeight);
        setTimeout(pageScroll, 10);
    } else {
        // If at the bottom, scroll back to top and restart
        // Wait a bit at the bottom
        setTimeout(() => {
            window.scrollTo(0, 0);
            console.log('Restarting scroll');
            setTimeout(pageScroll, 2000); // Pause 2 seconds at the top
        }, 2000);
    }
}

// Charger les données au démarrage
load();
// Démarrer le défilement automatique
pageScroll();
// Rafraîchir toutes les 10 secondes
setInterval(load, 10000);
