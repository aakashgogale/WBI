const axios = require('axios');

// 8. Reverse Geocode (Lat/Lng to Address via Google Maps)
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Google Maps API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const response = await axios.get(url);

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const addressComponents = result.address_components;

      let city = '';
      let state = '';
      let pincode = '';

      addressComponents.forEach(component => {
        if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('postal_code')) {
          pincode = component.long_name;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          formattedAddress: result.formatted_address,
          city,
          state,
          pincode,
          lat,
          lng
        }
      });
    }

    res.status(404).json({ success: false, message: 'Address not found for these coordinates' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Generate Dynamic Available Slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query; // Format: YYYY-MM-DD
    const selectedDate = date ? new Date(date) : new Date();
    
    // Configurable working hours (e.g. 9 AM to 7 PM)
    const workStartHour = 9;
    const workEndHour = 19; 
    const slotDurationMinutes = 60;

    const slots = [];
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    let currentHour = workStartHour;
    let currentMinute = 0;

    // Fast-forward if checking today
    if (isToday) {
      const currentRealHour = now.getHours();
      // Only allow slots at least 2 hours from now
      currentHour = Math.max(workStartHour, currentRealHour + 2);
    }

    while (currentHour < workEndHour) {
      const startAmPm = currentHour >= 12 ? 'PM' : 'AM';
      const startH = currentHour > 12 ? currentHour - 12 : currentHour;
      
      const endHourRaw = currentHour + Math.floor(slotDurationMinutes / 60);
      const endMinuteRaw = currentMinute + (slotDurationMinutes % 60);
      
      const endH = endHourRaw > 12 ? endHourRaw - 12 : endHourRaw;
      const endAmPm = endHourRaw >= 12 ? 'PM' : 'AM';

      const timeString = `${startH}:00 ${startAmPm} - ${endH}:00 ${endAmPm}`;

      // In a real app, query Booking/WorkerAvailability here to check if slot is full.
      // For now, we simulate dynamic availability (mostly available).
      
      slots.push({
        id: `slot_${currentHour}_00`,
        time: timeString,
        isAvailable: true, // Dynamic boolean
      });

      currentHour++;
    }

    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
