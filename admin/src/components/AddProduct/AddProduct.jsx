import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {
  const [image, setImage] = useState(null);

  const [productDetails, setProductDetails] = useState({
    name: '',
    image: '',
    category: 'women',
    new_price: '',
    old_price: '',
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const resetFields = () => {
    setProductDetails({
      name: '',
      image: '',
      category: 'women',
      new_price: '',
      old_price: '',
    });
    setImage(null);
  };

  const Add_product = async () => {
    console.log(productDetails); 
    let responseData; 
    let product = productDetails; 
    let formData = new FormData(); 
    formData.append('product', image); 
  
    // Send a POST request to the server
    await fetch('http://localhost:4000/upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData 
    })
      .then((resp) => resp.json()) 
      .then((data) => {
        responseData = data; 
        data.success ? alert("Product Added") : alert("Failed");
      });
  
    if (responseData.success) {
      product.image = responseData.image_url; 
      console.log(product);
  
      await fetch('http://localhost:4000/addproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      })
        .then((resp) => resp.json())
        .then((data) => {
          data.success ? alert("Product Added") : alert("Failed");
          // Reset fields after successful addition
          resetFields();
        });
    }
  };
  
  return (
    <div className='add-product'>
      {/* Product title input field */}
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input
          value={productDetails.name}
          onChange={handleInputChange}
          type='text'
          name='name'
          placeholder='Type Here'
        />
      </div>

      {/* Price and Offer Price fields side by side */}
      <div className="addproduct-prices">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={handleInputChange}
            type='text'
            name='old_price'
            placeholder='Type here'
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={handleInputChange}
            type='text'
            name='new_price'
            placeholder='Type here'
          />
        </div>
      </div>

      {/* Product category selection */}
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={handleInputChange}
          name='category'
          className='add-product-selector'
        >
          <option value="women">Woman</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      {/* Upload area and submit button */}
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className='addproduct-thumbnail-img'
            alt="Upload Area"
          />
        </label>
        <input onChange={imageHandler} type='file' name='image' id='file-input' hidden />
        <button onClick={Add_product} className='addproduct-btn'>ADD</button>
      </div>
    </div>
  );
};

export default AddProduct;
