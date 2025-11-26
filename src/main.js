import ENVIRONMENT from "./config/environment.config.js";

import connectToMongoDB from "./config/configMongoDB.config.js";
import express from 'express'
import authRouter from "./routes/auth.router.js";
import reservationRouter from "./routes/reservation.router.js";
import canchaRouter from "./routes/cancha.router.js";
import conversacionRouter from "./routes/conversacion.router.js";
import cors from 'cors'


connectToMongoDB()

const app = express()

app.use( cors() )


app.use(express.json())

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