const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const User = require('../Models/UserModel');

const verifyAsync = promisify(jwt.verify);




// Middleware לאימות JWT token
exports.authenticateToken = async (req, res, next) => {

    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        console.log('token', token);

        if (!token) {
            return res.status(401).json({ 
                message: 'גישה נדחתה - לא נמצא טוקן אימות' 
            });
        }



        const jwtSecret = process.env.JWT_SECRET;



        // שימוש ב-await במקום callback
        const decoded = await verifyAsync(token, jwtSecret);




        // בדיקה שהמשתמש עדיין קיים במסד הנתונים
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ 
                message: 'המשתמש לא נמצא במערכת' 
            });
        }
        

        // שמירת פרטי המשתמש ב-request object
        req.user = {
            userId: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname
        };
        
        // שמירת userId בנפרד לנוחות (משמש ב-Controllers)
        req.userId = user._id;

        next();

    } catch (err) {
        return res.status(403).json({ 
            message: 'טוקן לא תקין או פג תוקף' 
        });
    }
};