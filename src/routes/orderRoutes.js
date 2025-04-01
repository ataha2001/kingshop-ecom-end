import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";

const generateOrderId = () => {
  return "#" + Math.floor(Math.random() * 1000000000).toString();
};

export default async function orderRoutes(fastify, options) {
  // create new Order
  fastify.post("/api/orders",{preValidation: [fastify.authenticate]}, async (request, reply) => {
    try {
      const orderData = request.body;
      console.log("orderData", orderData);
      
      const newOrder = new Order({
        orderId: generateOrderId(),
        userId: request.user.userId,
        orderDate: Date.now(),
        paymentType: orderData?.paymentType,
        orderType: orderData?.orderType,
        orderStatus: "Pending",
        // returnReason: { type: String },
        returnStatus: "Pending",
        // cancellationReason: orderData?.cancellationReason || "",
        items: orderData?.items,
        shippingAddress: orderData?.shippingAddress,
        billingAddress: orderData?.billingAddress,
        subtotal: orderData?.subtotal,
        tax: orderData?.tax,
        discount: orderData?.discount,
        shippingCharge: orderData?.shippingCharge,
        total: orderData?.total,
      });
      await newOrder.save();
      //create rezerpay order

      reply
        .code(201)
        .send({
          status: true,
          msg: "Order Created Successfully ....",
          data: newOrder,
        });
    } catch (err) {
      reply
        .code(500)
        .send({ status: false, mes: "Faild to Create Order", err: err });
    }
  });

  // get   all Orders
  fastify.get("/api/orders", async (request, reply) => {
    try {
      // const userId =  request?.user?.userId
      const data = await Order.find().populate('userId')
      
      reply
        .code(200)
        .send({
          status: true,
          msg: "Orders fetched Successfully ....",
          data: data,
        });
    } catch (err) {
      reply
        .code(500)
        .send({ status: false, mes: "Faild to fetch Orders", err: err });
    }
  });

    // get   Order by id 
    fastify.get("/api/orders/:id", async (request, reply) => {
      try {
        // const userId =  request?.user?.userId
        const {id} = request.params
        // console.log('id', id);
        
        const data = await Order.findById( id )
        // console.log(data);
        
        reply
          .code(200)
          .send({
            status: true,
            msg: "Orders fetched Successfully ....",
            data: data,
          });
      } catch (err) {
        reply
          .code(500)
          .send({ status: false, mes: "Faild to fetch Order", err: err });
      }
    });

  
    // get   Order by id 
    fastify.put("/api/orders/:id", async (request, reply) => {
      try {
        const {id} = request.params
        
        const data = await Order.findByIdAndUpdate( id, {orderStatus: request?.body?.orderStatus},{new:true} )
        // console.log(data);
        
        reply
          .code(200)
          .send({
            status: true,
            msg: "Orders fetched Successfully ....",
            data: data,
          });
      } catch (err) {
        reply
          .code(500)
          .send({ status: false, mes: "Faild to fetch Order", err: err });
      }
    });  
}
