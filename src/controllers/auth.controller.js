import ENVIRONMENT from "../config/environment.config.js";
import { ServerError } from "../error.js";
import AuthService from "../services/auth.service.js";

class AuthController {
    static async register (request, response){
        try{
            const { email, password, name } = request.body
            
            await AuthService.register(email, password, name)
            return response.status(201).json({
                ok: true,
                message: 'Usuario registrado con exito'
            })
        }
        catch(error){
            if(error.status){
                return response.status(error.status).json({
                    ok:false,
                    message: error.message
                })
            }
            else{
                console.error(
                    'ERROR AL REGISTRAR', error
                )
                return response.status(500).json({
                    ok: false,
                    message: 'Error interno del servidor'
                })
            }
        }
    }

    static async verifyEmail (request, response){
        try{
            const {verification_token} = request.params

            await AuthService.verifyEmail(verification_token)
            response.redirect(
                ENVIRONMENT.URL_FRONTEND + '/login?from=verified_email'
            )
        }
        catch(error){

            if(error.status){
                response.send(
                    `<h1>${error.message}</h1>`
                )
            }
            else{
                console.error(
                    'ERROR AL REGISTRAR', error
                )

                response.send(
                    `<h1>Error en el servidor, intentelo mas tarde</h1>`
                )
            }
        }
    }

    static async login (request, response){
        try{
            const {email, password} = request.body

            const { auth_token, user } = await AuthService.login(email, password)

            return response.status(200).json({
                ok: true, 
                message: 'Usuario logueado con exito',
                token: auth_token,
                user: user
            })
        }
        catch(error){
            if(error.status){
                return response.status(error.status).json({
                    ok:false,
                    message: error.message
                })
            }
            else{
                console.error(
                    'ERROR AL LOGIN', error
                )
                return response.status(500).json({
                    ok: false,
                    message: 'Error interno del servidor'
                })
            }
        }
    }
}


export default AuthController
