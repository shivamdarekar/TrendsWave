import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { Product } from "../models/product.model.js";

const router = express.Router();

//create new product
//access -> private/admin

router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name, description, price, discountPrice, countInStock, category,
      brand, sizes, colors, collections, material, gender, images, isFeatured,
      isPublished, tags, dimensions, weight, sku
    } = req.body;

    const product = new Product({
      name, description, price, discountPrice, countInStock, category,
      brand, sizes, colors, collections, material, gender, images, isFeatured,
      isPublished, tags, dimensions, weight, sku,
      user: req.user._id, //Reference to admin user who created it
    });

    const createdProduct = await product.save();

    return res.status(201).json(createdProduct);

  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});


//update an existing product using ID
//access private/admin

// router.put("/:id", protect, async (req, res) => {
//     try {
//          const {
//             name, description, price, discountPrice, countInStock, category,
//             brand, sizes, colors, collections, material, gender, images, isFeatured,
//             isPublished, tags, dimensions, weight, sku
//         } = req.body;

//         //find product by ID
//         const product = await Product.findById(req.params.id);

//         if (product) {
//             product.name = name || product.name;
//             product.description = description || product.description;
//             product.price = price || product.price;
//             product.discountPrice = discountPrice || product.discountPrice;
//             product.countInStock = countInStock || product.countInStock;
//             product.category = category || product.category;
//             product.brand = brand || product.brand;
//             product.sizes = sizes || product.sizes;
//             product.colors = colors || product.colors;
//             product.collections = collections || product.collections;
//             product.material = material || product.material;
//             product.gender = gender || product.gender;
//             product.images = images || product.images;
//             product.isFeatured =
//                 isFeatured !== undefined ? isFeatured: product.isFeatured;
//             product.isPublished =
//                 isPublished !==undefined ? isPublished: product.isPublished;
//             product.tags = tags || product.tags;
//             product.dimensions = dimensions || product.dimensions;
//             product.weight = weight || product.weight;
//             product.sku = sku || product.sku;

//             //save updated Product
//             const updatedProduct = await product.save();
//             res.json(updatedProduct)
//         } else {
//             res.status(404).json({ message: "Product not found" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Something went wrong while updatig the product")
//     }
// })

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true } // new: returns updated doc, runValidators ensures schema rules apply
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong while updating the product");
  }
});


//delete product
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    //find product by ID
    const product = await Product.findById(req.params.id);

    if (product) {
      //remove it from database
      await product.deleteOne();
      return res.status(200).json({ message: "Product removed successfully" });
    } else {
      return res.status(404).json({ message: "Product not found" })
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong while deleting the product");
  }
});


//get all products with optional query filters
router.get("/", async (req, res) => {
  try {
    const { collection, size, color, gender, minPrice, maxPrice, sortBy,
      search, category, material, brand, limit
    } = req.query

    let query = {};

    //filter logic
    if (collection && collection.toLocaleLowerCase() !== "all") {
      query.collections = collection;
    }

    if (category && category.toLocaleLowerCase() !== "all") {
      query.category = category;
    }

    if (material) {
      query.material = { $in: material.split(",") };
    }

    if (brand) {
      query.brand = { $in: brand.split(",") };
    }

    if (size) {
      query.sizes = { $in: size.split(",") };
    }

    if (color) {
      query.colors = { $in: color.split(",") }
    }

    if (gender) {
      query.gender = { $in: gender.split(",") }
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

  if (search) {
   const keywords = search.trim().split(" ").filter(word => word);
    query.$and = keywords.map((word) => ({
      $or: [
        { name: { $regex: word, $options: "i" } },
        { description: { $regex: word, $options: "i" } },
         { gender: { $regex: word, $options: "i" } },
      ]
    }));
    };

    //sort logic
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case "priceAsc":
          sort = { price: 1 };
          break;
        
        case "priceDesc":
          sort = { price: -1 };
          break;
        
        case "popularity":
          sort = { rating: -1 };
          break;
        
        default:
          break;
      }
    }

    //fetch products and apply sorting and limit
    let products = await Product.find(query)
      .sort(sort).limit(Number(limit) || 0);
    return res.json(products);

  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong while fetching products using query");
  }
});


//Find best seller product -> product with highest rating
router.get("/best-seller", async (req, res) => {
  try {
    const bestSeller = await Product.findOne().sort({ rating: -1 });

    if (bestSeller) {
      return res.json(bestSeller)
    } else {
      return res.status(404).json({ message: "No best seller found" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).send("Error while finding best seller");
  }
});


//New arrivals -> retrive latest 8 products - created date
router.get("/new-arrivals", async (req, res) => {
  try {
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
    return res.json(newArrivals)
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error while fetching new arrivals");
  }
})


//get a product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      return res.json(product);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});


//Retrieve similar products based on current product gender and category
router.get("/similar/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id)

    if (!product) {
      res.status(404).json({ message: "Product not found" });
    };

    const similarProducts = await Product.find({
      _id: { $ne: id }, //exclude current product ID (not equal to current id)
      gender: product.gender,
      category: product.category,
    }).limit(4);

    return res.json(similarProducts);

  } catch (error) {
    console.error(error);
     return res.status(500).send("Error while finding similar products");
  }
});


export default router;