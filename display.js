const { getNextDepartures } = require('./src/api');
const { displayDepartures, findStopById } = require('./src/utils');
const config = require('./config/lines.json');

/**
 * Affiche les prochains passages pour toutes les lignes configurées
 */
async function displayAllTransports() {
    console.log('\n🚍 === AFFICHAGE DES TRANSPORTS EN COMMUN === 🚊\n');
    
    // Parcourir tous les arrêts configurés
    for (const stopConfig of config.stops) {
        console.log(`\n${'='.repeat(65)}`);
        console.log(`📍 ${stopConfig.name} - ${stopConfig.town}`);
        console.log(`   ${stopConfig.description}`);
        console.log(`${'='.repeat(65)}`);
        
        // Parcourir toutes les lignes de cet arrêt
        for (const lineId of stopConfig.lines) {
            const lineInfo = config.lines.find(l => l.id === lineId);
            
            if (!lineInfo || !lineInfo.enabled) {
                continue;
            }
            
            console.log(`\n--- ${lineInfo.type.toUpperCase()} ${lineInfo.name} ---`);
            
            // Utiliser le format StopArea pour les gares ferroviaires
            const stopFormat = stopConfig.format || 'StopPoint';
            const departures = await getNextDepartures(stopConfig.id, lineId, stopFormat);
            
            if (departures.length > 0) {
                // Afficher les 5 prochains passages
                displayDepartures(departures.slice(0, 5), `${lineInfo.type.toUpperCase()} ${lineInfo.name}`);
            } else {
                console.log('⚠️  Aucun passage trouvé pour le moment\n');
            }
        }
        
        // Option: afficher tous les autres transports
        console.log('\n--- Tous les autres transports ---');
        const stopFormat = stopConfig.format || 'StopPoint';
        const allDepartures = await getNextDepartures(stopConfig.id, null, stopFormat);
        
        // Filtrer pour exclure les lignes déjà affichées
        const otherDepartures = allDepartures.filter(dep => 
            !stopConfig.lines.some(lineId => dep.lineRef.includes(lineId))
        );
        
        if (otherDepartures.length > 0) {
            displayDepartures(otherDepartures.slice(0, 3), 'Autres transports');
        } else {
            console.log('⚠️  Aucun autre transport trouvé\n');
        }
    }
}

/**
 * Affiche uniquement une ligne spécifique
 */
async function displayLine(lineName) {
    console.log(`\n🚍 === BUS/TRAIN ${lineName} === 🚊\n`);
    
    const lineInfo = config.lines.find(l => l.name === lineName);
    
    if (!lineInfo) {
        console.log(`❌ Ligne "${lineName}" non trouvée dans la configuration`);
        return;
    }
    
    if (!lineInfo.enabled) {
        console.log(`⚠️  La ligne "${lineName}" est désactivée`);
        return;
    }
    
    // Trouver tous les arrêts qui desservent cette ligne
    const stopsForLine = config.stops.filter(stop => 
        stop.lines.includes(lineInfo.id)
    );
    
    for (const stopConfig of stopsForLine) {
        console.log(`\n📍 ${stopConfig.name} - ${stopConfig.town}`);
        console.log(`   ${stopConfig.description}`);
        
        const departures = await getNextDepartures(stopConfig.id, lineInfo.id);
        
        if (departures.length > 0) {
            displayDepartures(departures.slice(0, 5), `${lineInfo.type.toUpperCase()} ${lineInfo.name}`);
        } else {
            console.log('⚠️  Aucun passage trouvé pour le moment\n');
        }
    }
}

// Point d'entrée principal
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // Afficher une ligne spécifique
        await displayLine(args[0]);
    } else {
        // Afficher tous les transports configurés
        await displayAllTransports();
    }
}

// Lancement du script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    displayAllTransports,
    displayLine
};
