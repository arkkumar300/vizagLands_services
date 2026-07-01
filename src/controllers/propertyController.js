import models from '../models/index.js';
import { Op } from 'sequelize';



const { Property, Address, PropertyProfile, Category, Client } = models;

export const createProperty = async (req, res) => {
  try {
    const clientId = req.user.id;

    const client = await Client.findByPk(clientId);
    const propertyCount = await Property.count({
      where: { clientId }
    });

    if (propertyCount >= client.postLimit) {
      return res.status(403).json({
        error: `Post limit exceeded. You can only add ${client.postLimit} properties`
      });
    }

    const addressRecord = await Address.create({
      ...req.body.address,
      propertyId: null
    });

    let profileRecord = null;
    if (req.body.propertyProfile) {
      profileRecord = await PropertyProfile.create(req.body.propertyProfile);
    }

    const property = await Property.create({
      ...req.body,
      clientId,
      addressId: addressRecord.id,
      propertyProfileId: profileRecord ? profileRecord.id : null
    });

    await addressRecord.update({ propertyId: property.id });

    const fullProperty = await Property.findByPk(property.id, {
      include: [
        { model: Address, as: 'address' },
        { model: PropertyProfile, as: 'profile' },
        { model: Category, as: 'category' }
      ]
    });

    res.status(201).json({
      success:true,
      message: 'Property created successfully',
      property: fullProperty
    });
  } catch (error) {
    res.status(500).json({ success:false,error: error.message });
  }
};

export const createAdminProperty = async (req, res) => {
  try {

    const addressRecord = await Address.create({
      ...req.body.address,
      propertyId: null
    });

    let profileRecord = null;
    if (req.body.propertyProfile) {
      profileRecord = await PropertyProfile.create(req.body.propertyProfile);
    }

    const property = await Property.create({
      ...req.body,
      clientId: req.body.clientId,
      addressId: addressRecord.id,
      isProject:req.body.isProject,
      propertyProfileId: profileRecord ? profileRecord.id : null
    });

    await addressRecord.update({ propertyId: property.id });

    const fullProperty = await Property.findByPk(property.id, {
      include: [
        { model: Address, as: 'address' },
        { model: PropertyProfile, as: 'profile' },
        { model: Category, as: 'category' }
      ]
    });

    res.status(201).json({
      success:true,
      message: 'Property created successfully',
      property: fullProperty
    });
  } catch (error) {
    res.status(500).json({success:false, error: error.message });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      marketType,
      status,
      minPrice,
      maxPrice,
      city,
      locality,
      clientId
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { isProject: false }; // 👈 added condition
        const addressWhere = {};

    if (categoryId) where.categoryId = categoryId;
    if (marketType) where.marketType = marketType;
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    if (city) addressWhere.city = city;
    if (locality) addressWhere.locality = locality;

    const { count, rows: properties } = await Property.findAndCountAll({
      where,
      include: [
        {
          model: Address,
          as: 'address',
          where: Object.keys(addressWhere).length > 0 ? addressWhere : undefined
        },
        { model: PropertyProfile, as: 'profile' },
        { model: Category, as: 'category' },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'fullName', 'phoneNumber', 'email', 'role', 'companyName']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Properties retrieved successfully',
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      properties
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllProject = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      marketType,
      status,
      minPrice,
      maxPrice,
      city,
      locality,
      clientId
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isProject: true }; // 👈 added condition
        const addressWhere = {};
    if (categoryId) where.categoryId = categoryId;
    if (marketType) where.marketType = marketType;
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    if (city) addressWhere.city = city;
    if (locality) addressWhere.locality = locality;

    const { count, rows: properties } = await Property.findAndCountAll({
      where,
      include: [
        {
          model: Address,
          as: 'address',
          where: Object.keys(addressWhere).length > 0 ? addressWhere : undefined
        },
        { model: PropertyProfile, as: 'profile' },
        { model: Category, as: 'category' },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'fullName', 'phoneNumber', 'email', 'role', 'companyName']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'project retrieved successfully',
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      properties
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementView } = req.query;

    const property = await Property.findByPk(id, {
      include: [
        { model: Address, as: 'address' },
        { model: PropertyProfile, as: 'profile' },
        { model: Category, as: 'category' },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'fullName', 'phoneNumber', 'email', 'role', 'companyName', 'website']
        }
      ]
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (incrementView === 'true') {
      await property.increment('viewCount');
    }

    res.json({
      message: 'Property retrieved successfully',
      property
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPropertyByslug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { incrementView } = req.query;

    const property = await Property.findOne({
      where: { slug },
      include: [
        { model: Address, as: 'address' },
        { model: PropertyProfile, as: 'profile' },
        { model: Category, as: 'category' },
        {
          model: Client,
          as: 'client',
          attributes: [
            'id',
            'fullName',
            'phoneNumber',
            'email',
            'role',
            'companyName',
            'website'
          ]
        }
      ]
    });

    if (!property) {
      return res.status(404).json({
        error: 'Property not found'
      });
    }

    if (incrementView === 'true') {
      await property.increment('viewCount');
    }

    res.json({
      message: 'Property retrieved successfully',
      property
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    // const clientId = req.user.id;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // if (req.user.type === 'client' && property.clientId !== clientId) {
    //   return res.status(403).json({ error: 'Unauthorized to update this property' });
    // }

    const {
      propertyName,
      title,
      description,
      marketType,
      propertyKind,
      price,
      photos,
      videos,
      youtubeUrl,
      amenities,
      near_by,
      status,
      isActive,
      isHandOver,
      address,
      propertyProfile
    } = req.body;

    if (address && property.addressId) {
      await Address.update(address, {
        where: { id: property.addressId }
      });
    }

    if (propertyProfile && property.propertyProfileId) {
      await PropertyProfile.update(propertyProfile, {
        where: { id: property.propertyProfileId }
      });
    }

    await property.update(req.body);

    const updatedProperty = await Property.findByPk(id, {
      include: [
        { model: Address, as: 'address' },
        { model: PropertyProfile, as: 'profile' },
        { model: Category, as: 'category' }
      ]
    });

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePropertyViewCount = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Increment total view count
    const viewCount = parseInt(property.viewCount || 0) + 1;

    // Compare current month to the month of last update
    const lastUpdated = new Date(property.updatedAt);
    const now = new Date();

    const sameMonth =
      lastUpdated.getMonth() === now.getMonth() &&
      lastUpdated.getFullYear() === now.getFullYear();

    let thisMonthCount;

    if (sameMonth) {
      // Same month → increment
      thisMonthCount = parseInt(property.thisMonthCount || 0) + 1;
    } else {
      // New month → reset
      thisMonthCount = 1;
    }

    // Update property with new counts
    await property.update({
      viewCount,
      thisMonthCount
    });

    const updatedProperty = await Property.findByPk(id);

    res.json({
      message: 'Property view count updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (req.user.type === 'client' && property.clientId !== clientId) {
      return res.status(403).json({ error: 'Unauthorized to delete this property' });
    }

    await property.destroy();

    res.json({
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMostViewedProperties = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const properties = await Property.findAll({
      where: {
        status: 'verified',
        isActive: true
      },
      include: [
        { model: Address, as: 'address' },
        { model: Category, as: 'category' },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'fullName', 'phoneNumber', 'companyName']
        }
      ],
      order: [['viewCount', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      message: 'Most viewed properties retrieved successfully',
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/property.controller.js


export const searchProperties = async (req, res) => {
  try {
    const { city, locality, marketType,categoryId, minPrice, maxPrice } = req.query;

    const where = { isProject: false }; // 👈 added condition
    where.status = 'verified';
        const addressWhere = {};
    if (categoryId) where.categoryId = categoryId;
    if (marketType) where.marketType = marketType;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    if (city) addressWhere.city = city;
    if (locality) addressWhere.locality = locality;

    // 🔹 Query database
    const properties = await Property.findAll({
      where: where,
      include: [
        {
          model: Address,
          as: 'address',
          where: Object.keys(addressWhere).length > 0 ? addressWhere : undefined,
        },
        {
          model: Category,
          as: 'category'
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: true,
      message: 'Properties fetched successfully',
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      status: false,
      message: 'Something went wrong while searching properties',
      error: error.message,
    });
  }
};

export const searchProjects = async (req, res) => {
  try {
    const { city, locality, marketType,categoryId, minPrice, maxPrice } = req.query;

    const where = { isProject: true }; // 👈 added condition
    where.status = 'verified';
        const addressWhere = {};
    if (categoryId) where.categoryId = categoryId;
    if (marketType) where.marketType = marketType;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    if (city) addressWhere.city = city;
    if (locality) addressWhere.locality = locality;
    // 🔹 Query database
    const properties = await Property.findAll({
      where: where,
      include: [
        {
          model: Address,
          as: 'address',
          where: Object.keys(addressWhere).length > 0 ? addressWhere : undefined,
        },
        {
          model: Category,
          as: 'category'
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: true,
      message: 'Properties fetched successfully',
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      status: false,
      message: 'Something went wrong while searching properties',
      error: error.message,
    });
  }
};

