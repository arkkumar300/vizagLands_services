import models from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import PropertyProfile from '../models/PropertyProfile.js';

const { Category, Property, Address, Lead, Client } = models;

export const getMainDashboard = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const categories = await Category.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: mostViewedProperties } = await Property.findAndCountAll({
      where: {
        status: 'verified',
        isActive: true,
        isProject:false

      },
      include: [
        { model: Address, as: 'address' },
        { model: Category, as: 'category' },
        { model: PropertyProfile, as: 'profile' },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'fullName', 'phoneNumber', 'companyName']
        }
      ],
      order: [['viewCount', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const {count: projectCount, rows: mostViewedProjects } = await Property.findAndCountAll({
      where: {
        status: 'verified',
        isActive: true,
        isProject:true
      },
      include: [
        { model: Address, as: 'address' },
        { model: Category, as: 'category' },
        { model: PropertyProfile, as: 'profile' },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'fullName', 'phoneNumber', 'companyName']
        }
      ],
      order: [['viewCount', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const cityLocalities = await Address.findAll({
      attributes: [
        'city',
        [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('locality'))), 'localities']
      ],
      group: ['city'],
      raw: true
    });

    const formattedCityLocalities = cityLocalities.map(item => ({
      city: item.city,
      localities: item.localities ? item.localities.split(',') : []
    }));

    res.json({
      status: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        categories,
        mostViewedProperties: {
          count,
          totalPages: Math.ceil(count / parseInt(limit)),
          currentPage: parseInt(page),
          properties: mostViewedProperties
        },
        mostViewedProjects: {
          count,
          totalPages: Math.ceil(projectCount / parseInt(limit)),
          currentPage: parseInt(page),
          projects: mostViewedProjects
        },
        cityLocalities: formattedCityLocalities
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientDashboard = async (req, res) => {
  try {
    const clientId = req.user.id;
    const clientDetails=await Client.findOne({where:{id:clientId}});

    const addedPropertiesCount = await Property.count({
      where: { clientId }
    });

    const verifiedPropertiesCount = await Property.count({
      where: {
        clientId,
        status: 'verified'
      }
    });

    const totalViews = await Property.sum('viewCount', {
      where: {
        clientId,
        status: 'verified',
        isActive: true
      }
    });

    const totalThisMonthViews = await Property.sum('thisMonthCount', {
      where: {
        clientId,
        status: 'verified',
        isActive: true
      }
    });

    const Inquiries = await Property.sum('Inquiries', {
      where: {
        clientId,
        status: 'verified',
        isActive: true
      }
    });

    const totalLeadsCount = await Lead.count({
      include: [
        {
          model: Property,
          as: 'property',
          where: {
            clientId,
            status: 'verified',
            isActive: true
          }
        }
      ]
    });

    const properties = await Property.findAll({
      where: { clientId },
      include: [
        { model: Address, as: 'address' },
        { model: Category, as: 'category' },
        { model: PropertyProfile, as: 'profile' }
      ],
      order: [['createdAt', 'DESC']]
    });

    const leads = await Lead.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          where: {
            clientId,
            status: 'verified'
          },
          include: [
            { model: Address, as: 'address' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Client dashboard data retrieved successfully',
      data: {
        clientDetails,
        addedPropertiesCount,
        verifiedPropertiesCount,
        totalViews: totalViews || 0,
        totalLeadsCount: totalLeadsCount || 0,
        totalThisMonthViews: totalThisMonthViews || 0,
        Inquiries: Inquiries || 0,
        properties,
        leads
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminDashboard = async (req, res) => {

  try {
    const adminId = req.user.id;
    const OwnerCount = await Client.count({where:{role:"owner"}});
    const AgentCount = await Client.count({where:{role:"agent"}});
    const BuilderCount = await Client.count({where:{role:"builder"}});

    const addedPropertiesCount = await Property.count({
      where: {
        isProject: false
      }
    });
    const verifiedPropertiesCount = await Property.count({
      where: {
        status: 'verified'
      }
    });
    const ProjectsCount = await Property.count({
      where: {
        isProject: true
      }
    });

    const totalViews = await Property.sum('viewCount', {
      where: {
        status: 'verified',
        isActive: true
      }
    });

    const totalThisMonthViews = await Property.sum('thisMonthCount', {
      where: {
        status: 'verified',
        isActive: true
      }
    });

    const Inquiries = await Property.sum('Inquiries', {
      where: {
        status: 'verified',
        isActive: true
      }
    });

    const totalLeadsCount = await Lead.count({
      include: [
        {
          model: Property,
          as: 'property',
          where: {
            status: 'verified',
            isActive: true
          }
        }
      ]
    });

    const properties = await Property.findAll({
      where:{isProject:false},
      include: [
        { model: Address, as: 'address' },
        { model: Category, as: 'category' },
        { model: Client, as: 'client' },
      ],
      order: [['createdAt', 'DESC']]
    });
    const projects = await Property.findAll({
      where:{isProject:true},
      include: [
        { model: Address, as: 'address' },
        { model: Category, as: 'category' },
        { model: Client, as: 'client' },
      ],
      order: [['createdAt', 'DESC']]
    });

    const leads = await Lead.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          where: {
            status: 'verified'
          },
          include: [
            { model: Address, as: 'address' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Client dashboard data retrieved successfully',
      data: {
        addedPropertiesCount,
        verifiedPropertiesCount,
        ProjectsCount,
        OwnerCount,
        AgentCount,
        BuilderCount,
        totalViews: totalViews || 0,
        totalLeadsCount: totalLeadsCount || 0,
        totalThisMonthViews: totalThisMonthViews || 0,
        Inquiries: Inquiries || 0,
        leads,
        properties,
        projects
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientLeadsPage = async (req, res) => {
  try {
    const clientId = req.user.id;

    const totalLeads = await Lead.count({
      include: [
        {
          model: Property,
          as: 'property',
          where: { clientId }
        }
      ]
    });

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const leadsThisMonth = await Lead.count({
      where: {
        createdAt: {
          [Op.gte]: firstDayOfMonth
        }
      },
      include: [
        {
          model: Property,
          as: 'property',
          where: { clientId }
        }
      ]
    });

    const contactedLeads = await Lead.count({
      where: {
        status: 'contacted'
      },
      include: [
        {
          model: Property,
          as: 'property',
          where: { clientId }
        }
      ]
    });

    const completedLeads = await Lead.count({
      where: {
        status: 'completed'
      },
      include: [
        {
          model: Property,
          as: 'property',
          where: { clientId }
        }
      ]
    });

    const leads = await Lead.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          where: { clientId },
          include: [
            { model: Address, as: 'address' },
            { model: Category, as: 'category' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Client leads page data retrieved successfully',
      data: {
        totalLeads,
        leadsThisMonth,
        contactedLeads,
        completedLeads,
        leads
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
