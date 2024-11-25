// Define your location arrays
const parks = [
    {name: "Parque humedal La maria", lat: 3.3395137921087636, lng: -76.54191705416824, type: "park"},
    {name: "Humedal la Babilla", lat: 3.363744764479957, lng: -76.53631276496567, type: "park"},
    {name: "Parque condominio campestre palo verde", lat: 3.342508617718414, lng: -76.53674777471711, type: "park"},
    {name: "Parque del Ingenio", lat: 3.3868175459127996, lng: -76.5305288975732, type: "park"},
    {name: "EcoParque Lago De Las Garzas", lat: 3.3320609902928355, lng: -76.5369157501569, type: "park"},
    {name: "Parque Longitudinal del Río Lili", lat: 3.3678868957682973, lng: -76.53970532671289, type: "park"},
    {name: "Zona Deportiva Valle del Lili", lat: 3.3641499241095527, lng: -76.52749120921467, type: "park"},
    {name: "Corredor Ambiental Del Rio Lili", lat: 3.364333428885156, lng: -76.54171298133167, type: "park"},
    {name: "Ecoparque Río Pance", lat: 3.348679451579569, lng: -76.56898340298555, type: "park"}
    // Add more parks...
];

const gyms = [
    {name: "Gimnasio Bodytech Ciudad Jardín", lat: 3.369727899299529, lng: -76.52670750772155, type: "gym"},
    {name: "Be Fitness", lat: 3.3653330690673613, lng: -76.53279855438647, type: "gym"},
    {name: "Entrenamiento F45 Ciudad Jardín", lat: 3.3693604021688706, lng: -76.53697807579651, type: "gym"},
    {name: "Smart Fit - Unicentro", lat: 3.3735994124731996, lng: -76.53915081773192, type: "gym"},
    {name: "Parque natural USB", lat: 3.342910265742062, lng: -76.54441475087157, type: "gym"},
    {name: "Centro deportivo El marquez de Loyola", lat: 3.343517825279995, lng: -76.53444132933974, type: "gym"}
    // Add more gyms...
];

const foodCenters = [
    {name: "El Bohemio Bicicoffee", lat: 3.385947390516834, lng: -76.53125273968885, type: "food"},
    {name: "Vegano El Buen Alimento", lat: 3.3943377938202968, lng: -76.53656272791565, type: "food"},
    {name: "Plazoleta comidas jardín plaza", lat: 3.3707959301899537, lng: -76.52665966311942, type: "food"},
    {name: "Hoi An Cocina vietnamita", lat: 3.341169758257531, lng: -76.53530676872572, type: "food"},
    {name: "Miyamoto cali", lat: 3.340958092675911, lng: -76.53165652104613, type: "food"},
    {name: "Cocina natural Terra", lat: 3.343691207451982, lng: -76.52465999345615, type: "food"}
    // Add more food centers...
];

let map;
let markers = [];

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});

function initMap() {
    // Create map centered on USB (adjust these coordinates as needed)
    map = L.map('map').setView([3.345049672839344, -76.54448506129083], 15);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add all markers initially
    showAllLocations();
}

function createColoredMarker(type) {
    const markerColors = {
        gym: '#FF4444',    // Red for gyms
        park: '#4CAF50',   // Green for parks
        food: '#2196F3'    // Blue for food places
    };

    return L.divIcon({
        html: `<div style="
            background-color: ${markerColors[type]};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.3);
        "></div>`,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

function showAllLocations() {
    clearMarkers();
    
    // Add markers for all location types
    addMarkersForType(parks, 'green');
    addMarkersForType(gyms, 'red');
    addMarkersForType(foodCenters, 'blue');
    
    updateLocationsList();
}

function addMarkersForType(locations, color) {
    locations.forEach(location => {
        const marker = L.marker([location.lat, location.lng])
            .bindPopup(location.name)
            .addTo(map);
        
        markers.push({
            marker: marker,
            type: location.type,
            name: location.name
        });
    });
}

function filterLocations(type) {
    clearMarkers();
    
    let locationsToShow;
    switch(type) {
        case 'park':
            locationsToShow = parks;
            break;
        case 'gym':
            locationsToShow = gyms;
            break;
        case 'food':
            locationsToShow = foodCenters;
            break;
        default:
            showAllLocations();
            return;
    }
    
    addMarkersForType(locationsToShow);
    updateLocationsList(type);
}

function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker.marker));
    markers = [];
}

function updateLocationsList(filterType = null) {
    const placesList = document.getElementById('placesList');
    placesList.innerHTML = '';
    
    let locations = [];
    if (filterType) {
        switch(filterType) {
            case 'park':
                locations = parks;
                break;
            case 'gym':
                locations = gyms;
                break;
            case 'food':
                locations = foodCenters;
                break;
        }
    } else {
        locations = [...parks, ...gyms, ...foodCenters];
    }
    
    locations.forEach(location => {
        const placeItem = document.createElement('div');
        placeItem.className = 'place-item';
        placeItem.innerHTML = `
            <div class="place-info">
                <h3>${location.name}</h3>
                <p>${location.type}</p>
            </div>
        `;
        
        placeItem.addEventListener('click', () => {
            map.setView([location.lat, location.lng], 17);
        });
        
        placesList.appendChild(placeItem);
    });
}