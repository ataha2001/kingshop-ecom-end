import { v2 } from "cloudinary";
import { WishList } from "../models/wishListModel.js";
import { Product } from "../models/productModel.js";

export default async function categoryRoutes(fastify, options){

    // add product to a user's wishlist
    fastify.post('/api/wishList',{preValidation: [fastify.authenticate]}, async (request,reply)=>{
        try {
            const { product } = request.body
            const user  = request.user?.userId
            //check if product exists
            const data = await Product.findById(product)
            if(!data){
                return reply.code(404).send({status:false, error:'Product Not Found...!'})
            }
            // find or create a wishList for the user
            let wishList = await WishList.findOne({ user })
            if(!wishList){
                wishList = new WishList({user, products:[product]})
            }else{
                // avoide duplicate product
                if (!wishList.products.includes(product)){
                    // wishList.push(product)
                    wishList.products.push(product);
                }
                else{
                        reply.code(202).send({status:false, error: "Product alredy in your wishlist"})   
                    }
                }
            await wishList.save()
            reply.code(201).send({status:true, data: wishList})
        } catch (error) {
            reply.code(500).send({status:false, error: 'Failed to add product to wishlist...!'})
        }
    })

    // get all product in a user's wishlist
    fastify.get('/api/wishList',{preValidation: [fastify.authenticate]}, async (request,reply)=>{
        try {
            const user  = request.user?.userId
            const  wishList = await WishList.findOne({ user }).populate('products')
            if(!wishList){
                return reply.code(404).send({status:false, error:'wishList Not Found...!'})
            }
            reply.code(201).send({status:true, data: wishList})
        } catch (error) {
            reply.code(500).send({status:false, error: 'Failed to add product to wishlist...!'})
        }
    })
    // remove product from a user's wishlist
    fastify.delete('/api/wishList/:product',{preValidation: [fastify.authenticate]}, async (request,reply)=>{
        try {
            const { product} = request.params
            const user  = request.user?.userId
            const  wishList = await WishList.findOne({ user })
            if(!wishList){
                return reply.code(404).send({status:false, error:'wishList Not Found...!'})
            }
            wishList.products = wishList.products.filter(
                (item) => item.toString() !== product
            )
            await wishList.save()
            reply.code(201).send({status:true, msg:'Product Removed from wishlist....'})
        } catch (error) {
            reply.code(500).send({status:false, error: 'Failed to remove product from wishlist...!'})
        }
    })

    // clear all product from a user's wishlist
    fastify.delete('/api/wishList', {preValidation: [fastify.authenticate]}, async (request,reply)=>{
        try {
            const user  = request.user?.userId
            const  wishList = await WishList.findOneAndUpdate(
                { user }, 
                {$set: {products:[]}}, 
                {new: true})
            if(!wishList){
                return reply.code(404).send({status:false, error:'wishList Not Found...!'})
            }
            reply.code(201).send({status:true, msg:'Wishlist cleared....'})
        } catch (error) {
            reply.code(500).send({status:false, error: 'Failed to clear wishlist...!'})
        }
    })


}