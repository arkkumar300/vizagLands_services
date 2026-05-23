// controllers/cityController.js
import City from '../models/City.js';

// Add or update city
export const addOrUpdateCity = async (req, res) => {
  const { city, locality } = req.body;

  if (!city || !locality) {
    return res.status(400).json({ message: 'City and locality are required' });
  }

  try {
    let cityRecord = await City.findOne({ where: { city } });

    if (cityRecord) {
      const existingLocalities = cityRecord.locality || [];

      // Add only if not already present
      if (!existingLocalities.includes(locality)) {
        existingLocalities.push(locality);
      }

      cityRecord.locality = existingLocalities;
      await cityRecord.save();
    } else {
      cityRecord = await City.create({
        city,
        locality: [locality]
      });
    }

    res.json(cityRecord);
  } catch (err) {
    console.error('Error saving city:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAllCities = async (req, res) => {
  const { city, locality, id } = req.body;

  if (!city || !locality) {
    return res.status(400).json({ message: 'City and locality are required' });
  }

  try {
    let cityRecord = await City.findOne({ where: { id } });

    if (cityRecord) {
      // Convert string to array if it's not already an array
      let parsedLocality = typeof locality === 'string'
        ? locality.split(',').map(l => l.trim()) // split + trim spaces
        : locality;

      cityRecord.locality = parsedLocality;

      await cityRecord.save();
      res.json({ message: "City updated successfully", city: cityRecord });
    } else {
      res.json({ message: "This city doesn't exist" });
    }

  } catch (err) {
    console.error('Error saving city:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all cities (locality returned as array automatically)
export const getAllCities = async (req, res) => {
  try {
    const cities = await City.findAll();
    res.json(cities);
  } catch (err) {
    console.error('Error fetching cities:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const deleteCities = async (req, res) => {
  try {
    const { id } = req.params;
console.log("id:", req.params)
    if (!id) {
      return res.status(400).json({ message: "City ID is required" });
    }

    const deletedCount = await City.destroy({ where: { id } });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "City not found" });
    }

    res.json({
      message: "City deleted successfully",
      deletedCount,
    });
  } catch (err) {
    console.error("Error deleting city:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
