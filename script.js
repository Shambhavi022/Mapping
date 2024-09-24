const map = L.map('map').setView([20.5937, 78.9629], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let routeControl = null;
let vehicleRoute = null;
let vehicleIndex = 0;
let vehicleMovementInterval = null;

async function geocodeLocation(locationName) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } else {
        alert(`Location not found: ${locationName}`);
        return null;
    }
}

function getRoute(currentLocation, destination) {
    if (routeControl) {
        map.removeControl(routeControl);
    }

    routeControl = L.Routing.control({
        waypoints: [
            L.latLng(currentLocation.lat, currentLocation.lon),
            L.latLng(destination.lat, destination.lon)
        ],
        routeWhileDragging: true,
        createMarker: function () { return null; }
    }).addTo(map);

    vehicleRoute = routeControl.getRoutes()[0].coordinates;
    document.getElementById('journey-confirmation').style.display = 'block'; // Show confirmation dropdown
}

function startVehicleMovement() {
    if (vehicleRoute.length > 0) {
        vehicleIndex = 0; // Reset index
        vehicleMovementInterval = setInterval(() => {
            if (vehicleIndex < vehicleRoute.length - 1) {
                vehicleIndex++;
                alert("You are moving on the route!"); // Alert when starting journey
            } else {
                clearInterval(vehicleMovementInterval);
            }
        }, 1000);
    }
}

document.getElementById('find-route').addEventListener('click', async () => {
    const latInput = document.getElementById('latitude').value;
    const lngInput = document.getElementById('longitude').value;
    const currentLocationInput = document.getElementById('current-location').value;
    const destinationInput = document.getElementById('destination').value;

    let currentLocation = { lat: parseFloat(latInput), lon: parseFloat(lngInput) };
    if (!latInput || !lngInput) {
        currentLocation = await geocodeLocation(currentLocationInput);
    }
    const destination = await geocodeLocation(destinationInput);

    if (currentLocation && destination) {
        getRoute(currentLocation, destination);
    }
});

document.getElementById('confirm-yes').addEventListener('click', () => {
    // Confirm and start journey
    navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        map.setView([userLat, userLng], 13);
        startVehicleMovement();
        document.getElementById('journey-confirmation').style.display = 'none'; // Hide the confirmation dropdown
    }, (error) => {
        console.error("Error getting location:", error);
        alert("Could not get current location. Please ensure location services are enabled.");
    });
});

document.getElementById('confirm-no').addEventListener('click', () => {
    // Hide the confirmation dropdown
    document.getElementById('journey-confirmation').style.display = 'none';
});
