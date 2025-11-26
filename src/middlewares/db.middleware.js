import connectToMongoDB from "../config/configMongoDB.config.js"

export const ensureDbConnection = async (req, res, next) => {
    try {
        await connectToMongoDB()
        next()
    } catch (error) {
        console.error('[DB MIDDLEWARE]: Error conectando a MongoDB', error)
        return res.status(503).json({
            ok: false,
            message: 'Error de conexión con la base de datos'
        })
    }
}
