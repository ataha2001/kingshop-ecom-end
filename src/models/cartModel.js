import mongoose, { Schema } from "mongoose";



const cartItemSchema = new Schema ({
    productId:{type:mongoose.Schema.Types.ObjectId, ref:"Product", required: true, unique:true},
    variationId:{type:mongoose.Schema.Types.ObjectId, required:true},
    quantity:{type:Number, required:true, min:1}
})


const cartSchema = new Schema ({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"User", required: true, unique:true},
    item:[cartItemSchema]
},{timestamps: true})





export  const Cart = mongoose.model("Cart", cartSchema)