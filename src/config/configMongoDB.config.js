
import mongoose from 'mongoose'
import ENVIRONMENT from './environment.config.js'

let isConnected = false

async function connectToMongoDB (){
    if (isConnected && mongoose.connection.readyState === 1) {
        console.log('Usando conexión MongoDB existente')
        return
    }

    try{
        const connection_string = ENVIRONMENT.MONGO_DB_CONNECTION_STRING
        await mongoose.connect(connection_string, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        isConnected = true
        console.log("Conexion con DB exitosa!")
    }
    catch(error){
        isConnected = false
        console.log('[SERVER ERROR]: Fallo en la conexion',  error)
        throw error
    }
}

export default connectToMongoDB