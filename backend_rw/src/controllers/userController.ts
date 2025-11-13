import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../models';
import bcrypt from 'bcrypt';

// ============================================
// FUNCIONES EXISTENTES (MANTENER)
// ============================================

// PUT /api/users/:id/change-password - Cambiar contraseña
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validaciones
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Contraseña actual y nueva son requeridas' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Contraseña actual incorrecta' });
      return;
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await user.update({ password: hashedPassword });

    console.log(`✅ Contraseña actualizada para: ${user.email}`);

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
};

// GET /api/users - Listar todos los usuarios
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos para ver todos los usuarios' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const offset = (page - 1) * size;
    const limit = size;

    const users = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['username', 'ASC']],
    });

    res.json({
      message: 'Usuarios obtenidos exitosamente',
      totalItems: users.count,
      totalPages: Math.ceil(users.count / size),
      currentPage: page,
      users: users.rows,
    });
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};


// GET /api/users/:id - Obtener un usuario por ID
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // ✅ NUEVO: Solo admin o el mismo usuario puede ver su perfil
    if (req.user?.id !== parseInt(id) && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos para ver este usuario' });
      return;
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    console.log(`✅ Usuario obtenido: ${user.email}`);

    res.json({
      message: 'Usuario obtenido exitosamente',
      user
    });
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

// PUT /api/users/:id - Actualizar un usuario
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, rut, region, comuna, role, isActive } = req.body;

    // ✅ NUEVO: Solo admin o el mismo usuario puede actualizar su perfil
    if (req.user?.id !== parseInt(id) && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos para actualizar este usuario' });
      return;
    }

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // ✅ NUEVO: Validar que el email no esté en uso
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'El email ya está en uso' });
        return;
      }
    }

    // ✅ NUEVO: Solo admin puede cambiar role e isActive
    const updateData: any = {
      username: username || user.username,
      email: email || user.email,
      rut: rut || user.rut,
      region: region || user.region,
      comuna: comuna || user.comuna
    };

    // Solo admin puede actualizar rol
    if (req.user?.role === 'admin') {
      if (role && ['user', 'admin', 'guest'].includes(role)) {
        updateData.role = role;
      }
    }

    await user.update(updateData);

    console.log(`✅ Usuario actualizado: ${user.email}`);

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        rut: user.rut,
        region: user.region,
        comuna: user.comuna,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// DELETE /api/users/:id - Eliminar un usuario
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // ✅ NUEVO: Solo admin puede eliminar usuarios (y no a sí mismo)
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'No tienes permisos para eliminar usuarios' });
      return;
    }

    if (req.user?.id === parseInt(id)) {
      res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
      return;
    }

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const userEmail = user.email;
    await user.destroy();

    console.log(`✅ Usuario eliminado: ${userEmail} (por Admin: ${req.user.email})`);

    res.json({
      message: 'Usuario eliminado exitosamente',
      userId: id,
      deletedUser: userEmail
    });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};
