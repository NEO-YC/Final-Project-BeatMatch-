const express=require('express');
const mongoose=require('mongoose');
const cors = require('cors');
const app=express();
app.use(express.json());
app.use(cors());


const uri = "mongodb+srv://david:Aa123456@cluster0.v1bla6w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
mongoose.connect(uri, clientOptions)
.then(() => console.log('mongoDB connected succesfully ✅'))
.catch(err => console.error('mongoDB faild connection ❌', err));



let UserRouter = require('./Routers/UserRouter');
app.use('/user', UserRouter);






app.listen(3000, () => {
    console.log('Server is running on port 3000 🚀');
}); 