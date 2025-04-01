import mongoose, { Schema  } from "mongoose";

const variationSchema = new Schema({
    color: {type:String},
    size: {type:String},
    // price: {type:Number, required:true},
    sku: {type:String, required:true},
    // sku: { type: String, sparse: true, unique: true },
    quantity: {type:Number, required:true},
})
const offerSchema = new Schema({
    statrDate: {type:Date, required: true},
    endDate: {type:Date, required: true},
    discountPercentage: {type:Number, required:true},
    flashSale:{type:Boolean, required:true}
})

const seoSchema = new Schema({
    title: {type:String},
    description:{type:String},
    metaKeyword:{type:String},
    image: {url:String, id:String },
    // image:{type:String}
})

const shippingReturnSchema = new Schema({
    shippingType:{type:String, enum:["Free", "Flat Rate"], rewuired:true},
    shippingCost:{type:Number},
    isQuantityMultiply:{type: Boolean, required: true},
    shippingAndReturnPolicy:{type: String}
})

const videosSchema = new Schema({
    provider:{type:String, required:true},
    link:{type:String, required:true},
})

const productSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true,unique:true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    brand: { type: String, required: true },
    barcode: { type: String, required: true },
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    tax: { type: Number, required: true },
    brand: { type: String, required: true },
    status: { type: String, enum:["Active", "InActive"], required:true },
    canPurchase: { type: Boolean, required:true },
    showStockOut: { type: Boolean, required:true },
    refundable: { type: Boolean, required:true },
    maxPurchaseQty: { type: Number, required:true },
    lowStockQty: { type: Number, required:true },
    unit: { type: String, required:true },
    weight: { type: Number },
    tags: { type: String },
    description: { type: String },
    // images: { type: [String] },
    images: [{url:String, id:String }],
    videos: [videosSchema ],
    offer: offerSchema,
    variations: [variationSchema],
    seo: seoSchema,
    shippingReturn :shippingReturnSchema,
    
  },{timestamps:true});

//   export const Product = models?.Product || model('Product', productSchema)
  export  const Product = mongoose.model("Product", productSchema)