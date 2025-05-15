// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET_KEY;

// const verifyToken = (req, res, next) => {
//     try{
//         const token = req.cookies.token; 
//         console.log("your request that we received", req);
//         console.log('Cookies received:', req.cookies);
//         // console.log('Token from cookie:', token);
//         //const token = req.headers.authorization?.split(' ')[1]; //Bearer token(testing oK)
//         if (!token) {
//         return res.status(401).send({ message: `Token not found`, req:{
//       req_cookie: req.cookie,
//       req_token: req.cookie.token
//     } });
//         }

//         const decoded = jwt.verify(token, JWT_SECRET);
//         if (!decoded.userId) {
//         return res.status(401).send({ message: 'User ID not found in token' });
//         }

//         req.userId = decoded.userId;
//         req.role = decoded.role;
        
//         next();
//     } catch (error) {
//         console.error('Error verifying token:', error);
//         res.status(401).send({ message: 'Invalid token' });
//     }
// };

// module.exports = verifyToken;

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
  try {
    // Try to get token from cookie first
    let token = req.cookies?.token;

    // If no token in cookie, check Authorization header for Bearer token
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization; // e.g. "Bearer eyJ..."
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]; // get the token part after "Bearer "
      }
    }

    if (!token) {
      return res.status(401).send({
        message: 'Token not found',
        req: {
          req_cookie: req.cookies,
          auth_header: req.headers.authorization,
        }
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).send({ message: 'User ID not found in token' });
    }

    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).send({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
