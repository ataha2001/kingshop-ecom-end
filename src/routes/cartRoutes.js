import { v2 } from "cloudinary";
import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";

export default async function cartRoutes(fastify, options) {
  // create cart

  fastify.post("/api/cart",{preValidation: [fastify.authenticate]}, async (request, reply) => {
    try {
      const { productId, variationId, quantity } = request.body;
      const user  = request.user?.userId
      //check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return reply
          .code(404)
          .send({ status: false, error: "Product Not Found...!" });
      }
      const variation = product.variations.id(variationId)
      if(!variation){
        return reply
          .code(404)
          .send({ status: false, error: "Variation Not Found...!" });
      }
      
      // find or create a wishList for the user
      let cart = await Cart.findOne( {userId: user} );
      if (!cart) {
        cart = new Cart({ userId:user, item: [{ productId, variationId, quantity }] });
      } else {
        // cehck if the product is already in the cart
        const existingItem = cart?.item?.find(
            (item) => item.productId.toString() === productId && item.variationId.toString() === variationId
          );
          
        if (existingItem) {
          existingItem.quantity = quantity;
        } else {
          cart.item.push({ productId, variationId, quantity });
        }
      }
      await cart.save();
      reply.code(201).send({ status: true, data: cart });
    } catch (error) {
      reply.code(500).send({ error: "Failed to Update Cart" });
    }
  });

  function enrichCartItems(cartItems){
    // console.log('cartItems', cartItems);
    
    return cartItems.map((item)=>{
      const matchingVariation = item.productId.variations.find(variation =>
        variation._id.toString() === item.variationId.toString()
      )
      
      return {
        ...item.toObject(),
        variation: matchingVariation.toObject()
      }
    })
  }

  // get all items in the user cart
  fastify.get("/api/cart",{preValidation: [fastify.authenticate]}, async (request, reply) => {
    try {
        const userId  = request.user?.userId
        const cart = await Cart.findOne({ userId }).populate('item.productId')
        if(!cart){
            return reply.code(404).send({status:false, error: 'Cart Not Found'})
        }
        
        // reply.send({ status: true, data: cart });
      reply.send({ status: true, data: { ...cart.toObject(), item:enrichCartItems(cart.item)} });
    } catch (err) {
      reply
        .code(500)
        .send({ status: false, msg: "Failed to fetch Cart!", error: err });
    }
  });
  // update quantity of a product in the cart
  fastify.put(`/api/cart`,{preValidation: [fastify.authenticate]}, async (request, reply) => {
    try {
        
        const userId  = request.user?.userId
        const { productId, variationId, quantity } = request.body
  
        const cart = await Cart.findOne({ userId:userId })
        if(!cart){
            return reply
            .code(404)
            .send({ status: false, error: "Cart not found" });
        }
        
    const items = cart.item.find(
      (item) =>
        item?.productId?.toString() === productId &&
        item?.variationId?.toString() === variationId
    );
        
      if (!items) {
        return reply
          .code(404)
          .send({ status: false, error: "Item not found" });
      }
      items.quantity = quantity
      await cart.save()
      reply.send({ status: true, data: cart});
    } catch (error) {
      reply.code(500).send({ status: false, error: "Failed to updated Cart item" });
    }
  });

  // remove a product from cart 
  fastify.delete(`/api/cart/:productId/:variationId`,{preValidation: [fastify.authenticate]}, async (request, reply) => {
    try {
      const { productId, variationId } = request.params;
      const userId  = request.user?.userId
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return reply
          .code(404)
          .send({ status: false, error: "Cart Not Found...!" });
      }

      cart.item = cart.item.filter(
        (item) => item.productId.toString() !== productId || item.variationId.toString() !== variationId
      );
      await cart.save();
      reply
        .code(201)
        .send({ status: true, msg: "Product Removed from Cart....", data:cart });
    } catch (error) {
      reply
        .code(500)
        .send({
          status: false,
          error: "Failed to remove product from Cart...!",
        });
    }
  });

  // clear the cart
  fastify.delete('/api/cart', {preValidation: [fastify.authenticate]}, async (request,reply)=>{
      try {
        const userId  = request.user?.userId
          const  cart = await Cart.findOneAndUpdate(
              { userId }, 
              {$set: {item:[]}}, 
              {new: true})
          if(!cart){
              return reply.code(404).send({status:false, error:'Cart Not Found...!'})
          }
          reply.code(201).send({status:true, msg:'Cart cleared....', data:cart})
      } catch (error) {
          reply.code(500).send({status:false, error: 'Failed to clear Cart...!'})
      }
  })
}
