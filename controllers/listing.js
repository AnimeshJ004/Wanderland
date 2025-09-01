const listing = require("../models/listing");
const wrapAsync = require("../Utils/WrapAsync");

//Index Route Callback
module.exports.index = async (req,res)=>{
   const alllisting = await listing.find({});
   res.render("listing/index.ejs" , { listings: alllisting });
}

//New Route Callback
module.exports.NewList = (req,res)=>{
    res.render("listing/new.ejs")
}

//Show Route Callback
module.exports.ShowList = wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listingItem = await listing.findById(id)
    .populate("reviews")
    .populate("owner")
    .populate({path: "reviews", populate: { path: "author" }});
    if(!listingItem){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    console.log(listingItem);
    res.render("listing/show.ejs",{listing: listingItem});
})

//Create Route Callback
module.exports.CreateList = wrapAsync(async (req,res,next)=>{
      if(!req.file){
            req.flash("error", "Please Upload image to create a new list!");
            return res.redirect("/listings/new");
        }
        let url = req.file.path;
        let filename = req.file.filename;
        const newlisting = new listing(req.body.listing);
        newlisting.owner = req.user._id;
        newlisting.image = {url, filename};
        await newlisting.save();
      
        req.flash("success", "New listing created successfully!");
        res.redirect("/listings")
})

//Edit Route Callback
module.exports.EditList = wrapAsync(async (req, res) => {  
    const { id } = req.params;
    const listingID = await listing.findById(id); // make sure this exists
    if(!listingID){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    let originalimageurl = listingID.image.url;
    originalimageurl = originalimageurl.replace("/upload", "/upload/w_250");
    req.flash("success", "Edit the listing details below.");
    res.render("listing/edit.ejs", { listing: listingID , originalimageurl});// pass listing to EJS
})

//Update Route Callback
module.exports.UpdateList = wrapAsync(async (req, res) => {
    const { id } = req.params;
    let updatedlisting = await listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== 'undefined'){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedlisting.image = {url, filename};
        await updatedlisting.save(); 
    }
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
})

//Delete Route Callback
module.exports.DeleteList = wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedlisting = await listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings"); 
})