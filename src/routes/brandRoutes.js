import { v2 } from "cloudinary";
import { Brand } from "../models/brandModel.js";

export default async function brandRoutes(fastify, options){
    // create brand
    
    
    fastify.post('/api/brand', async (request,reply)=>{
        try {
            const { name, description,image, status  } = request.body
            const newBrand = new Brand({ name, description,image, status  })
            const result = await newBrand.save()
            reply.code(201).send({status:true, data : result})
        } catch (error) {
            reply.code(500).send({error: 'Failed to Create Brand'})
        }
    })
     // get all brand
    fastify.get('/api/brand', async (request, reply)=>{
        try {
            const brands = await Brand.find()
            // console.log('brands', brands);
            reply.send({status: true, data: brands})
        } catch (error) {
            reply.code(500).send({status:false, msg:"Failed to fetch all Brands!", err:err})
        }
    })
    // get single brand
    fastify.get('/api/brand/:id', async (request, reply)=>{
        try {
            const brand = await Brand.findById(request.params.id)
            if(!brand){
                return reply.code(404).send({status:false, error: 'Brand not found'})
            }
            reply.send({status:true, data : brand})
        } catch (error) {
            reply.code(500).send({status:false, msg:"Failed to fetch Brand!", err:err})
        }
    })
    // update brand
    fastify.put(`/api/brand/:id`, async (request, reply)=>{
        try {
            const updatedBrand = await Brand.findByIdAndUpdate(
                request.params.id,
                request.body,
                {new : true}
            )
            if(!updatedBrand){
                return reply.code(404).send({status:false, error: 'Brand not found'})
            }
            reply.send({status:true, data: updatedBrand})
        } catch (error) {
            reply.code(500).send({status:false, error: 'Failed to updated Brand'})
            
        }
    })
    
    
        // delete brand
        fastify.delete(`/api/brand/:id`, async(request, reply)=>{
            try {
                const deletedBrand = await Brand.findByIdAndDelete(request.params.id)
                if(!deletedBrand){
                    return reply.code(404).send({status:false, error: 'Brand not found'})
                }
                reply.send({status:true, message:'Brand deleted Successfully'})
            } catch (error) {
                reply.code(500).send({status:false, error: 'Failed to delete Brand'})
                
            }
        })

}
