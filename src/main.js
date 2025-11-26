import ENVIRONMENT from "./config/environment.config.js";

import express from 'express'
import authRouter from "./routes/auth.router.js";
import reservationRouter from "./routes/reservation.router.js";
import canchaRouter from "./routes/cancha.router.js";
import conversacionRouter from "./routes/conversacion.router.js";
import cors from 'cors'
import { ensureDbConnection } from "./middlewares/db.middleware.js";

const app = express()

const allowedOrigins = [
    'http://localhost:5173',
    'https://trabajo-final-frontend-romero.vercel.app'
]

const vercelPreviewRegex = /^https:\/\/trabajo-final-frontend-romero.*\.vercel\.app$/

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
            return callback(null, true)
        }
        return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
}))


app.use(express.json())

// Ensure DB connection before processing any request
app.use(ensureDbConnection)

app.use('/api/auth', authRouter)
app.use('/api/reservas', reservationRouter)
app.use('/api/canchas', canchaRouter)
app.use('/api/conversaciones', conversacionRouter)




app.listen(
    ENVIRONMENT.PORT || 8080,
    () => {
        console.log(`Tu servidor se esta ejecutando correctamente en el puerto ${ENVIRONMENT.PORT}`)
    }
)

// Exportar para Vercel (serverless)
export default app