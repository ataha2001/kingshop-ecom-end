import mongoose, { Schema } from "mongoose";


const orderItemSchema = new Schema({
    productName:{type:String, reqiured:true},
    productImage:{type:String},
    color:{type:String},
    size:{type:String},
    price:{type:Number, reqiured:true},
    quantity:{type:Number, reqiured:true},
    sku:{type:String, reqiured:true},

})

const addressSchema = new Schema({
    fullname:{type:String, reqiured:true},
    email:{type:String, reqiured:true},
    phone:{type:String, reqiured:true},
    addressLine1:{type:String, reqiured:true},
    addressLine2:{type:String},
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
    country: { type: String, required: true },
  });
  

const orderSchema = new Schema({
    orderId:{type:String, unique:true},
    userId:{type:Schema.Types.ObjectId, ref:"User"},
    orderDate:{type:Date, default:Date.now()},
    paymentType:{type:String, required:true},
    orderType:{type:String, required:true},
    orderStatus:{type:String, enum:["Pending", "Accepted", "Shipped","On the Way", "Deliverd", "Canceled", "Returned", "Refunded"], default:"Pending"},
    returnReason:{type:String},
    returnStatus:{type:String, default:"Pending", enum:["Pending", "Processed", "Rejected"]},
    cancellationReason:{type:String},
    items:[orderItemSchema],
    shippingAddress:{type:addressSchema, required:true},
    billingAddress:{type:addressSchema, required:true},
    subtotal:{type:Number, reqiured:true},
    tax:{type:Number, reqiured:true},
    discount:{type:Number, reqiured:true},
    shippingCharge:{type:Number, reqiured:true},
    total:{type:Number, reqiured:true},


}, {timestamps:true})

export  const Order = mongoose.model("Order", orderSchema)