import models from '../models/index.js';
import { Op } from 'sequelize';
import Property from '../models/Property.js';
const { Client,Admin } = models;

export const getAllClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: clients } = await Client.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Clients retrieved successfully',
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      clients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientById = async (req, res) => {

  try {
    const { id } = req.params;

    const client = await Client.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      message: 'Client retrieved successfully',
      client
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminById = async (req, res) => {

  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      message: 'Admin retrieved successfully',
      admin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Fetch clients filtered by role
    const clientsByRole = await Client.findAndCountAll({
      where: { role },
      attributes: {
        exclude: ['password'], // Hide sensitive info
      },
      include: [
        {
          model: Property,
          as: 'properties', // must match association alias
          attributes: { exclude: ['clientId'] }, // optional: hide foreign key
        },
      ],
    });

    // Check if any client was found
    if (clientsByRole.count === 0) {
      return res.status(404).json({ error: 'No clients found for this role' });
    }

    res.status(200).json({
      message: 'Clients retrieved successfully',
      total: clientsByRole.count,
      clients: clientsByRole.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (req.user.type === 'client' && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to update this client' });
    }

    const {
      fullName,
      phoneNumber,
      kycProofName,
      kycProofNumber,
      kycUploadFile,
      companyName,
      email,
      address,
      website,
      bio,
      area,
      postLimit,
      status,
      profilePic,
      isVerified
    } = req.body;

    const updateData = {
      fullName: fullName || client.fullName,
      phoneNumber: phoneNumber || client.phoneNumber,
      email: email || client.email,
      kycProofName: kycProofName !== undefined ? kycProofName : client.kycProofName,
      kycProofNumber: kycProofNumber !== undefined ? kycProofNumber : client.kycProofNumber,
      kycUploadFile: kycUploadFile !== undefined ? kycUploadFile : client.kycUploadFile,
      companyName: companyName !== undefined ? companyName : client.companyName,
      profilePic: profilePic !== undefined ? profilePic : client.profilePic,
      address: address !== undefined ? address : client.address,
      website: website !== undefined ? website : client.website,
      bio: bio !== undefined ? bio : client.bio,
      area: area !== undefined ? area : client.area
    };

    if (req.user.type === 'admin') {
      if (postLimit !== undefined) updateData.postLimit = postLimit;
      if (status) updateData.status = status;
      if (isVerified !== undefined) updateData.isVerified = isVerified;
    }

    await client.update(updateData);

    const updatedClient = client.toJSON();
    delete updatedClient.password;

    res.json({
      message: 'Client updated successfully',
      client: updatedClient
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
console.log("rrr:::",req.user.type)
    if (req.user.type === 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to update this client' });
    }

    const {
      fullName,
      email,
      phoneNumber,
      commercialAds,
      status,
    } = req.body;

    const updateData = {
      fullName: fullName || admin.fullName,
      phoneNumber: phoneNumber || admin.phoneNumber,
      email: email || admin.email,
      commercialAds: commercialAds || admin.commercialAds,
      status: status || admin.status,
    };

    await admin.update(updateData);

    const updatedAdmin = admin.toJSON();
    delete updatedAdmin.password;

    res.json({
      message: 'Admin updated successfully',
      admin: updatedAdmin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { current, newPass, confirm } = req.body;

    // 1️⃣ Find client
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // 2️⃣ Check authorization
    if (req.user.type === 'client' && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to update this password' });
    }

    // 3️⃣ Validate input
    if (!current || !newPass || !confirm) {
      return res.status(400).json({ error: 'All fields (current, newPass, confirm) are required' });
    }

    if (newPass !== confirm) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    // 4️⃣ Verify current password
    const isMatch = await client.comparePassword(current);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // 5️⃣ Update password (model hook will hash automatically)
    client.password = newPass;
    await client.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { current, newPass, confirm } = req.body;

    // 1️⃣ Find client
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // 2️⃣ Check authorization
    if (req.user.type === 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to update this password' });
    }

    // 3️⃣ Validate input
    if (!current || !newPass || !confirm) {
      return res.status(400).json({ error: 'All fields (current, newPass, confirm) are required' });
    }

    if (newPass !== confirm) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    // 4️⃣ Verify current password
    const isMatch = await admin.comparePassword(current);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // 5️⃣ Update password (model hook will hash automatically)
    admin.password = newPass;
    await admin.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.destroy();

    res.json({
      message: 'Client deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
