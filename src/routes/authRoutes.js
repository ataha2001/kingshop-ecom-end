import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";


export default async function authRoutes(fastify,options){
    // user register
    fastify.post("/api/register", async (request, reply)=>{
        const {name, email,mobile, password} = request.body
        const userExists = await User.findOne({email})
        if(userExists) return reply.status(400).send({status:false, msg:"User Already Exists!..."})
        const newUser = new User({name, email, mobile, password})    
        newUser.save()
        reply.send({status:true, msg:"User Registered Successfuly...."})
    })

    // user Login

    fastify.post("/api/login", async (request, reply)=>{
        const {email, password} = request.body
        const user = await User.findOne({email})
        if(!user) return reply.status(400).send({status:false, msg:"Invalid Email or Password!..."})
        const isMatch = await user.comparePassword(password)
        if(!isMatch) return reply.status(400).send({status:false, msg:"Invalid Email or Password!..."})
        const token = fastify.jwt.sign({userId:user._id, role:user?.role})
        reply.send({status:true, msg:"User Login Successfuly....", token, role:user.role})
    })

    // Forgot password

    fastify.post("/api/forgot-password", async (request, reply)=>{
        const {email} = request.body
        const user = await User.findOne({email})
        if(!user) return reply.status(400).send({status:false, msg:"Invalid Email!..."})
        const resetToken = await user.createPasswordResetToken()
        await user.save({validateBeforeSave})
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`
        reply.status(200).send({status:true, msg:`Password Reset Tokern sent. Please visit:${resetUrl}`})
    })

     // Reset password

     fastify.post("/api/reset-password/:token", async (request, reply)=>{
        const {token} = request.params
        const {password} = request.body
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        const user = await User.findOne({
            resetPasswordToken:hashedToken,resetPasswordExpires:{$gt:Date.now()}
        })
        if(!user) return reply.status(400).send({status:false, msg:"Token is invalid or Expired!..."})
        user.password = password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({validateBeforeSave})
        reply.status(200).send({status:true, msg:`Password Reset Successfuly!....`})
    })

    // get all users ( for admin only so we need middleware)
    fastify.get("/api/users", async(request,reply)=>{
        const users = await User.find().select("-password")
        reply.send({status:true, msg:"Users Found", users:users})
    })

    //get user by id

    fastify.get("/api/user",{preValidation: [fastify.authenticate]}, async (request, reply)=>{
        // console.log('we are in put api users');
       
        const id  = request.user?.userId
        const user = await User.findById(id).select("-password")
        if(!user) return reply.status(400).send({status:false, msg:"User Not Found"})
            // console.log('user',user);
        reply.status(200).send({status:true, msg:"User Found", user:user})
    })

    //update user 

    fastify.put("/api/users",{preValidation: [fastify.authenticate]},  async (request, reply)=>{
      
        try {
            const id  = request.user?.userId
          
        const user = await User.findByIdAndUpdate(id, request.body, {new:true})
        if(!user) return reply.status(400).send({status:false, msg:"User Not Found"})
            
        reply.status(200).send({status:true, msg:"User Found", user:user})
        } catch (error) {
            
        }
        
    })
   
    // delete user (for admin only)
    fastify.delete("/api/users/:id", async (request, reply)=>{
        const id = request.params.id
        const user = await User.findById(id)
        if(!user) return reply.status(400).send({status:false, msg:"User Not Found"})
        reply.status(200).send({status:true, msg:"User Deleted Successuly!..."})
    })

    // change password

    fastify.put(`/api/user/change-password`,{preValidation: [fastify.authenticate]}, async (request,reply)=>{
        const {oldPassword, newPassword, confirmPassword } = request.body
        const id  = request.user?.userId
        try {
            const user = await User.findById(id)
            if(!user){
                return reply.code(404).send({status:false, msg: "User Not Found"})
            }
            console.log(user);
            
            const isMatch = await user.comparePassword(oldPassword)
            console.log('isMatch',isMatch);
            if(!isMatch){
                return reply.code(400).send({status:false, msg: "Old Password not correct.."})
            }
            
            if(newPassword !== confirmPassword){
                return reply.code(400).send({status:false, msg: "new Password & confirm password not match.."})
            }

            user.password = await bcrypt.hash(newPassword, 10)
            // user.password = newPassword
            await user.save()
            reply.code(200).send({status:true, msg: "Password Changed Successfully.."})
        } catch (error) {
            reply.code(500).send({status:false, msg: "somthing went wrong..", error:error})
        }
    })
}