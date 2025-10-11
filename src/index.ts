import express,{Request,Response} from "express";
import dotenv from 'dotenv';
import routes from './routes/index.js';
import morgan from "morgan";
import {connectDB} from "./config/MongoDB.js"
import { initiateAdmin } from "./helpers/initiateAdmin.js";

dotenv.config();

const app = express();

const PORT = parseInt(process.env.PORT || "3000", 10);
const mongoURI = process.env.mongoURI || "";
initiateAdmin()
connectDB(mongoURI).then(()=>{
    app.use(morgan("dev"));
    app.use(express.json());
    app.get('/',(req:Request,res:Response)=>{
        return res.status(200).json({message:"Server is working fine ✅"})
    });
    app.use('/api',routes);
    
    app.listen(PORT,'0.0.0.0',()=>{
        console.log(`Server is listening on http://localhost:${PORT}`)
    })
}).catch((error)=>{
    console.error("Failed to start the server due to Database error",error)
});
