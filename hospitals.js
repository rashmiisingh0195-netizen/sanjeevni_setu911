"use strict";

// OpenStreetMap search services are public and have usage limits. This page
// requests one area at a time and shows a message if the service is busy.
const OVERPASS_ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
const SEARCH_RADIUS_METERS = 12000;
const $ = (selector) => document.querySelector(selector);
const map = L.map("map", { scrollWheelZoom: false }).setView([23.3441, 85.3096], 12);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const hospitalLayer = L.layerGroup().addTo(map);
let userMarker = null;
let userLocation = null;
const placeForm = $("#placeForm");
const placeInput = $("#placeInput");
const searchBtn = $("#searchBtn");
const locateBtn = $("#locateBtn");
const statusMessage = $("#statusMessage");
const hospitalList = $("#hospitalList");
const resultCount = $("#resultCount");

function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", isError);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function distanceInKm(from, to) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const latitudeDifference = radians(to.lat - from.lat);
    const longitudeDifference = radians(to.lon - from.lon);
    const a = Math.sin(latitudeDifference / 2) ** 2
        + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(longitudeDifference / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function hospitalCoordinates(element) {
    if (element.lat !== undefined && element.lon !== undefined) return { lat: element.lat, lon: element.lon };
    if (element.center) return { lat: element.center.lat, lon: element.center.lon };
    return null;
}

function getAddress(tags) {
    const parts = [tags["addr:suburb"], tags["addr:city"], tags["addr:state"]].filter(Boolean);
    return parts.length ? parts.join(", ") : (tags["addr:full"] || tags["addr:street"] || "Address not listed on OpenStreetMap");
}

function makeDirectionsUrl(hospital) {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lon}` : "";
    if (!origin) return `https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lon}#map=16/${hospital.lat}/${hospital.lon}`;
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin}%3B${hospital.lat},${hospital.lon}`;
}

function renderHospitals(hospitals) {
    hospitalLayer.clearLayers();
    resultCount.textContent = String(hospitals.length);
    if (!hospitals.length) {
        hospitalList.innerHTML = '<div class="empty-state"><span aria-hidden="true">🔎</span><p>No mapped hospitals found within 12 km. Try another nearby area.</p></div>';
        return;
    }

    hospitalList.innerHTML = hospitals.map((hospital, index) => {
        const distanceLabel = userLocation ? `${hospital.distance.toFixed(1)} km` : "Nearby";
        const tags = hospital.tags;
        const details = [tags.phone || tags["contact:phone"], tags.emergency === "yes" ? "Emergency listed" : ""].filter(Boolean);
        return `<article class="hospital-item" tabindex="0" data-index="${index}">
            <div class="hospital-item-top"><h3 class="hospital-name">${escapeHtml(hospital.name)}</h3><span class="distance">${distanceLabel}</span></div>
            <p class="hospital-address">${escapeHtml(getAddress(tags))}</p>
            ${details.length ? `<div class="hospital-meta">${details.map((detail) => `<span class="tag">${escapeHtml(detail)}</span>`).join("")}</div>` : ""}
            <a class="directions-link" href="${makeDirectionsUrl(hospital)}" target="_blank" rel="noopener noreferrer">Get directions ↗</a>
        </article>`;
    }).join("");

    hospitals.forEach((hospital, index) => {
        const markerIcon = L.divIcon({ className: "", html: '<div class="hospital-marker"><span>✚</span></div>', iconSize: [34, 34], iconAnchor: [17, 29] });
        const marker = L.marker([hospital.lat, hospital.lon], { icon: markerIcon }).bindPopup(`<strong>${escapeHtml(hospital.name)}</strong><br>${userLocation ? `${hospital.distance.toFixed(1)} km away` : "Hospital"}`);
        marker.addTo(hospitalLayer);
        hospital.marker = marker;
        hospital.listIndex = index;
    });

    hospitalList.querySelectorAll(".hospital-item").forEach((item) => {
        const selectHospital = () => {
            const hospital = hospitals[Number(item.dataset.index)];
            map.flyTo([hospital.lat, hospital.lon], 15, { duration: 0.5 });
            hospital.marker.openPopup();
        };
        item.addEventListener("click", (event) => {
            if (!event.target.closest("a")) selectHospital();
        });
        item.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectHospital(); }
        });
    });
}

async function requestHospitals(center) {
    setStatus("Searching OpenStreetMap for nearby hospitals…");
    searchBtn.disabled = true;
    hospitalList.innerHTML = '<div class="empty-state"><span aria-hidden="true">⌕</span><p>Looking for nearby hospitals…</p></div>';
    const query = `[out:json][timeout:25];(node[amenity=hospital](around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon});way[amenity=hospital](around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon});relation[amenity=hospital](around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon});node[healthcare=hospital](around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon});way[healthcare=hospital](around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon});relation[healthcare=hospital](around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon}););out center tags;`;
    let data = null;
    for (const endpoint of OVERPASS_ENDPOINTS) {
        try {
            const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body: `data=${encodeURIComponent(query)}` });
            if (!response.ok) throw new Error(`Search service returned ${response.status}`);
            data = await response.json();
            break;
        } catch (error) {
            console.warn("Hospital search endpoint unavailable:", error.message);
        }
    }

    searchBtn.disabled = false;
    if (!data) {
        setStatus("The map search service is busy. Please wait a moment and try again.", true);
        hospitalList.innerHTML = '<div class="empty-state"><span aria-hidden="true">⟳</span><p>Could not load hospitals right now. Please try again shortly.</p></div>';
        resultCount.textContent = "—";
        return;
    }

    const seen = new Set();
    const hospitals = (data.elements || []).map((element) => {
        const coordinates = hospitalCoordinates(element);
        const tags = element.tags || {};
        if (!coordinates || !(tags.name || tags["name:en"])) return null;
        const id = `${(tags.name || tags["name:en"]).toLowerCase()}-${coordinates.lat.toFixed(4)}-${coordinates.lon.toFixed(4)}`;
        if (seen.has(id)) return null;
        seen.add(id);
        const hospital = { ...coordinates, name: tags.name || tags["name:en"], tags };
        if (userLocation) hospital.distance = distanceInKm(userLocation, hospital);
        return hospital;
    }).filter(Boolean).sort((first, second) => (first.distance ?? distanceInKm(center, first)) - (second.distance ?? distanceInKm(center, second))).slice(0, 30);

    renderHospitals(hospitals);
    map.setView([center.lat, center.lon], 13);
    if (hospitals.length) {
        setStatus(`Showing ${hospitals.length} mapped hospital${hospitals.length === 1 ? "" : "s"} within 12 km. Distances are straight-line estimates.`);
    } else {
        setStatus("No mapped hospitals found nearby. Try searching a larger town or city.");
    }
}

async function searchPlace(place) {
    if (!place.trim()) {
        setStatus("Enter a city, area, or postal code to search.", true);
        placeInput.focus();
        return;
    }
    setStatus("Finding that place…");
    searchBtn.disabled = true;
    try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.search = new URLSearchParams({ q: place, format: "jsonv2", limit: "1" });
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Could not search for that place.");
        const results = await response.json();
        if (!results.length) {
            searchBtn.disabled = false;
            setStatus("We couldn't find that place. Try adding the city or state.", true);
            return;
        }
        const center = { lat: Number(results[0].lat), lon: Number(results[0].lon) };
        // Use the searched place as the distance and directions starting point.
        userLocation = center;
        if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
        map.setView([center.lat, center.lon], 13);
        await requestHospitals(center);
    } catch (error) {
        searchBtn.disabled = false;
        setStatus("Place search is unavailable. Check your connection and try again.", true);
    }
}

function locateUser() {
    if (!navigator.geolocation) {
        setStatus("This browser does not support location. Search for a city or area instead.", true);
        return;
    }
    locateBtn.disabled = true;
    setStatus("Waiting for location permission…");
    navigator.geolocation.getCurrentPosition(async (position) => {
        userLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
        const icon = L.divIcon({ className: "", html: '<div class="user-marker"></div>', iconSize: [19, 19], iconAnchor: [9, 9] });
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker([userLocation.lat, userLocation.lon], { icon, title: "Your location" }).bindPopup("Your location").addTo(map);
        map.setView([userLocation.lat, userLocation.lon], 13);
        locateBtn.disabled = false;
        await requestHospitals(userLocation);
    }, (error) => {
        locateBtn.disabled = false;
        const message = error.code === error.PERMISSION_DENIED
            ? "Location access was blocked. Allow it in your browser, or search for a place instead."
            : error.code === error.TIMEOUT
                ? "We couldn't get your location in time. Try again or search for a place."
                : "We couldn't get your location. Search for a place instead.";
        setStatus(message, true);
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
}

placeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    userLocation = null;
    searchPlace(placeInput.value);
});
locateBtn.addEventListener("click", locateUser);

const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");
menuBtn.addEventListener("click", () => {
    const willOpen = mobileMenu.hidden;
    mobileMenu.hidden = !willOpen;
    menuBtn.setAttribute("aria-expanded", String(willOpen));
    menuBtn.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
    menuBtn.textContent = willOpen ? "×" : "☰";
});

// Ranchi is a useful starting view for this India-focused healthcare site.
// The search is still initiated by the visitor so location is never assumed.
