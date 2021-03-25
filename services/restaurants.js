const axios = require('axios');

const API_KEY = process.env.API_KEY;
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

async function getRestaurants(postalCode) {
    let params = {
        query: `restaurants+near+${postalCode}`,
        key: API_KEY
    }

    const response = await axios.get(GOOGLE_PLACES_API_URL, {params});
    const {results} = response.data;
    let restaurants = results
        .filter(diner => diner['opening_hours']['open_now'] === true)
        .filter(diner => diner['business_status'] === 'OPERATIONAL')
        .map(diner => {
            return {
                id: diner['place_id'],
                address: diner['formatted_address'],
                name: diner['name'],
                photoUrl: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${diner['photos'][0]['photo_reference']}&key=${API_KEY}`,
                priceRating: diner['price_level']
            }
        });

    return restaurants;
}

module.exports = getRestaurants;