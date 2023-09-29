const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

const { bodyDataHas, bodyDataNotEmpty } = require(path.resolve("src/middleware-common/middleware"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// Middleware

function priceIsPositiveNum (req, res, next) {
    const { data = {} } = req.body;
    const price = data.price;
    if (Number.isInteger(price) && price > 0) {
        res.locals.price = price;
        return next();
    }
    next({status: 400, message: 'Dish must have a price that is an integer greater than 0'});
}

function hasId(req, res, next) {
    const { dishId } = req.params;
    if (dishId) {
        res.locals.dishId = dishId;
        return next();
    }
    next({status: 404})
}

function dishFound(req, res, next) {
    const id = res.locals.dishId;
    const dish = dishes.find((dish) => dish.id === id);
    if (dish !== undefined) {
        res.locals.dish = dish;
        return next();
    }
    next({status: 404, message: `Dish does not exist: ${id}.`});
}

function idMatches(req, res, next) {
    const id = res.locals.dishId;
    const dish = req.body.data;

    if (id === dish.id || ["", null, undefined].includes(dish.id)) {
        req.body.data.id = id;
        return next();
    }
    next({status: 400, message: `Dish id does not match route id. Dish: ${dish.id}, Route: ${id}`})
}

// API methods

function newDish(req, res, next) {
    const dish = {
        id: nextId(),
        name: res.locals.name,
        description: res.locals.description,
        price: res.locals.price,
        image_url: res.locals.image_url
    }

    dishes.push(dish);

    res.status(201).json({data: dish});
}

function readDish(req, res, next) {
    res.status(200).json({data: res.locals.dish});
}

function updateDish(req, res, next) {
    const id = res.locals.id;
    const dish = req.body;

    const index = dishes.findIndex((d) => d.id === id);
    dishes[index] = dish;
    res.status(200).json(dish);
}

function listDishes(req, res, next) {
    res.status(200).json({data: dishes});
}

module.exports = {
    create: [
        bodyDataHas('name'),
        bodyDataNotEmpty('name'),
        bodyDataHas('description'),
        bodyDataNotEmpty('description'),
        bodyDataHas('price'),
        priceIsPositiveNum,
        bodyDataHas('image_url'),
        bodyDataNotEmpty('image_url'),
        newDish
    ],
    read: [
        hasId,
        dishFound,
        readDish
    ],
    update: [
        hasId,
        dishFound,
        idMatches,
        bodyDataHas('name'),
        bodyDataNotEmpty('name'),
        bodyDataHas('description'),
        bodyDataNotEmpty('description'),
        bodyDataHas('price'),
        priceIsPositiveNum,
        bodyDataHas('image_url'),
        bodyDataNotEmpty('image_url'),
        updateDish
    ],
    list: listDishes
}