const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') return res.status(403).send({ message: "Require Admin Role!" });
    next();
};

const verifyLawyer = (req, res, next) => {
    if (req.userRole !== 'lawyer' && req.userRole !== 'admin') return res.status(403).send({ message: "Require Lawyer Role!" });
    next();
};

const verifyClerk = (req, res, next) => {
    if (req.userRole !== 'clerk' && req.userRole !== 'admin') return res.status(403).send({ message: "Require Clerk Role!" });
    next();
};

module.exports = { verifyToken, verifyAdmin, verifyLawyer, verifyClerk };
