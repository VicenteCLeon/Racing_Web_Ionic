import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Product } from '../models';

// POST /api/products - Crear producto
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, categoryId, imageUrl, stock, size, brand, color, isActive } = req.body;

    // Validaciones
    if (!name || !description || !price || !categoryId || !stock || !size || !brand) {
      res.status(400).json({ message: 'Todos los campos son requeridos' });
      return;
    }

    if (price <= 0) {
      res.status(400).json({ message: 'El precio debe ser mayor a 0' });
      return;
    }

    const product = await Product.create({
      name,
      description,
      price,
      categoryId,
      imageUrl: imageUrl || '/assets/default-product.jpg',
      stock,
      size,
      brand,
      color: color || 'Sin especificar',
      isActive: isActive !== undefined ? isActive : true
    });

    console.log(`✅ Producto creado: ${name}`);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product
    });
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

// GET /api/products - Obtener todos los productos
export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Parámetros de paginación, con valores por defecto
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const offset = (page - 1) * size;
    const limit = size;

    // Consulta con paginación y selección de campos necesarios
    const products = await Product.findAndCountAll({
      attributes: ['id', 'name', 'price', 'imageUrl', 'stock'],
      include: [{ association: 'category', attributes: ['id', 'name'] }],
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    // Respuesta con metadatos de paginación
    res.json({
      message: 'Productos obtenidos exitosamente',
      totalItems: products.count,
      totalPages: Math.ceil(products.count / size),
      currentPage: page,
      products: products.rows,
    });
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// GET /api/products/:id - Obtener producto por ID
export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const product = await Product.findByPk(id, {
      include: [{ association: 'category' }]
    });

    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.json({
      message: 'Producto obtenido exitosamente',
      product
    });
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};


// PUT /api/products/:id - Actualizar producto
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl, isActive } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      stock: stock !== undefined ? stock : product.stock,
      imageUrl: imageUrl || product.imageUrl,
      isActive: isActive !== undefined ? isActive : product.isActive
    });

    console.log(`✅ Producto actualizado: ${product.name}`);

    res.json({
      message: 'Producto actualizado exitosamente',
      product
    });
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// DELETE /api/products/:id - Eliminar producto
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    const productName = product.name;
    await product.destroy();

    console.log(`✅ Producto eliminado: ${productName}`);

    res.json({
      message: 'Producto eliminado exitosamente',
      productId: id
    });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};
