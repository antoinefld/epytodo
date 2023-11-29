const index = require("../index.js");

const extractBearerToken = headerValue => {
    let matches;

    if (typeof headerValue !== 'string')
        return false;
    matches = headerValue.match(/(bearer)\s+(\S+)/i);
    return matches && matches[2];
}

const checkToken = (req, res, next) => {
    const token = req.headers.authorization
    && extractBearerToken(req.headers.authorization);

    if (!token)
        return res.status(401).json({ message: 'Error. Need a token' });
    index.jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
        if (err)
            res.status(401).json({ message: 'Error. Bad token' });
        else
            return next();
    })
}

module.exports = {checkToken, extractBearerToken};
