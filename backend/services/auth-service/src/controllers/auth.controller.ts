import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { signToken } from "../utils/jwt";
import { registerSchema, loginSchema } from "../schema";

export const registerController=async(req:Request,res:Response)=>{
    try {
        const parsed = registerSchema.safeParse(req.body);

        if(!parsed.success){
            return res.status(400).json({message: parsed.error.issues[0].message, error: parsed.error});
        }

        const {name,email,password} = parsed.data;

        const user=await registerUser(name,email,password);
        const token=signToken({userId:user.id,email:user.email});
        res.status(201).json({user,token});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const loginController=async(req:Request,res:Response)=>{
    try {
        const parsed = loginSchema.safeParse(req.body);

        if(!parsed.success){
            return res.status(400).json({message: parsed.error.issues[0].message, error: parsed.error});
        }

        const {email,password} = parsed.data;

        const user = await loginUser(email,password);
        const token=signToken({userId:user.id,email:user.email});

        res.json({user,token});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Internal server error"});
    }
}