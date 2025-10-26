const listing = require("../models/listing");
const wrapAsync = require("../util/wrapAsync.js");

//Index Route Callback
module.exports.index = async (req,res)=>{
   const { search } = req.query;
   let query = {};

   if (search) {
       query = {
           $or: [
               { title: { $regex: search, $options: 'i' } },
               { description: { $regex: search, $options: 'i' } },
               { location: { $regex: search, $options: 'i' } },
               { country: { $regex: search, $options: 'i' } }
           ]
       };
   }

   const alllisting = await listing.find(query);
   if (alllisting.length === 0) {
       res.render("listing/index.ejs" , { listings: [] });
   } else {
       res.render("listing/index.ejs" , { listings: alllisting });
   }
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
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
})

//Home Route Callback
module.exports.HomeList = wrapAsync(async (req, res) => {
    const sampleListings = [
        {
            _id: 'sample1',
            title: "Cozy Beachfront Cottage",
            description: "Escape to this charming beachfront cottage for a relaxing getaway.",
            image: { url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
            price: 1500,
            location: "Malibu",
            country: "United States",
        },
        {
            _id: 'sample2',
            title: "Modern Loft in Downtown",
            description: "Stay in the heart of the city in this stylish loft apartment.",
            image: { url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
            price: 1200,
            location: "New York City",
            country: "United States",
        },
        {
            _id: 'sample3',
            title: "Mountain Retreat",
            description: "Unplug and unwind in this peaceful mountain cabin.",
            image: { url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
            price: 1000,
            location: "Aspen",
            country: "United States",
        },
        {
            _id: 'sample4',
            title: "Historic Villa in Tuscany",
            description: "Experience the charm of Tuscany in this beautifully restored villa.",
            image: { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
            price: 2500,
            location: "Florence",
            country: "Italy",
        },
        {
            _id: 'sample5',
            title: "Secluded Treehouse Getaway",
            description: "Live among the treetops in this unique treehouse retreat.",
            image: { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
            price: 800,
            location: "Portland",
            country: "United States",
        },
        {
            _id: 'sample6',
            title: "Beachfront Paradise",
            description: "Step out of your door onto the sandy beach.",
            image: { url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
            price: 2000,
            location: "Cancun",
            country: "Mexico",
        },
    ];

    // Try to fetch from database, fallback to sample listings
    try {
        const allListings = await listing.find({});
        if (allListings.length === 0) {
            res.render("listing/Home.ejs", { listings: sampleListings });
        } else {
            res.render("listing/Home.ejs", { listings: allListings });
        }
    } catch (error) {
        // If database error, use sample listings
        res.render("listing/Home.ejs", { listings: sampleListings });
    }
})
