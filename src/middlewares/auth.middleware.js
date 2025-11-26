import jwt from 'jsonwebtoken'
import ENVIRONMENT from '../config/environment.config.js'

export function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || ''
        const [type, token] = header.split(' ')
        if (type !== 'Bearer' || !token) {
            return res.status(401).json({ ok: false, message: 'Token requerido', status: 401 })
        }
        const payload = jwt.verify(token, ENVIRONMENT.JWT_SECRET)
        req.user = { id: payload.id || payload.sub, email: payload.email, name: payload.name }
        return next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ ok: false, message: 'Token expirado', status: 401 })
        }
        return res.status(401).json({ ok: false, message: 'Token invalido', status: 401 })
    }
}
