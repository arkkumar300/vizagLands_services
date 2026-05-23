import models from '../models/index.js';
import { Op } from 'sequelize';



const { Project, Address, PropertyProfile, Category, Client } = models;

export const createProject = async (req, res) => {
  try {
    const clientId = req.user.id;

    const client = await Client.findByPk(clientId);
    // const projectCount = await Property.count({
    //   where: { clientId }
    // });

    // if (projectCount >= client.postLimit) {
    //   return res.status(403).json({
    //     error: `Post limit exceeded. You can only add ${client.postLimit} properties`
    //   });
    // }

    const addressRecord = await Address.create({
      ...req.body.address,
      projectId: null
    });

    let profileRecord = null;
    if (req.body.propertyProfile) {
      profileRecord = await PropertyProfile.create(req.body.propertyProfile);
    }

    const project = await Project.create({
      ...req.body,
      clientId,
      addressId: addressRecord.id,
      propertyProfileId: profileRecord ? profileRecord.id : null
    });

    await addressRecord.update({ projectId: project.id });

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: Address, as: 'address' },
        { model: PropertyProfile, as: 'profile' },
        { model: Category, as: 'category' }
      ]
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: fullProject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAdminProject = async (req, res) => {
  try {

    const addressRecord = await Address.create({
      ...req.body.address,
      projectId: null
    });

    let profileRecord = null;
    if (req.body.propertyProfile) {
      profileRecord = await PropertyProfile.create(req.body.propertyProfile);
    }

    const project = await Project.create({
      ...req.body,
      clientId: req.body.clientId,
      addressId: addressRecord.id,
      propertyProfileId: profileRecord ? profileRecord.id : null
    });

    await addressRecord.update({ projectId: project.id });

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: Address, as: 'address' },
        { model: PropertyProfile, as: 'profile' },
        { model: Category, as: 'category' }
      ]
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: fullProject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllProjects = async (req, res) => {
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

    const where = {};
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

    const { count, rows: projects } = await Project.findAndCountAll({
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
      message: 'Projects retrieved successfully',
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      projects
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementView } = req.query;

    const project = await Project.findByPk(id, {
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

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (incrementView === 'true') {
      await project.increment('viewCount');
    }

    res.json({
      message: 'Project retrieved successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    // const clientId = req.user.id;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // if (req.user.type === 'client' && project.clientId !== clientId) {
    //   return res.status(403).json({ error: 'Unauthorized to update this project' });
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
      address,
      propertyProfile
    } = req.body;

    if (address && project.addressId) {
      await Address.update(address, {
        where: { id: project.addressId }
      });
    }

    if (propertyProfile && project.propertyProfileId) {
      await PropertyProfile.update(propertyProfile, {
        where: { id: project.propertyProfileId }
      });
    }

    await project.update(req.body);

    const updatedProject = await Project.findByPk(id, {
      include: [
        { model: Address, as: 'address' },
        { model: PropertyProfile, as: 'profile' },
        { model: Category, as: 'category' }
      ]
    });

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProjectViewCount = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Increment total view count
    const viewCount = parseInt(project.viewCount || 0) + 1;

    // Compare current month to the month of last update
    const lastUpdated = new Date(project.updatedAt);
    const now = new Date();

    const sameMonth =
      lastUpdated.getMonth() === now.getMonth() &&
      lastUpdated.getFullYear() === now.getFullYear();

    let thisMonthCount;

    if (sameMonth) {
      // Same month → increment
      thisMonthCount = parseInt(project.thisMonthCount || 0) + 1;
    } else {
      // New month → reset
      thisMonthCount = 1;
    }

    // Update project with new counts
    await project.update({
      viewCount,
      thisMonthCount
    });

    const updatedProject = await Project.findByPk(id);

    res.json({
      message: 'Project view count updated successfully',
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (req.user.type === 'client' && project.clientId !== clientId) {
      return res.status(403).json({ error: 'Unauthorized to delete this project' });
    }

    await project.destroy();

    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMostViewedProjects = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const projects = await Project.findAll({
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
      message: 'Most viewed projects retrieved successfully',
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/project.controller.js


export const searchProjects = async (req, res) => {
  try {
    const { city, locality, type, minPrice, maxPrice } = req.query;

    const whereConditions = {};
    const addressWhere = {};
    const categoryWhere = {};

    // 🔹 Price range filter
    if (minPrice && maxPrice) {
      whereConditions.price = { [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)] };
    } else if (minPrice) {
      whereConditions.price = { [Op.gte]: parseFloat(minPrice) };
    } else if (maxPrice) {
      whereConditions.price = { [Op.lte]: parseFloat(maxPrice) };
    }

    // 🔹 Address filters (combine district + location)
    if (city) addressWhere.city = city;
    if (locality) addressWhere.locality = locality;

    // 🔹 Category filter (project type)
    if (type) {
      categoryWhere.name = { [Op.like]: `%${type}%` };
    }

    // 🔹 Query database
    const projects = await Project.findAll({
      where: whereConditions,
      include: [
        {
          model: Address,
          as: 'address',
          where: Object.keys(addressWhere).length > 0 ? addressWhere : undefined,
        },
        {
          model: Category,
          as: 'category',
          where: Object.keys(categoryWhere).length > 0 ? categoryWhere : undefined,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: true,
      message: 'Projects fetched successfully',
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      status: false,
      message: 'Something went wrong while searching projects',
      error: error.message,
    });
  }
};

