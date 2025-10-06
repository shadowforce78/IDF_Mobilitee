const express = require('express');
const path = require('path');
require('dotenv').config();

const { getNextDepartures } = require('./src/api');
const config = require('./config/lines.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques du dossier web
app.use(express.static('web'));

// API endpoint pour récupérer tous les départs
app.get('/api/departures', async (req, res) => {
    try {
        const results = [];

        // Créer un map des lignes pour accès rapide
        const linesMap = {};
        for (const line of config.lines) {
            if (line.enabled) {
                linesMap[line.id] = line;
            }
        }

        // Parcourir tous les arrêts configurés
        for (const stop of config.stops) {
            const stopFormat = stop.format || 'StopPoint';

            // Pour chaque ligne de cet arrêt
            for (const lineId of stop.lines) {
                const line = linesMap[lineId];
                if (!line) continue; // Ligne désactivée ou inexistante

                const departures = await getNextDepartures(stop.id, lineId, stopFormat);

                // Enrichir et formater les données pour le frontend
                const enrichedDepartures = departures.map(dep => ({
                    destination: dep.destination,
                    time: dep.heureReel || dep.heurePrevu,
                    platform: null,
                    lineName: line.name,
                    lineType: line.type,
                    lineColor: line.color
                }));

                // Regrouper par destination
                const destinationGroups = {};
                enrichedDepartures.forEach(dep => {
                    if (!destinationGroups[dep.destination]) {
                        destinationGroups[dep.destination] = [];
                    }
                    destinationGroups[dep.destination].push(dep);
                });

                // Créer une entrée par destination
                for (const [destination, depsForDestination] of Object.entries(destinationGroups)) {
                    results.push({
                        stop: {
                            id: stop.id,
                            name: stop.name,
                            town: stop.town,
                            description: stop.description
                        },
                        line: {
                            id: lineId,
                            name: line.name,
                            type: line.type,
                            color: line.color
                        },
                        destination: destination,
                        departures: depsForDestination
                    });
                }
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Erreur API:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
});

// Route pour la page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur web démarré sur http://localhost:${PORT}`);
    console.log(`📺 Ouvrez votre navigateur sur http://localhost:${PORT}`);
    console.log(`\n💡 Pour afficher sur une TV:`);
    console.log(`   1. Ouvrez l'URL sur la TV ou un ordinateur connecté`);
    console.log(`   2. Appuyez sur F11 pour le mode plein écran`);
    console.log(`   3. Les données se rafraîchiront automatiquement toutes les 30 secondes\n`);
});

module.exports = app;
