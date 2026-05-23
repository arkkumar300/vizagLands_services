// controllers/propertyViewController.js
import PropertyView from '../models/PropertyView.js';
import Property from '../models/Property.js';
import Client from '../models/Client.js';
import PropertyProfile from '../models/PropertyProfile.js';
import Address from '../models/Address.js';
import Category from '../models/Category.js';

// Record a view
export const recordPropertyView = async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user?.id || null; // assuming JWT middleware sets req.user

  console.log("Received propertyId:", propertyId);

  if (!propertyId) {
    return res.status(400).json({ message: 'propertyId is required' });
  }

  try {
    // Check if the user has already viewed this property
    const existingView = await PropertyView.findOne({
      where: { propertyId, userId },
    });

    if (existingView) {
      return res.status(400).json({ message: 'User already viewed this property' });
    }

    // Record the property view
    await PropertyView.create({
      propertyId,
      userId,
    });

    return res.status(200).json({ message: 'Property view recorded successfully' });
  } catch (error) {
    console.error('Error recording property view:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get recent views (global)
export const getRecentPropertyViews = async (req, res) => {
  try {
    const recentViews = await PropertyView.findAll({
      order: [['viewedAt', 'DESC']],
      limit: 10,
      include: [{ model: Property, as: 'property' }]
    });

    return res.json(recentViews);
  } catch (error) {
    console.error('Error fetching recent views:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get views for a specific user
export const getUserPropertyViews = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const views = await PropertyView.findAll({
      where: { userId },
      order: [['viewedAt', 'DESC']],
      include: [
        {
          model: Property,
          as: 'property',
          include: [
            { model: PropertyProfile, as: 'profile' },
            { model: Address, as: 'address' },
            { model: Category, as: 'category' },
          ]
        }
      ]
    });
    return res.json(views);
  } catch (error) {
    console.error('Error fetching user views:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
