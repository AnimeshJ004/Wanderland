const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/Wanderlust";

main().then(()=>{
    console.log("Connection Successfull");
}).catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect(MONGO_URL);
}

const intiDB = async ()=>{
   await Listing.deleteMany({});
  initdata.data =  initdata.data.map((obj)=>({...obj,owner:"68afe9fdeff2bddd9dae8df3"}));
   await Listing.insertMany(initdata.data);
   console.log("Data was Saved");
}
intiDB();
