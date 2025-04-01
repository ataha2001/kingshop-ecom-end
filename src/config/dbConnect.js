import mongoose from "mongoose";

export const startDb = async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/shopking")
        console.log("MongoDb Connected");
        
    } catch (err) {
        console.error("Error in connecting to MongoDb",err);
        process.exit(1)
        
    }
}