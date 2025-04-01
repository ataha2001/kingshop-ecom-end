import mongoose, { Schema } from "mongoose";


const wishListSchema = new Schema ({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    products:[{type:mongoose.Schema.Types.ObjectId, ref:"Product"}],
})


export  const WishList = mongoose.model("WishList", wishListSchema)