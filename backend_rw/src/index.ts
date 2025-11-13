import 'dotenv/config';
import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import sequelize from './database';
import { db } from './models';
import userRoutes from './routes/userRoutes'; 
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';             // ✅ AGREGAR
import orderItemRoutes from './routes/orderItemRoutes';     // ✅ AGREGAR
import cartRoutes from './routes/cartRoutes';               // ✅ AGREGAR
import cartItemRoutes from './routes/cartItemRoutes';       // ✅ AGREGAR
import rateLimit from 'express-rate-limit';

const app = express();
// Seguridad con headers HTTP estándar
app.use(helmet());

const PORT = process.env.PORT || 3000;
// ============================================
// LÍMITE DE PETICIONES
// ============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
// ============================================
// MIDDLEWARES
// ============================================

const allowedOrigins = ['http://localhost:8100', 'http://localhost:8101'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ============================================
// RUTAS
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);                  // ✅ AGREGAR
app.use('/api/order-items', orderItemRoutes);         // ✅ AGREGAR
app.use('/api/carts', cartRoutes);                     // ✅ AGREGAR
app.use('/api/cart-items', cartItemRoutes);            // ✅ AGREGAR

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡El servidor backend con TypeScript está funcionando!');
});

// ============================================
// CONEXIÓN A BASE DE DATOS Y SERVIDOR
// ============================================

async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos de Supabase establecida correctamente.');

    // Sincronizar modelos
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    await sequelize.sync({ alter: isDevelopment });
    
    console.log('✅ Modelos sincronizados con la base de datos.');
    console.log('✅ Tablas creadas/actualizadas:');
    console.log('   ✓ Users');
    console.log('   ✓ Categories');
    console.log('   ✓ Products');
    console.log('   ✓ Orders');
    console.log('   ✓ OrderItems');
    console.log('   ✓ Carts');
    console.log('   ✓ CartItems');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
      console.log(`📝 Entorno: ${isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
      console.log('\n📋 Endpoints disponibles:');
      console.log('   /api/auth        - Autenticación');
      console.log('   /api/users       - Usuarios');
      console.log('   /api/categories  - Categorías');
      console.log('   /api/products    - Productos');
      console.log('   /api/orders      - Pedidos');
      console.log('   /api/order-items - Items de pedidos');
      console.log('   /api/carts       - Carritos');
      console.log('   /api/cart-items  - Items de carritos');
    });

  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();
