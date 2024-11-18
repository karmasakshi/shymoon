if ('geolocation' in navigator && 'DeviceOrientationEvent' in window) {
  const output = document.getElementById('output');
  const compassNeedle = document.querySelector('#compass .needle');
  const moonMarker = document.querySelector('#compass .moon-marker');

  // Step 1: Get user's location
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    // Step 2: Get moonrise information using SunCalc.js
    const moonTimes = SunCalc.getMoonTimes(new Date(), latitude, longitude);
    const moonRiseAzimuth = SunCalc.getMoonPosition(moonTimes.rise, latitude, longitude).azimuth * (180 / Math.PI); // Convert to degrees
    const fixedMoonAzimuth = (moonRiseAzimuth + 360) % 360; // Normalize to 0–360°

    // Place the moon marker on the compass
    moonMarker.style.transform = `translate(50%, -50%) rotate(${fixedMoonAzimuth}deg)`;

    output.innerHTML = `
      <p>Your location: Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}</p>
      <p>Moon will rise at azimuth: ${fixedMoonAzimuth.toFixed(2)}°</p>
    `;

    // Step 3: Update compass orientation based on device's rotation
    window.addEventListener('deviceorientation', (event) => {
      const compassHeading = event.webkitCompassHeading || event.alpha; // For iOS use webkitCompassHeading
      const normalizedHeading = (compassHeading + 360) % 360; // Normalize to 0–360°

      // Rotate the compass needle to match the device's heading
      compassNeedle.style.transform = `rotate(${normalizedHeading}deg)`;

      // Calculate relative direction to moonrise azimuth
      const relativeAzimuth = (fixedMoonAzimuth - normalizedHeading + 360) % 360;
      let direction = '';
      if (relativeAzimuth < 22.5 || relativeAzimuth >= 337.5) direction = 'North';
      else if (relativeAzimuth >= 22.5 && relativeAzimuth < 67.5) direction = 'Northeast';
      else if (relativeAzimuth >= 67.5 && relativeAzimuth < 112.5) direction = 'East';
      else if (relativeAzimuth >= 112.5 && relativeAzimuth < 157.5) direction = 'Southeast';
      else if (relativeAzimuth >= 157.5 && relativeAzimuth < 202.5) direction = 'South';
      else if (relativeAzimuth >= 202.5 && relativeAzimuth < 247.5) direction = 'Southwest';
      else if (relativeAzimuth >= 247.5 && relativeAzimuth < 292.5) direction = 'West';
      else direction = 'Northwest';

      output.innerHTML = `
        <p>Your location: Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}</p>
        <p>Moon will rise at azimuth: ${fixedMoonAzimuth.toFixed(2)}°</p>
        <p>Compass heading: ${normalizedHeading.toFixed(2)}°</p>
        <p>Point towards the ${direction} (${relativeAzimuth.toFixed(2)}° relative to North)</p>
      `;
    });
  }, (err) => {
    console.error('Geolocation error:', err.message);
    alert('Unable to get your location. Please allow location access.');
  });
} else {
  alert('Your device does not support geolocation or compass features.');
}
