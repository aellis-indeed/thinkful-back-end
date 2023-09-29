const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

const { bodyDataHas, bodyDataNotEmpty } = require(path.resolve("src/middleware-common/middleware"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Middleware

function validateDishes(req, res, next) {
    const dishes = req.body.data.dishes;
    res.locals.dishes = dishes;
    if (!Array.isArray(dishes) || dishes.length === 0) {
        return next({status: 400, message: 'Order must include at least one dish'})
    }

    for (let i = 0; i < dishes.length; i++) {
        if (!validateSingleDish(dishes[i])) {
            return next({status: 400, message: `Dish ${i} must have a quantity that is an integer greater than 0`})
        }
    }

    next();
}

function validateSingleDish(dish) {
    const { quantity } = dish;

    if (quantity === undefined || !Number.isInteger(quantity) || quantity < 1) {
        return false;
    }
    return true;
}

function hasId(req, res, next) {
    const { orderId } = req.params;
    if (orderId) {
        res.locals.orderId = orderId;
        return next();
    }
    next({status: 404})
}

function orderFound(req, res, next) {
    const id = res.locals.orderId;
    const order = orders.find((order) => order.id === id);
    if (order !== undefined) {
        res.locals.order = order;
        return next();
    }
    next({status: 404, message: `Dish does not exist: ${id}.`});
}

function routeIdMatchesBody(req, res, next) {
    const id = res.locals.orderId;
    const order = req.body.data;

    if (id === order.id || ["", null, undefined].includes(order.id)) {
        req.body.data.id = id;
        return next();
    }
    
    next({status: 400, message: `Order id does not match route id. Order: ${order.id}, Route: ${id}`})
}

function notDeliveredYet(req, res, next) {
    const {status} = res.locals.order;
    if (status === 'delivered') {
        return next({status: 400, message: 'delivered'});
    }
    next();
}

function notPending(req, res, next) {
    const {status} = res.locals.order;
    if (status !== 'pending') {
        return next({status: 400, message: 'pending'});
    }
    next();
}

function validateStatus(req, res, next) {
    const {status} = res.locals;
    if (['pending', 'preparing', 'out-for-delivery'].includes(status)) {
        return next();
    }
    next({status: 400, message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'})
}

// API methods

function listOrders(req, res, next) {
    res.status(200).json({data: orders})
}

function createOrder(req, res, next) {
    const order = req.body.data;
    order.id = nextId();
    orders.push(order)
    res.status(201).json({data: order})
}

function readOrder(req, res, next) {
    res.status(200).json({data: res.locals.order})
}

function updateOrder(req, res, next) {
    const order = req.body.data;
    const index = orders.findIndex((o) => order.id === o.id);
    orders[index] = order;
    res.status(200).json({data: order});
}

function deleteOrder(req, res, next) {
    const {orderId} = res.locals;
    const index = orders.findIndex((o) => orderId === o.id);
    orders.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
    create: [
        bodyDataHas('deliverTo'),
        bodyDataNotEmpty('deliverTo'),
        bodyDataHas('mobileNumber'),
        bodyDataNotEmpty('mobileNumber'),
        bodyDataHas('dishes'),
        validateDishes,
        createOrder
    ],
    read: [
        hasId,
        orderFound,
        readOrder
    ],
    update: [
        hasId,
        orderFound,
        bodyDataHas('deliverTo'),
        bodyDataNotEmpty('deliverTo'),
        bodyDataHas('mobileNumber'),
        bodyDataNotEmpty('mobileNumber'),
        bodyDataHas('dishes'),
        validateDishes,
        routeIdMatchesBody,
        bodyDataHas('status'),
        bodyDataNotEmpty('status'),
        notDeliveredYet,
        validateStatus,
        updateOrder
    ],
    delete: [
        hasId,
        orderFound,
        notPending,
        deleteOrder
    ],
    list: listOrders
}