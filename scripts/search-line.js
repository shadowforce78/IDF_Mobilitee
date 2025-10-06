const fs = require('fs');
const path = require('path');

/**
 * Script pour rechercher des lignes par nom ou numéro
 * Usage: node scripts/search-line.js "5134"
 */

const searchTerm = process.argv[2];

if (!searchTerm) {
    console.log('❌ Usage: node scripts/search-line.js "nom ou numéro de ligne"');
    process.exit(1);
}

console.log(`\n🔍 Recherche des lignes contenant "${searchTerm}"...\n`);

try {
    const linesPath = path.join(__dirname, '../data/referentiel-des-lignes.json');
    const lines = JSON.parse(fs.readFileSync(linesPath, 'utf8'));
    
    const results = lines.filter(line => 
        line.name_line?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.shortname_line?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.id_line?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (results.length === 0) {
        console.log('❌ Aucune ligne trouvée\n');
        process.exit(0);
    }
    
    console.log(`✅ ${results.length} ligne(s) trouvée(s):\n`);
    
    results.forEach((line, index) => {
        console.log(`${index + 1}. ${line.name_line} (${line.shortname_line})`);
        console.log(`   ID: ${line.id_line}`);
        console.log(`   Type: ${line.transportmode} (${line.transportsubmode})`);
        console.log(`   Opérateur: ${line.operatorname}`);
        console.log(`   Réseau: ${line.networkname}`);
        console.log(`   Couleur: #${line.colourweb_hexa}`);
        console.log('');
    });
    
    console.log(`💡 Pour utiliser cette ligne, ajoutez-la dans config/lines.json avec son ID\n`);
    
} catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier:', error.message);
    process.exit(1);
}
