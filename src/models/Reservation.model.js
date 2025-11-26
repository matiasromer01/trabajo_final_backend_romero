import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    start_time: { 
        type: Date, 
        required: true 
    },
    end_time: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled'], 
        default: 'pending', 
        required: true 
    },
    created_at: { 
        type: Date, 
        default: Date.now, 
        required: true 
    },
    modified_at: { 
        type: Date, 
        default: null 
    }
})

reservationSchema.index({ start_time: 1, end_time: 1 })

const Reservation = mongoose.model('Reservation', reservationSchema)
export default Reservation
