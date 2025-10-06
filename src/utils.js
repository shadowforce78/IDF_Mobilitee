const fs = require('fs');
const path = require('path');

/**
 * Calcule le temps restant formaté
 */
function calculateTimeUntil(departureTime) {
    if (!departureTime) return 'N/A';

    const now = new Date();
    const departure = new Date(departureTime);
    const diffMs = departure - now;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 0) return 'Parti';
    if (diffMin === 0) return 'À quai';
    if (diffMin === 1) return '1 min';
    return `${diffMin} min`;
}

/**
 * Formate l'heure
 */
function formatTime(isoTime) {
    if (!isoTime) return 'N/A';
    return new Date(isoTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Cherche un arrêt par son nom dans arrets.json
 */
function findStopByName(searchName) {
    try {
        const arretsPath = path.join(__dirname, '../data/arrets.json');
        const arrets = JSON.parse(fs.readFileSync(arretsPath, 'utf8'));
        const results = arrets.filter(arret =>
            arret.arrname.toLowerCase().includes(searchName.toLowerCase())
        );
        return results;
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du fichier arrets.json:', error.message);
        return [];
    }
}

/**
 * Cherche un arrêt par son ID
 */
function findStopById(stopId) {
    try {
        const arretsPath = path.join(__dirname, '../data/arrets.json');
        const arrets = JSON.parse(fs.readFileSync(arretsPath, 'utf8'));
        return arrets.find(arret => arret.arrid === stopId);
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du fichier arrets.json:', error.message);
        return null;
    }
}

/**
 * Affiche les prochains passages de manière formatée
 */
function displayDepartures(departures, title = '🚌 PROCHAINS PASSAGES') {
    if (departures.length === 0) {
        console.log('\n❌ Aucun passage à afficher\n');
        return;
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log(`║          ${title.padEnd(43)} ║`);
    console.log('╠═══════════════════════════════════════════════════════════╣');

    departures.forEach((dep, index) => {
        if (index > 0) {
            console.log('║-----------------------------------------------------------║');
        }

        const ligne = dep.ligne.padEnd(8);
        const destination = dep.destination.length > 25
            ? dep.destination.substring(0, 22) + '...'
            : dep.destination.padEnd(25);
        const temps = calculateTimeUntil(dep.heureReel || dep.heurePrevu).padStart(10);

        console.log(`║ Ligne: ${ligne} │ → ${destination} │ ${temps} ║`);

        const heure = formatTime(dep.heureReel || dep.heurePrevu);
        console.log(`║ Horaire: ${heure}                                              ║`);
    });

    console.log('╚═══════════════════════════════════════════════════════════╝\n');
}

module.exports = {
    calculateTimeUntil,
    formatTime,
    findStopByName,
    findStopById,
    displayDepartures
};
