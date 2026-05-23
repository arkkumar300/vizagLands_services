// controllers/commercialAdsController.js
import CommercialAds from '../models/CommercialAds.js';

/**
 * CREATE a new commercial ad
 * - If created as active, set all others to inactive first
 */
export const createCommercialAd = async (req, res) => {
  try {
    const { name, description, photo, status } = req.body;

    if (status === 'active') {
      // Deactivate any currently active ads
      await CommercialAds.update({ status: 'inactive' }, { where: { status: 'active' } });
    }

    const newAd = await CommercialAds.create({ name, description, photo, status });
    res.status(201).json({ message: 'Ad created successfully', ad: newAd });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating ad', error: error.message });
  }
};

/**
 * GET all commercial ads
 */
export const getAllCommercialAds = async (req, res) => {
  try {
    const ads = await CommercialAds.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error: error.message });
  }
};

/**
 * GET status commercial ads
 */
export const getCommercialAdsByStatus = async (req, res) => {
  
  try {
    const ads = await CommercialAds.findOne({where:{status:'active'}});
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error: error.message });
  }
};

/**
 * GET single ad by ID
 */
export const getCommercialAdById = async (req, res) => {
  try {
    const ad = await CommercialAds.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.status(200).json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ad', error: error.message });
  }
};

/**
 * UPDATE ad (including status rule)
 */
export const updateCommercialAd = async (req, res) => {
  const { id } = req.params;
  const { name, description, photo, status } = req.body;

  try {
    const ad = await CommercialAds.findByPk(id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    if (status === 'active') {
      // Deactivate all others
      await CommercialAds.update({ status: 'inactive' }, { where: { status: 'active' } });
    }

    await ad.update({ name, description, photo, status });
    res.status(200).json({ message: 'Ad updated successfully', ad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating ad', error: error.message });
  }
};

/**
 * DELETE ad
 */
export const deleteCommercialAd = async (req, res) => {
  try {
    const ad = await CommercialAds.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    await ad.destroy();
    res.status(200).json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting ad', error: error.message });
  }
};

/**
 * UPDATE status only (shortcut endpoint)
 */
export const updateCommercialAdStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const ad = await CommercialAds.findByPk(id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    if (status === 'active') {
      await CommercialAds.update({ status: 'inactive' }, { where: { status: 'active' } });
    }

    ad.status = status;
    await ad.save();

    res.status(200).json({ message: 'Status updated successfully', ad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};
