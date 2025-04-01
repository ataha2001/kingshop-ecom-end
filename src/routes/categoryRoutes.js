import { v2 } from "cloudinary";
import { Category } from "../models/categoryModel.js";

export default async function categoryRoutes(fastify, options){

    // create category
    fastify.post('/api/category',async (request,reply)=>{
        try {
            console.log('body', request.body);
            
            const { category, subcategory, status, image } = request.body
            const newCategory = new Category({ category, subcategory, status, image })
            const result = await newCategory.save()
            
            reply.code(201).send({status:true, msg:"Category Created Successfully!", data: result})
        } catch (err) {
            reply.code(500).send({status:false, msg:"Failed to create Category!", err:err})
        }
    })

    // getall categoryes
    fastify.get('/api/category', async (request, reply)=>{
        try {
            const categories = await Category.find()
            reply.send({status:true, data : categories})
        } catch (error) {
            reply.code(500).send({status:false, msg:"Failed to fetch all Categories!", error:error})
        }
    })
    // get single category
    fastify.get('/api/category/:id', async (request, reply)=>{
        try {
            const category = await Category.findById(request.params.id)
            if(!category){
                return reply.code(404).send({status:false, error: 'Category not found'})
            }
            reply.send({status:true, data : category})
        } catch (error) {
            reply.code(500).send({status:false, msg:"Failed to fetch Category!", error:error})
        }
    })
    // update category
    fastify.put(`/api/category/:id`, async (request, reply)=>{
        try {
            const updatedCategory = await Category.findByIdAndUpdate(
                request.params.id,
                request.body,
                {new : true}
            )
            if(!updatedCategory){
                return reply.code(404).send({status:false, error: 'Category not found'})
            }
            reply.send({status:true, data: updatedCategory})
        } catch (error) {
            reply.code(500).send({status:false, error: 'Failed to updated Category', error:error})
            
        }
    })


    // delete category
    fastify.delete(`/api/category/:id`, async(request, reply)=>{
        try {
            const deletedCategory = await Category.findByIdAndDelete(request.params.id)
            if(!deletedCategory){
                return reply.code(404).send({status:false, error: 'Category not found'})
            }
            reply.send({status:true, message:'Category deleted Successfully'})
        } catch (error) {
            reply.code(500).send({status:false, message: 'Failed to delete Category'})
            
        }
    })
}
