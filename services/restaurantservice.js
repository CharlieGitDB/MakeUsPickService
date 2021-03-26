const axios = require('axios');
const LobbyService = require('./lobbyservice');
const UserService = require('./userservice');

function RestaurantService() {
    const API_KEY = process.env.API_KEY;
    const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

    this.getRestaurants = async function(postalCode) {
        let params = {
            query: `restaurants+near+${postalCode}`,
            key: API_KEY
        }
    
        const response = await axios.get(GOOGLE_PLACES_API_URL, {params});
        const {results} = response.data;
        
        if (results == null || results.length <= 0) {
            throw new Error('Unable to find restaurants');
        }

        let restaurants = results
            .filter(restaurant => {
                let openingHours = restaurant.opening_hours;
                if (openingHours == null) {
                    return false;
                }

                return openingHours.open_now === true;
            });

        if (restaurants == null || restaurants.length <= 0) {
            throw new Error('Currently no restaurants open near you.');
        }

    
        restaurants = restaurants
            .filter(restaruant => restaruant['business_status'] === 'OPERATIONAL')

        if (restaurants == null || restaurants.length <= 0) {
            throw new Error('Currently no restaurants operantional near you.');
        }

        restaurants = restaurants
            .map(restaurant => {
                return {
                    id: restaurant['place_id'],
                    address: restaurant['formatted_address'],
                    name: restaurant['name'],
                    photoUrl: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant['photos'][0]['photo_reference']}&key=${API_KEY}`,
                    priceRating: restaurant['price_level']
                }
            });
    
        return restaurants;
    }

    this.addRestaurant = async function(lobbyCode, uid, restaurantId) {
        let lobby = await LobbyService.getLobby(lobbyCode);
        let user = await UserService.getUser(lobby.lobbyCode, uid);

        if (!this._restaurantExists(restaurantId, lobby.restaurants)) {
            throw new Error('Invalid restaurant id');
        }

        if (user.select == null) {
            user.selected = [];
        }

        user.selected.push(restaurantId);
        UserService.update(lobby, user);

        return user;
    }

    this.getMatchedRestaurants = function(lobby) {
        let matches = [];
        let fullMatches = [];
        let userOneChoices = lobby.users[0].selected;
        if (userOneChoices.length > 0 && lobby.users[1].selected.length > 0) {
            lobby.users[1].selected.forEach(choice => {
                if (userOneChoices.includes(choice)) {
                    matches.push(choice);
                }
            });
    
            lobby.restaurants.forEach(restaurant => {
               matches.forEach(match => {
                   if (restaurant.id === match) {
                       fullMatches.push(restaurant);
                   }
               }); 
            });
        }
    
        return fullMatches;
    }

    this._restaurantExists = function(restaurantId, restaurants) {
        return restaurants.filter(restaurant => restaurant.id == restaurantId).length > 0;
    }
    
}


module.exports = new RestaurantService();