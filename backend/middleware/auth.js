import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {

    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized Login Again' })
    }

    try {

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)

        req.body.userId = token_decode._id;
        req.user = token_decode;
        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return next(new ErrorResponse("Not authorized as admin", 403));
    }
};
export { authUser, admin }