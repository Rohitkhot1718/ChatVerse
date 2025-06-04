import jwt from 'jsonwebtoken'
export default function restrictSignIn(req, res, next) {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Access Denied. No token is provided' })
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decode
        next()
    } catch (error) {
        return res.status(401).json({ message: error.message })
    }
}