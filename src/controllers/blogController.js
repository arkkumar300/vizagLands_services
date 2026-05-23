import models from '../models/index.js';
import { Op } from 'sequelize';

const { Blog } = models;

export const createBlog = async (req, res) => {
  try {
    const { name, slug, photo, description, content, status } = req.body;

    const blog = await Blog.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      photo,
      description,
      content,
      status: status || 'draft'
    });

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const {   status, search } = req.query;

    const where = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Blogs retrieved successfully',
      count,
      blogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({
      message: 'Blog retrieved successfully',
      blog
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, photo, description, content, status } = req.body;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    await blog.update({
      name: name || blog.name,
      slug: slug || blog.slug,
      photo: photo !== undefined ? photo : blog.photo,
      description: description !== undefined ? description : blog.description,
      content: content !== undefined ? content : blog.content,
      status: status || blog.status
    });

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    await blog.destroy();

    res.json({
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
