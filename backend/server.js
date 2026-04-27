require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Adjust in production
        methods: ['GET', 'POST']
    }
});

// Socket.io Middleware for Auth
io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
        jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded;
            next();
        });
    } else {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.user?.id}`);

    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.user?.id} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
        socket.leave(conversationId);
        console.log(`User ${socket.user?.id} left conversation ${conversationId}`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Export io so controllers can use it
module.exports = { app, server, io };

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Swagger Setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Reshell API',
            version: '1.0.0',
            description: 'API documentation for the Reshell marketplace',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler
const { errorHandler } = require('./middleware/authMiddleware');
app.use(errorHandler);

// Base route
app.get('/', (req, res) => {
    res.send('Reshell API is running');
});

// Import Routes
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Use Routes
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
