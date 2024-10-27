import React, { useContext } from "react";
import "./CSS/ShopCategory.css";
import { ShopContext } from "../context/ShopContext";
import dropdown_icon from "../components/Assets/dropdown_icon.png";
import Item from "../components/Item/Item";

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);

  // Log categories for debugging
  console.log('All Products:', all_product);
  console.log('Selected Category:', props.category);

  const filteredProducts = all_product.filter(item => {
    console.log('Comparing:', props.category, item.category); // Debugging line
    return props.category === item.category;
  });

  // Log filtered products
  console.log('Filtered Products:', filteredProducts);

  return <div className="shop-category">
    <img className = 'shopcategory-banner' src={props.banner} alt="" />
    <div className="shopcategory-indexSort">
      <p>
        <span>Showing {filteredProducts.length}</span> products
      </p>
      <div className="shopcategory-sort">
        sort by <img src={dropdown_icon} alt="Dropdown Icon" />
      </div>
    </div>
    <div className="shopcategory-products">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((item, i) => (
          <Item
            key={i}
            id={item.id} 
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))
      ) : (
        <p>No products found for this category</p>
      )}
    </div>
    <div className="shopcategory-loadmore">
      Explore More
    </div>
  </div>;
};

export default ShopCategory;
