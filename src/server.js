import Fastify from "fastify";
import { startDb } from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import fastifyJwt from "@fastify/jwt";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import wishListRoutes from "./routes/wishListRoutes.js";
import cors from '@fastify/cors'
import dotenv from 'dotenv'
dotenv.config()
const fastify = Fastify({logger:true})
import {fastifyMultipart} from "@fastify/multipart";
import cloudinary from 'cloudinary'
import { pipeline } from 'stream/promises'
import cartRoutes from "./routes/cartRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";


const { v2 } = cloudinary
v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key :process.env.CLOUDINARY_API_KEY,
    api_secret :process.env.CLOUDINARY_API_SECRET,
})


// const fastify = require("fastify")();

fastify.register(cors, {
  origin: "*", // Allow all origins (use specific origins in production)
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
//   credentials: true, // Allow sending cookies
});

// Register multipart
fastify.register(fastifyMultipart)



// register fastify jwt
fastify.register(fastifyJwt, {secret:"supersecret"})

fastify.decorate("authenticate", async function(request, reply){
    try {
        await request.jwtVerify()
    } catch (err) {
        reply.code(500).send({status:false, msg:"Somthing Went wrong !", err:err})
    }
})

fastify.get("/", (req,reply)=>{
    reply.send({msg: "Hello from Server"})
})

fastify.register(authRoutes)
fastify.register(productRoutes)
fastify.register(orderRoutes)
fastify.register(categoryRoutes)
fastify.register(brandRoutes)
fastify.register(wishListRoutes)
fastify.register(cartRoutes)
fastify.register(dashboardRoutes)
fastify.register(stripeRoutes)


fastify.post('/api/upload', async function (req, reply){
    try {
        // process single file
        const data = await req.file()
        // access file metadata using data fields
        const { filename, mimetype } = data

        // stream the file to cloudinary
        const result = await new Promise((resolve, reject)=>{
            const uploadStream = v2.uploader.upload_stream(
                { resource_type: mimetype.startsWith('image') ? 'image': 'video'},
                (error, result)=>{
                    if(error) reject(error)
                        else resolve(result)
                }
            )
            pipeline(data.file, uploadStream).catch(reject)
        })
        console.log('reslt', result);
        
         // send cloudinary upload result 
         reply.send({
            message: 'File Upload Successfully...',
            url: result.secure_url,
            public_id : result?.public_id,
            result,
         })

    } catch (err) {
        reply.code(500).send({
            error: 'File Upload failed',
            details: err.message,
        })
    }
})

fastify.post('/api/delete', async function (req, reply){
    
    const { public_id } = request.body
    if(!public_id){
        return reply.code(400).send({error: 'Public_ id is required'})
    }

    try {
       const result = await v2.uploader.destroy(public_id, (error, result)=>{
        if (error){
            throw new Error(error.message)
        }
        return result
       })
       if(result.result === 'ok'){
        reply.send({message: 'File deleted Successfully ...' , status: true})
       }else {
        reply.code(404).send({ error: 'File not found or already deleted'})
       }

    } catch (err) {
        reply.code(500).send({
            error: 'File Upload failed',
            details: err.message,
        })
    }
})

const start = async()=>{
    await startDb()
    try {
        await fastify.listen({port:4000})
        console.log("Server is running on http://localhost:4000");
        
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()