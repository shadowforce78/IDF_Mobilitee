const { findStopByName } = require('../src/utils');

/**
 * Script pour rechercher des arrêts par nom
 * Usage: node scripts/search-stop.js "nom de l'arrêt"
 */

const searchTerm = process.argv[2];

if (!searchTerm) {
    console.log('❌ Usage: node scripts/search-stop.js "nom de l\'arrêt"');
    process.exit(1);
}

console.log(`\n🔍 Recherche des arrêts contenant "${searchTerm}"...\n`);

const stops = findStopByName(searchTerm);

if (stops.length === 0) {
    console.log('❌ Aucun arrêt trouvé\n');
    process.exit(0);
}

console.log(`✅ ${stops.length} arrêt(s) trouvé(s):\n`);

stops.forEach((stop, index) => {
    console.log(`${index + 1}. ${stop.arrname}`);
    console.log(`   ID: ${stop.arrid}`);
    console.log(`   Ville: ${stop.arrtown}`);
    console.log(`   Type: ${stop.arrtype}`);
    console.log(`   Coordonnées: X=${stop.arrxepsg2154}, Y=${stop.arryepsg2154}`);
    console.log('');
});

console.log(`💡 Pour utiliser cet arrêt, ajoutez-le dans config/lines.json\n`);
