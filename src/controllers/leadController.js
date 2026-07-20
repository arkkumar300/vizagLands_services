import models from '../models/index.js';
import { Op, where } from 'sequelize';

const { Lead, Property, Address, Category } = models;

export const createLead = async (req, res) => {
  try {
    const { propertyId, name, email, phoneNumber, message, leadType } = req.body;

    // Only increment inquiries if this is a callback lead
    if (leadType === "callback") {
      const property = await Property.findByPk(propertyId);

      if (property) {
        const newInquiries = (property.Inquiries || 0) + 1;
        await property.update({ Inquiries: newInquiries });
      }
    }

    // Create the lead
    const lead = await Lead.create(req.body);

    res.status(201).json({
      message: 'Lead created successfully',
      lead,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, leadType, propertyId } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) where.status = status;
    if (leadType) where.leadType = leadType;
    if (propertyId) where.propertyId = propertyId;

    const { count, rows: leads } = await Lead.findAndCountAll({
      where,
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'propertyName', 'title', 'price','photos','slug'],
          include: [
            { model: Address, as: 'address' },
            { model: Category, as: 'category' }
          ]
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Leads retrieved successfully',
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      leads
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByPk(id, {
      include: [
        {
          model: Property,
          as: 'property',
          include: [
            { model: Address, as: 'address' },
            { model: Category, as: 'category' }
          ]
        }
      ]
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      message: 'Lead retrieved successfully',
      lead
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    const lead = await Lead.findByPk(id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await lead.update({
      status: status || lead.status,
      remark: remark !== undefined ? remark : lead.remark
    });

    res.json({
      message: 'Lead updated successfully',
      lead
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByPk(id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await lead.destroy();

    res.json({
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
