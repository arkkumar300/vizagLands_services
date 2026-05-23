import models from '../models/index.js';

const { Favorite, Property, Client, Address, Category } = models;

export const addFavorite = async (req, res) => {
  try {
    const { clientId, propertyId } = req.body;

    const exists = await Favorite.findOne({ where: { clientId, propertyId } });
    if (exists) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    const fav = await Favorite.create({ clientId, propertyId });

    res.status(201).json({ message: 'Added to favorites', favorite: fav });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { clientId, propertyId } = req.body;

    const deleted = await Favorite.destroy({ where: { clientId, propertyId } });

    if (!deleted) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getClientFavorites = async (req, res) => {
  try {
    const { clientId } = req.params;

    const favs = await Favorite.findAll({
      where: { clientId },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'propertyName', 'photos', 'price'],
          include: [
            { model: Address, as: 'address' },
            { model: Category, as: 'category' }
          ]
        }
      ]
    });

    res.json({ message: 'Favorites fetched', favorites: favs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
