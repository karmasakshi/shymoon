if ('geolocation' in navigator && 'DeviceOrientationEvent' in window) {
  const output = document.getElementById('output');
  const compassNeedle = document.querySelector('#compass .needle');
  const moonMarker = document.querySelector('#compass .moon-marker');

  // Mumbai's static magnetic declination in degrees (East)
  const staticDeclination = 0.5;

  // Function to convert azimuth to clock position
  const azimuthToClock = (azimuth) => {
    const normalizedAzimuth = (azimuth + 360) % 360; // Normalize azimuth to 0–360°
    const hour = Math.round(normalizedAzimuth / 30); // Divide into 12 segments (30° each)
    return hour === 0 ? 12 : hour; // Adjust for 12 o'clock
  };

  // Step 1: Get user's location
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    try {
      // Use static magnetic declination (Mumbai's declination)
      const declination = staticDeclination;

      // Step 2: Get moonrise information using SunCalc.js
      const moonTimes = SunCalc.getMoonTimes(new Date(), latitude, longitude);
      const moonRiseAzimuth = SunCalc.getMoonPosition(moonTimes.rise, latitude, longitude).azimuth * (180 / Math.PI); // Convert to degrees
      const fixedMoonAzimuth = (moonRiseAzimuth + 360) % 360; // Normalize to 0–360°
      const adjustedMoonAzimuth = (fixedMoonAzimuth - declination + 360) % 360; // Adjust for magnetic declination
      const moonClockPosition = azimuthToClock(adjustedMoonAzimuth);

      // Place the moon marker on the compass
      moonMarker.style.transform = `translate(50%, -50%) rotate(${adjustedMoonAzimuth}deg)`;

      output.innerHTML = `
        <p>Your location: Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}</p>
        <p>Static magnetic declination for Mumbai: ${declination.toFixed(2)}° (East)</p>
        <p>Moon will rise at azimuth: ${fixedMoonAzimuth.toFixed(2)}° (true north)</p>
        <p>Moonrise direction adjusted for compass: ${adjustedMoonAzimuth.toFixed(2)}°</p>
        <p>Moonrise clock position: ${moonClockPosition} o'clock</p>
      `;

      // Step 3: Update compass orientation based on device's rotation
      window.addEventListener('deviceorientation', (event) => {
        const compassHeading = event.webkitCompassHeading || event.alpha; // For iOS use webkitCompassHeading
        const normalizedHeading = (compassHeading + declination + 360) % 360; // Adjust compass reading to true north

        // Rotate the compass needle to match the device's heading
        compassNeedle.style.transform = `rotate(${normalizedHeading}deg)`;

        // Calculate relative direction to moonrise azimuth
        const relativeAzimuth = (adjustedMoonAzimuth - normalizedHeading + 360) % 360;
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
          <p>Static magnetic declination for Mumbai: ${declination.toFixed(2)}° (East)</p>
          <p>Moon will rise at azimuth: ${fixedMoonAzimuth.toFixed(2)}° (true north)</p>
          <p>Moonrise direction adjusted for compass: ${adjustedMoonAzimuth.toFixed(2)}°</p>
          <p>Moonrise clock position: ${moonClockPosition} o'clock</p>
          <p>Compass heading: ${normalizedHeading.toFixed(2)}°</p>
          <p>Point towards the ${direction} (${relativeAzimuth.toFixed(2)}° relative to your heading)</p>
        `;
      });
    } catch (error) {
      console.error('Error:', error.message);
      output.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  }, (err) => {
    console.error('Geolocation error:', err.message);
    alert('Unable to get your location. Please allow location access.');
  });
} else {
  alert('Your device does not support geolocation or compass features.');
}
