require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.IDF_API_KEY;
const API_BASE_URL = 'https://prim.iledefrance-mobilites.fr/marketplace';

/**
 * Récupère les prochains passages pour un arrêt donné
 * @param {string} stopId - L'ID de l'arrêt
 * @param {string} lineFilter - (Optionnel) Filtre sur une ligne spécifique (ex: "C01521")
 * @param {string} stopFormat - (Optionnel) Format de l'arrêt: "StopPoint" (défaut) ou "StopArea" (pour les gares)
 * @returns {Promise<Array>} Liste des prochains passages
 */
async function getNextDepartures(stopId, lineFilter = null, stopFormat = 'StopPoint') {
    try {
        const url = `${API_BASE_URL}/stop-monitoring`;

        // Choisir le format en fonction du type d'arrêt
        const formatPrefix = stopFormat === 'StopArea' ? 'STIF:StopArea:SP:' : 'STIF:StopPoint:Q:';
        const monitoringRef = `${formatPrefix}${stopId}:`;

        const params = {
            MonitoringRef: monitoringRef
        };

        const response = await axios.get(url, {
            headers: {
                'apiKey': apiKey
            },
            params: params
        });

        const deliveries = response.data?.Siri?.ServiceDelivery?.StopMonitoringDelivery;

        if (!deliveries || deliveries.length === 0) {
            return [];
        }

        const delivery = deliveries[0];

        if (delivery.ErrorCondition) {
            console.error('❌ Erreur API:', delivery.ErrorCondition.ErrorInformation?.ErrorText);
            return [];
        }

        const monitoredStopVisits = delivery.MonitoredStopVisit || [];

        if (monitoredStopVisits.length === 0) {
            return [];
        }

        const departures = monitoredStopVisits.map(visit => {
            const journey = visit.MonitoredVehicleJourney;
            const call = journey?.MonitoredCall;

            return {
                ligne: journey?.PublishedLineName || journey?.LineRef?.value || 'N/A',
                lineRef: journey?.LineRef?.value || '',
                destination: journey?.DestinationName?.[0]?.value || 'N/A',
                arret: call?.StopPointName?.[0]?.value || '',
                heurePrevu: call?.AimedDepartureTime,
                heureReel: call?.ExpectedDepartureTime,
                tempsMinutes: getMinutesUntil(call?.ExpectedDepartureTime || call?.AimedDepartureTime)
            };
        });

        // Filtrer par ligne si demandé
        let filteredDepartures = departures;
        if (lineFilter) {
            filteredDepartures = departures.filter(dep =>
                dep.lineRef.includes(lineFilter)
            );
        }

        // Trier par temps restant
        filteredDepartures.sort((a, b) => a.tempsMinutes - b.tempsMinutes);

        return filteredDepartures;

    } catch (error) {
        console.error('❌ Erreur lors de la récupération des horaires:', error.message);
        return [];
    }
}

/**
 * Calcule le temps restant en minutes
 */
function getMinutesUntil(departureTime) {
    if (!departureTime) return Infinity;
    const now = new Date();
    const departure = new Date(departureTime);
    return Math.floor((departure - now) / 60000);
}

module.exports = {
    getNextDepartures
};
