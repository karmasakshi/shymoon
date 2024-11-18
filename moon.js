// Import SunCalc (add this script to your HTML, or use a bundler)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/suncalc/1.9.0/suncalc.min.js"></script>

// Check for geolocation support
if ('geolocation' in navigator && 'DeviceOrientationEvent' in window) {
  const output = document.getElementById('output'); // Element to display data

  // Step 1: Get user's location
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    // Step 2: Get moonrise information using SunCalc.js
    const moonTimes = SunCalc.getMoonTimes(new Date(), latitude, longitude);
    const moonRiseAzimuth = SunCalc.getMoonPosition(moonTimes.rise, latitude, longitude).azimuth * (180 / Math.PI); // Convert to degrees

    output.innerHTML += `<p>Your location: Latitude: ${latitude}, Longitude: ${longitude}</p>`;
    output.innerHTML += `<p>Moon will rise at azimuth: ${moonRiseAzimuth.toFixed(2)}°</p>`;

    // Step 3: Use device compass to guide the user to moonrise location
    window.addEventListener('deviceorientation', (event) => {
      const compassHeading = event.alpha; // Device's heading
      const relativeAzimuth = (moonRiseAzimuth - compassHeading + 360) % 360; // Adjust for compass

      let direction = '';
      if (relativeAzimuth < 22.5 || relativeAzimuth >= 337.5) {
        direction = 'North';
      } else if (relativeAzimuth >= 22.5 && relativeAzimuth < 67.5) {
        direction = 'Northeast';
      } else if (relativeAzimuth >= 67.5 && relativeAzimuth < 112.5) {
        direction = 'East';
      } else if (relativeAzimuth >= 112.5 && relativeAzimuth < 157.5) {
        direction = 'Southeast';
      } else if (relativeAzimuth >= 157.5 && relativeAzimuth < 202.5) {
        direction = 'South';
      } else if (relativeAzimuth >= 202.5 && relativeAzimuth < 247.5) {
        direction = 'Southwest';
      } else if (relativeAzimuth >= 247.5 && relativeAzimuth < 292.5) {
        direction = 'West';
      } else {
        direction = 'Northwest';
      }

      output.innerHTML = `
        <p>Your location: Latitude: ${latitude}, Longitude: ${longitude}</p>
        <p>Moon will rise at azimuth: ${moonRiseAzimuth.toFixed(2)}°</p>
        <p>Compass heading: ${compassHeading.toFixed(2)}°</p>
        <p>Look towards the ${direction} (${relativeAzimuth.toFixed(2)}° relative to North)</p>
      `;
    });
  }, (err) => {
    console.error('Geolocation error:', err.message);
    alert('Unable to get your location. Please allow location access.');
  });
} else {
  alert('Your device does not support geolocation or compass features.');
}
