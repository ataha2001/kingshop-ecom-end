import mongoose, { Schema } from "mongoose";


const categorySchema = new Schema ({
    category:{type:String},
    subcategory:{type:String},
    status:{type:String},
    image:{url:String, id: String},
})


// export const Category = models?.Category || model('Category', categorySchema)
 export  const Category = mongoose.model("Category", categorySchema)