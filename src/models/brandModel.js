import mongoose, { Schema } from "mongoose";


const brandSchema = new Schema ({
    name:{type:String, reqiured:true},
    description:{type:String, reqiured:true},
    image: {url:String, id:String },
    status:{type:String, reqiured:true},
})





// export const Brand = models?.Brand || model('Brand', brandSchema)
export  const Brand = mongoose.model("Brand", brandSchema)