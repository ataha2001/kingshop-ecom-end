import { v2 } from "cloudinary";
import { Product } from "../models/productModel.js";
import slugify from "slugify";
import { parse } from "dotenv";

export default async function productRoutes(fastify, options) {
  // create product
  fastify.post("/api/products", async (request, reply) => {
    try {
      if (request.body.name) {
        request.body.slug = slugify(request.body.name.toLowerCase());
      }
      const product = new Product(request.body);
      await product.save();
      reply
        .code(201)
        .send({
          status: true,
          msg: "Product Created Successfully!",
          data: product,
        });
    } catch (err) {
      reply
        .code(500)
        .send({ status: false, msg: "Somthing went wrong!", err: err });
    }
  });

  // get all products
  // fastify.get('/api/products',async (request,reply)=>{
  //     try {
  //         const products = await Product.find()
  //         reply.code(201).send({status:true, msg:"Products Fetched Successfully!", data: products})
  //     } catch (err) {
  //         reply.code(500).send({status:false, msg:"Somthing went wrong!"})
  //     }
  // })
  // get all products
  fastify.get("/api/products", async (request, reply) => {
    console.log('we are in aPAI');
    
    try {
        const {color, size, brand, category, subcategory, minPrice, maxPrice, 
            status, canPruchaseable, refundable, sortBy, sortOrder="asc", search} = request.query
        
        const filter = {}
        if(color){
            filter['variations.color'] = color
        }    
        if(size){
            filter['variations.size'] = size
        }    
        if(brand){
            filter.brand = brand
        }    
        if(category){
            filter.category = category
        }    
        if(subcategory){
            filter.subcategory = subcategory
        }  
        if(status){
            filter.status = status
        }      
        
        if(typeof canPruchaseable !== 'undefined'){
            filter.canPruchaseable = canPruchaseable === 'true'
        }
        
        if(typeof refundable !== 'undefined'){
            filter.refundable = refundable === 'true'
        }    
        
        // if( minPrice !== 0 || maxPrice !== 0){
        //     filter.sellingPrice={}
        //     if(minPrice){
        //         filter.sellingPrice.$gte = parseFloat(minPrice)
        //     }
        //     if(maxPrice){
        //         filter.sellingPrice.$lte = parseFloat(maxPrice)
        //     }
        // }
        
        if( minPrice !== "0" && minPrice !== undefined  || maxPrice !== "0" && maxPrice !== undefined){
            filter.sellingPrice={}
            if(minPrice){
                filter.sellingPrice.$gte = parseFloat(minPrice)
            }
            if(maxPrice){
                filter.sellingPrice.$lte = parseFloat(maxPrice)
            }
        }
        if(search){
            filter.$or = [
                {name: {$regex: search, $options: 'i'}},
                {description: {$regex: search, $options: 'i'}}
            ]
        }
        
        
        let sortOptions= {}
        if(sortBy === "price-low-to-high"){
            sortOptions.sellingPrice = sortOrder = 1
        }if(sortBy === 'price-high-to-low'){
            sortOptions.sellingPrice = sortOrder = -1
        }
        else if(sortBy === 'newest'){
            sortOptions.createdAt = -1

        }
        console.log('filters', filter);
        
      const products = await Product.find(filter).sort(sortOptions);
    //   const products = await Product.find()
      reply
        .code(201)
        .send({
          status: true,
          msg: "Products Fetched Successfully!",
          data: products,
        });
    } catch (err) {
      reply.code(500).send({ status: false, msg: "Somthing went wrong!",error: err });
    }
  });

  // get a single product by slug
  fastify.get("/api/products/:slug/byslug", async (request, reply) => {
    try {
      const slug = request.params.slug;
      const product = await Product.findOne({ slug: slug }).populate("offer");
      if (!product)
        return reply
          .code(404)
          .send({ status: false, msg: "Product Not Found" });
      reply
        .code(200)
        .send({
          status: true,
          msg: "Product Fetched Successfully!",
          data: product,
        });
    } catch (err) {
      reply.code(500).send({ status: false, msg: "Somthing went wrong!" });
    }
  });

  // get a single product by id
  fastify.get("/api/products/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const product = await Product.findById(id).populate("offer");
      if (!product)
        return reply
          .code(404)
          .send({ status: false, msg: "Product Not Found" });
      reply
        .code(200)
        .send({
          status: true,
          msg: "Product Fetched Successfully!",
          data: product,
        });
    } catch (err) {
      reply.code(500).send({ status: false, msg: "Somthing went wrong!" });
    }
  });

  // update a single product by id
  fastify.put("/api/products/:id", async (request, reply) => {
    try {
      if (request.body.name) {
        request.body.slug = slugify(request.body.name.toLowerCase());
      }
      const { id } = request.params;
      const product = await Product.findByIdAndUpdate(id, request.body, {
        new: true,
      });
      if (!product)
        return reply
          .code(404)
          .send({ status: false, msg: "Product Not Found" });
      reply
        .code(200)
        .send({
          status: true,
          msg: "Product Updated Successfully!",
          data: product,
        });
    } catch (err) {
      reply.code(500).send({ status: false, msg: "Somthing went wrong!" });
    }
  });

  // delete a single product by id
  fastify.delete("/api/products/:id", async (request, reply) => {
    try {
      // const id = request.params
      const { id } = request.params;
      const product = await Product.findByIdAndDelete(id);
      if (!product)
        return reply
          .code(404)
          .send({ status: false, msg: "Product Not Found" });
      reply
        .code(200)
        .send({
          status: true,
          msg: "Product Updated Successfully!",
          data: product,
        });
    } catch (err) {
      reply
        .code(500)
        .send({ status: false, msg: "Somthing went wrong!", err: err });
    }
  });

  // check availablity for spacific variant (by color or size)
  fastify.get("/api/products/:id/availablity", async (request, reply) => {
    try {
      const { id } = request.params;
      const { color, size } = request.query;
      const product = await Product.findById(id).populate("variants");
      if (!product)
        return reply
          .code(404)
          .send({ status: false, msg: "Product Not Found" });
      const variations = product.variants.find(
        (item) => item.color === color && item.size === size
      );
      if (!variations)
        return reply
          .code(404)
          .send({ status: false, msg: "variations Not Found" });

      reply
        .code(200)
        .send({
          status: true,
          msg: "Product Available!",
          sku: variations.sku,
          quantityAvailable: variations.quantityAvailable,
        });
    } catch (err) {
      reply
        .code(500)
        .send({ status: false, msg: "Somthing went wrong!", err: err });
    }
  });

  // check if any variation has low stock (less than 5)

  // videos CRUD
  fastify.post("/api/products/:id/videos", async (request, reply) => {
    const { id } = request.params;
    const videoData = request.body;

    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { $push: { videos: videoData.videos } },
        { new: true }
      );
      if (!product) {
        return reply
          .code(404)
          .send({ status: false, error: "Product not found" });
      }
      reply.send(product);
    } catch (error) {
      reply.code(500).send({ status: false, error: error.message });
    }
  });

  fastify.get("/api/products/:id/videos", async (request, reply) => {
    const { id } = request.params;
    try {
      const product = await Product.findById(id).select("videos");
      if (!product) {
        return reply
          .code(404)
          .send({ status: false, error: "Product not found" });
      }
      reply.send({ status: true, data: product.videos });
    } catch (error) {
      reply.code(500).send({ status: false, error: error.message });
    }
  });

  fastify.delete(
    "/api/products/:id/videos/:videoId",
    async (request, reply) => {
      const { id, videoId } = request.params;

      try {
        const product = await Product.findById(id);
        if (!product) {
          return reply
            .code(404)
            .send({ status: false, error: "Product not found" });
        }
        const imageIndex = product.videos.findIndex(
          (video) => video._id.toString() === videoId
        );
        // const video = product.videos.id(videoId)
        if (imageIndex === -1) {
          return reply
            .code(404)
            .send({ status: false, error: "Video not found" });
        }
        // video.remove()
        product.videos.splice(imageIndex, 1);
        await product.save();
        reply.send({ status: true, data: product.videos });
      } catch (error) {
        reply.code(500).send({ status: false, error: error.message });
      }
    }
  );

  fastify.put("/api/products/:id/videos/:videoId", async (request, reply) => {
    const { id, videoId } = request.params;
    const videoData = request.body;

    try {
      const product = await Product.findById(id);
      if (!product) {
        return reply
          .code(404)
          .send({ status: false, error: "Product not found" });
      }
      const video = product.videos.id(videoId);
      if (!video) {
        return reply
          .code(404)
          .send({ status: false, error: "Video not found" });
      }
      Object.assign(video, videoData);
      await product.save();
      reply.send(product);
    } catch (error) {
      reply.code(500).send({ status: false, error: error.message });
    }
  });

  // images add, delete
  fastify.post("/api/products/:id/images", async (request, reply) => {
    const { id } = request.params;
    const { imageUrl, publicId } = request.body;
    console.log("publicId", publicId);

    // if(typeof imageUrl === 'string'){
    //     imageUrl = imageUrl.toString()
    // };
    if (!imageUrl) {
      return;
      reply.code(400).send({ status: false, error: "Invalid image URL" });
    }
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { $push: { images: { url: imageUrl, id: publicId } } },
        { new: true }
      );
      if (!product) {
        return reply
          .code(404)
          .send({ status: false, error: "Product not found" });
      }
      // await product.save()
      reply.send({
        status: true,
        message: "Image Add Successfully...",
        product,
      });
    } catch (error) {
      reply.code(500).send({ status: false, error: error.message });
    }
  });

  fastify.delete(
    "/api/products/:productId/images/:imageId",
    async (request, reply) => {
      const { productId, imageId } = request.params;
      console.log("productId", productId);
      console.log("imageId", imageId);

      try {
        const product = await Product.findById(productId);
        if (!product) {
          return reply
            .code(404)
            .send({ status: false, error: "Product not found" });
        }
        const imageIndex = product.images.findIndex(
          (image) => image._id.toString() === imageId
        );
        console.log("imageIndex", imageIndex);

        if (imageIndex === -1) {
          return reply
            .code(404)
            .send({ status: false, error: "Image not found" });
        }
        const public_id = product.images[imageIndex].id;

        // remove image from cloudinary
        const cloudinaryResult = await v2.uploader.destroy(
          public_id,
          (error, result) => {
            if (error) {
              throw new Error(error.message);
            }
            return result;
          }
        );
        if (cloudinaryResult.result !== "ok") {
          return reply
            .code(500)
            .send({
              status: false,
              error: "Faild to delete image from cloudinary....",
            });
        }
        // remove images from product
        product.images.splice(imageIndex, 1);
        await product.save();
        reply.send({
          status: true,
          message: "Imageremoved Successfully..",
          product,
        });
      } catch (error) {
        reply.code(500).send({ status: false, error: error.message });
      }
    }
  );
  // Variations CRUD

  fastify.post(`/api/products/:id/variations`, async (request, reply) => {
    const { id } = request.params;

    const variationData = request.body;
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { $push: { variations: variationData } },
        { bew: true }
      );
      if (!product) {
        return reply
          .code(404)
          .send({ status: false, error: "Product not found" });
      }
      reply.send({
        status: true,
        message: "Variations Added Successfully...",
        product,
      });
    } catch (error) {
      reply.code(500).send({ status: false, error: error.message });
    }
  });

  fastify.get(`/api/products/:id/variations`, async (request, reply) => {
    const { id } = request.params;

    try {
      const product = await Product.findById(id);
      if (!product) {
        return reply
          .code(404)
          .send({ status: false, error: "Product not found" });
      }
      reply.send({
        status: true,
        message: "Variations Fetched Successfully...",
        product,
      });
    } catch (error) {
      reply.code(500).send({ status: false, error: error.message });
    }
  });

  fastify.delete(
    "/api/products/:id/variations/:variationId",
    async (request, reply) => {
      const { id, variationId } = request.params;

      try {
        const product = await Product.findById(id);
        if (!product) {
          return reply
            .code(404)
            .send({ status: false, error: "Product not found" });
        }
        const variationIndex = product.variations.findIndex(
          (variation) => variation._id.toString() === variationId
        );
        console.log("variationIndex", variationIndex);

        if (variationIndex === -1) {
          return reply
            .code(404)
            .send({ status: false, error: "variation not found" });
        }
        product.variations.splice(variationIndex, 1);
        await product.save();
        reply.send({
          status: true,
          message: "Variation removed Successfully..",
          product,
        });
      } catch (error) {
        reply.code(500).send({ status: false, error: error.message });
      }
    }
  );

  fastify.put(
    "/api/products/:id/variations/:variationId",
    async (request, reply) => {
      const { id, variationId } = request.params;
      const variationData = request.body;

      try {
        const product = await Product.findById(id);
        if (!product) {
          return reply
            .code(404)
            .send({ status: false, error: "Product not found" });
        }
        const variation = product.variations.id(variationId);
        if (!variation) {
          return reply
            .code(404)
            .send({ status: false, error: "Variation not found" });
        }
        Object.assign(variation, variationData);
        await product.save();
        reply.send(product);
      } catch (error) {
        reply.code(500).send({ status: false, error: error.message });
      }
    }
  );

  fastify.get("/api/products/flash-sales", async (request, reply) => {
    try {
      const currentDate = new Date();
      const flashSaleProducts = await Product.find({
        "offer.flashSale": true,
        // 'offer.statrDate':{$lte: currentDate },
        // 'offer.endDate':{$gte: currentDate },
      });
      reply.send({ status: true, data: flashSaleProducts });
    } catch (error) {
      reply
        .code(500)
        .send({ status: false, error: "Failed to fetch flash sales" });
    }
  });
}
