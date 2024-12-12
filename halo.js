async function getCoordinates() {
    const location1 = document.getElementById('location1').value;
    const location2 = document.getElementById('location2').value;
  
    let lat1 = parseFloat(document.getElementById('lat1').value);
    let lng1 = parseFloat(document.getElementById('lng1').value);
    let lat2 = parseFloat(document.getElementById('lat2').value);
    let lng2 = parseFloat(document.getElementById('lng2').value);
  
    const fetchCoords = async (location) => {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`);
      const data = await response.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      } else {
        throw new Error(`Location "${location}" not found`);
      }
    };
  
    try {
      if (location1 && (isNaN(lat1) || isNaN(lng1))) {
        const coords1 = await fetchCoords(location1);
        lat1 = coords1.lat;
        lng1 = coords1.lng;
        document.getElementById('lat1').value = lat1;
        document.getElementById('lng1').value = lng1;
      }
  
      if (location2 && (isNaN(lat2) || isNaN(lng2))) {
        const coords2 = await fetchCoords(location2);
        lat2 = coords2.lat;
        lng2 = coords2.lng;
        document.getElementById('lat2').value = lat2;
        document.getElementById('lng2').value = lng2;
      }
  
      if (!isNaN(lat1) && !isNaN(lng1) && !isNaN(lat2) && !isNaN(lng2)) {
        calculate(lat1, lng1, lat2, lng2);
      } else {
        alert('Data koordinat tidak lengkap.');
      }
    } catch (error) {
      alert(error.message);
    }
  }
  
  function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  function calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
  
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const angle = Math.atan2(y, x) * 180 / Math.PI;
    return { angle1: angle, angle2: (angle + 360) % 360 };
  }
  
  function calculate(lat1, lng1, lat2, lng2) {
    const distance = haversineDistance(lat1, lng1, lat2, lng2);
    const { angle1, angle2 } = calculateBearing(lat1, lng1, lat2, lng2);
  
    document.getElementById('distance').textContent = `Distance: ${distance.toFixed(2)} km`;
    document.getElementById('angle1').textContent = `Bearing to: ${angle1.toFixed(2)}°`;
    document.getElementById('angle2').textContent = `Bearing back: ${angle2.toFixed(2)}°`;
  
    updateMap(lat1, lng1, lat2, lng2, distance);
  }
  
  function updateMap(lat1, lng1, lat2, lng2, distance) {
    const map = L.map('map').setView([lat1, lng1], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    // Tambahkan marker
    L.marker([lat1, lng1]).addTo(map).bindPopup("Lokasi 1").openPopup();
    L.marker([lat2, lng2]).addTo(map).bindPopup("Lokasi 2").openPopup();

    // Tambahkan polyline melengkung
    const controlPointLat = (lat1 + lat2) / 2 + 2; // Titik kontrol untuk kelengkungan
    const controlPointLng = (lng1 + lng2) / 2;

    const path = [
        'M', [lat1, lng1],  // Titik awal
        'Q', [controlPointLat, controlPointLng], [lat2, lng2],]
    L.curve(path, { color: 'blue', weight: 3 }).addTo(map);


  }
  