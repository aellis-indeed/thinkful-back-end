function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({status: 400, message: `Dish must include a ${propertyName}`});
    };
}

function bodyDataNotEmpty(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName] !== "") {
            res.locals[propertyName] = data[propertyName];
            return next();
        }
        next({status: 400, message: `Dish must include a ${propertyName}`});
    };
}

module.exports = {
    bodyDataHas,
    bodyDataNotEmpty
}