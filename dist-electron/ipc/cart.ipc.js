"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCartIPC = setupCartIPC;
const electron_1 = require("electron");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
/**
 * Cart IPC Handlers for Electron
 * Handles cart persistence and order processing in desktop mode
 */
// User data directory for storing cart and orders
const USER_DATA_DIR = path_1.default.join(os_1.default.homedir(), '.electron-faker-angular');
const CART_FILE = path_1.default.join(USER_DATA_DIR, 'cart.json');
const ORDERS_FILE = path_1.default.join(USER_DATA_DIR, 'orders.json');
// Ensure user data directory exists
async function ensureUserDataDir() {
    try {
        await promises_1.default.mkdir(USER_DATA_DIR, { recursive: true });
    }
    catch (error) {
        console.error('⚡ [ELECTRON MAIN] Failed to create user data directory:', error);
    }
}
/**
 * Initialize cart IPC handlers
 */
function setupCartIPC() {
    console.log('⚡ [ELECTRON MAIN] Setting up cart IPC handlers');
    // Ensure user data directory exists
    ensureUserDataDir();
    // Save cart to file
    electron_1.ipcMain.handle('cart:save', async (event, cart) => {
        try {
            console.log('⚡ [ELECTRON MAIN] Saving cart to file system');
            await promises_1.default.writeFile(CART_FILE, JSON.stringify(cart, null, 2));
            return true;
        }
        catch (error) {
            console.error('⚡ [ELECTRON MAIN] Failed to save cart:', error);
            throw new Error('Failed to save cart');
        }
    });
    // Load cart from file
    electron_1.ipcMain.handle('cart:load', async (event) => {
        try {
            console.log('⚡ [ELECTRON MAIN] Loading cart from file system');
            const cartData = await promises_1.default.readFile(CART_FILE, 'utf-8');
            const cart = JSON.parse(cartData);
            // Ensure dates are properly parsed
            cart.createdAt = new Date(cart.createdAt);
            cart.updatedAt = new Date(cart.updatedAt);
            return cart;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                console.log('⚡ [ELECTRON MAIN] No cart file found, returning null');
                return null;
            }
            console.error('⚡ [ELECTRON MAIN] Failed to load cart:', error);
            throw new Error('Failed to load cart');
        }
    });
    // Submit order
    electron_1.ipcMain.handle('cart:submitOrder', async (event, orderRequest) => {
        try {
            console.log('⚡ [ELECTRON MAIN] Processing order submission');
            // Generate order ID
            const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
            // Calculate order totals
            const subtotal = orderRequest.cart.totalAmount;
            const shipping_cost = subtotal >= 50 ? 0 : 9.99;
            const tax = subtotal * 0.085;
            const total = subtotal + shipping_cost + tax;
            // Calculate estimated delivery
            const estimatedDelivery = calculateEstimatedDelivery(orderRequest.shipping.shippingMethod);
            // Create order object
            const order = {
                id: orderId,
                cart: orderRequest.cart,
                billing: orderRequest.billing,
                shipping: orderRequest.shipping,
                payment: {
                    method: orderRequest.payment.method,
                    cardholderName: orderRequest.payment.cardholderName,
                    paypalEmail: orderRequest.payment.paypalEmail,
                    cryptoWallet: orderRequest.payment.cryptoWallet
                    // Sensitive payment data excluded for security
                },
                subtotal,
                shipping_cost,
                tax,
                total,
                status: 'pending',
                createdAt: new Date(),
                estimatedDelivery
            };
            // Save order to file
            await saveOrderToFile(order);
            // Clear cart after successful order
            try {
                await promises_1.default.unlink(CART_FILE);
                console.log('⚡ [ELECTRON MAIN] Cart cleared after successful order');
            }
            catch (error) {
                // Cart file might not exist, which is fine
                console.log('⚡ [ELECTRON MAIN] Cart file already cleared or not found');
            }
            console.log('⚡ [ELECTRON MAIN] Order created successfully:', orderId);
            return order;
        }
        catch (error) {
            console.error('⚡ [ELECTRON MAIN] Failed to process order:', error);
            throw new Error('Failed to process order');
        }
    });
    // Get order by ID
    electron_1.ipcMain.handle('cart:getOrder', async (event, orderId) => {
        try {
            console.log('⚡ [ELECTRON MAIN] Getting order:', orderId);
            const orders = await loadOrdersFromFile();
            const order = orders.find(o => o.id === orderId);
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            return order;
        }
        catch (error) {
            console.error('⚡ [ELECTRON MAIN] Failed to get order:', error);
            throw new Error('Failed to get order');
        }
    });
    // Get all orders
    electron_1.ipcMain.handle('cart:getOrders', async (event) => {
        try {
            console.log('⚡ [ELECTRON MAIN] Getting all orders');
            return await loadOrdersFromFile();
        }
        catch (error) {
            console.error('⚡ [ELECTRON MAIN] Failed to get orders:', error);
            throw new Error('Failed to get orders');
        }
    });
}
/**
 * Helper functions
 */
function calculateEstimatedDelivery(shippingMethod) {
    const now = new Date();
    const deliveryDate = new Date(now);
    switch (shippingMethod) {
        case 'overnight':
            deliveryDate.setDate(now.getDate() + 1);
            break;
        case 'express':
            deliveryDate.setDate(now.getDate() + 3);
            break;
        case 'standard':
        default:
            deliveryDate.setDate(now.getDate() + 7);
            break;
    }
    return deliveryDate;
}
async function saveOrderToFile(order) {
    try {
        const orders = await loadOrdersFromFile();
        orders.push(order);
        await promises_1.default.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
        console.log('⚡ [ELECTRON MAIN] Order saved to file system');
    }
    catch (error) {
        console.error('⚡ [ELECTRON MAIN] Failed to save order to file:', error);
        throw error;
    }
}
async function loadOrdersFromFile() {
    try {
        const ordersData = await promises_1.default.readFile(ORDERS_FILE, 'utf-8');
        const orders = JSON.parse(ordersData);
        // Ensure dates are properly parsed
        return orders.map((order) => ({
            ...order,
            createdAt: new Date(order.createdAt),
            estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
            cart: {
                ...order.cart,
                createdAt: new Date(order.cart.createdAt),
                updatedAt: new Date(order.cart.updatedAt)
            }
        }));
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            console.log('⚡ [ELECTRON MAIN] No orders file found, returning empty array');
            return [];
        }
        console.error('⚡ [ELECTRON MAIN] Failed to load orders from file:', error);
        throw error;
    }
}
