import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductForEdit, updateProduct } from "../../redux/slices/productsSlice";
import { toast } from "sonner";
import { deleteImage, uploadImage } from "../../redux/slices/uploadSlice";
import { resetUpload } from "../../redux/slices/uploadSlice";
import { XMarkIcon } from "@heroicons/react/24/solid";

const EditProductPage = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { selectedProduct, loading, error } = useSelector((state) => state.products);
  const { uploading } = useSelector((state) => state.upload);

  //Yeh state form ke saare inputs ka data hold karega. Form submit hone pe yahi data send hoga.
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    countInStock: "",
    sku: "",
    category: "",
    brand: "",
    sizes: [],
    colors: [],
    collections: "",
    material: "",
    gender: "",
    images: [],
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchProductForEdit(id))
        .unwrap()
        .catch(() => {
          //toast.error(err.message || "Not authorized",{duration:1500});
          navigate("/404", { replace: true });
        });
    }
  }, [dispatch, id, navigate]);

  useEffect(() => {
    if (selectedProduct) {
      setProductData(selectedProduct);
    }
  }, [selectedProduct])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (productData.images.length >= 4) {
    toast.error("You can upload a maximum of 4 images per product.", { duration: 2000 });
    return;
  }

    try {
      const result = await dispatch(uploadImage({ productId: id, file })).unwrap();
      setProductData((prevData) => ({
        ...prevData,
        images: [...prevData.images, result],
      }));
      dispatch(resetUpload());
    } catch {
      toast.error("Image upload failed", { duration: 1000 });
    }
  };


  // Delete
  const handleDeleteImage = async (publicId) => {

    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await dispatch(deleteImage({ productId: id, publicId })).unwrap();

      setProductData((prevData) => ({
        ...prevData,
        images: prevData.images.filter((img) => img.publicId !== publicId),
      }));

      toast.success("Image deleted successfully", { duration: 1000 });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image", { duration: 1500 });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log(productData);
    
    if (productData.images.length < 1) {
      toast.error("At least one product image is required", { duration: 1500 });
      return;
    }
    try {
      await dispatch(updateProduct({ id, productData })).unwrap();
      toast.success("Product updated successfully!", { duration: 1000 });
      navigate("/admin/allProducts")
    } catch {
      // Display a more specific error message from the backend if available
      toast.error("Failed to update Product.", { duration: 2000 });
    }
  }

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center">Error: {error}</p>;

  return (
    <div className="max-w-full mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 "
            rows={4}
            required
          ></textarea>
        </div>

        {/* Price*/}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Price (INR)</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* discount Price*/}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Discount Price (INR)</label>
          <input
            type="number"
            name="discountPrice"
            value={productData.discountPrice || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Count in stock */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Count in Stock</label>
          <input
            type="number"
            name="countInStock"
            value={productData.countInStock}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Sku */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Sku</label>
          <input
            type="text"
            name="sku"
            value={productData.sku}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Sizes */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Sizes (comma-separated)</label>
          <input
            type="text"
            name="sizes"
            value={productData.sizes.join(",")}
            onChange={(e) => setProductData({
              ...productData,
              sizes: e.target.value.split(",").map((size) => size.trim()),
            })}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Colors */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Colors (comma-separated)</label>
          <input
            type="text"
            name="colors"
            value={productData.colors.join(",")}
            onChange={(e) => setProductData({
              ...productData,
              colors: e.target.value.split(",").map((color) => color.trim()),
            })}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Image upload */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Upload Image</label>
          <input type="file"
            onChange={handleImageUpload}
            disabled={productData.images.length >= 4}
          />
          {uploading && <p>Uploading Image...</p>}

          <div className="flex gap-4 mt-4 flex-wrap">
            {productData.images.map((image, index) => (
              <div key={index} className="relative group">
                {/* Delete button */}
                {productData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.publicId)}
                    className="absolute -top-2 -right-2 bg-white text-red-500 border border-red-300 rounded-full p-1 shadow-sm active:scale-90 hover:bg-red-500 hover:text-white transition duration-200"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}

                {/* Image */}
                <img
                  src={image.url}
                  alt={image.altText || "Product Image"}
                  className="w-20 h-20 object-cover rounded-md shadow-md"
                />
              </div>
            ))}
          </div>
        </div>


        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
