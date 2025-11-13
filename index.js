const express=require('express');
const mongoose=require('mongoose');
const app=express();
app.use(express.json());


const uri = "mongodb+srv://david:Aa123456@cluster0.v1bla6w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
mongoose.connect(uri, clientOptions)
.then(() => console.log('✅'))
.catch(err => console.error('❌', err));



let UserRouter = require('./Routers/UserRouter');
app.use('/user', UserRouter);






app.listen(3000);