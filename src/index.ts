import express,{Request,Response} from "express";
import dotenv from 'dotenv';
import routes from './routes/index.js';
import morgan from "morgan";
import {connectDB} from "./config/MongoDB.js"
import { initiateAdmin } from "./helpers/initiateAdmin.js";
import cluster from "cluster";
import os from 'os';
import cors from 'cors';



dotenv.config();

const numCPUs = os.cpus().length
const app = express();
app.use(cors()); // allow all origins by default

const PORT = parseInt(process.env.PORT || "3000", 10);
const mongoURI = process.env.mongoURI || "";

if(cluster.isPrimary){
    console.log(`Primary process ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers...`);

  for(let i=0;i<numCPUs;i++){
    cluster.fork()
  }

  cluster.on('exit',(worker,code,signal)=>{
    console.log(`Worker ${worker.process.pid} died. Forking a new one`)
    cluster.fork()
  })
}else{

    
    initiateAdmin()
    connectDB(mongoURI).then(()=>{
        console.log("mongggooooooooooooooooooooooooooooooooooooooooooooooo",mongoURI)
    app.use(morgan("dev"));
    app.use(express.json());
    app.get('/',(req:Request,res:Response)=>{
        return res.status(200).json({message:"Server is working fine ✅"})
    });
    app.use('/api',routes);
    
    app.listen(PORT,'0.0.0.0',()=>{
        console.log(`Server is listening on http://0.0.0.0:${PORT} or http://54.89.214.1:${PORT}`);
    })
}).catch((error)=>{
    console.error("Failed to start the server due to Database error",error)
});

}




// import express,{Request,Response} from "express";
// import dotenv from 'dotenv';
// import routes from './routes/index.js';
// import morgan from "morgan";
// import {connectDB} from "./config/MongoDB.js"
// import { initiateAdmin } from "./helpers/initiateAdmin.js";

// dotenv.config();

// const app = express();

// const PORT = parseInt(process.env.PORT || "3000", 10);
// const mongoURI = process.env.mongoURI || "";
// initiateAdmin()
// connectDB(mongoURI).then(()=>{
//     console.log("mongggooooooooooooooooooooooooooooooooooooooooooooooo",mongoURI)
//     app.use(morgan("dev"));
//     app.use(express.json());
//     app.get('/',(req:Request,res:Response)=>{
//         return res.status(200).json({message:"Server is working fine ✅"})
//     });
//     app.use('/api',routes);
    
//     app.listen(PORT,'0.0.0.0',()=>{
//         console.log(`Server is listening on http://0.0.0.0:${PORT} or http://54.89.214.1:${PORT}`);
//     })
// }).catch((error)=>{
//     console.error("Failed to start the server due to Database error",error)
// });
