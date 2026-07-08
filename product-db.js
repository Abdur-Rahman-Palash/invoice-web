const pool = require('./db');

async function saveProduct(productData) {
  try {
    const query = `
      INSERT INTO products (product_id, product_data, last_modified)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (product_id)
      DO UPDATE SET product_data = EXCLUDED.product_data, last_modified = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await pool.query(query, [productData.id, JSON.stringify(productData)]);
    return result.rows[0];
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

async function saveProducts(products) {
  const savedProducts = [];
  for (const product of products) {
    savedProducts.push(await saveProduct(product));
  }
  return savedProducts;
}

async function getAllProducts() {
  try {
    const query = 'SELECT * FROM products ORDER BY last_modified DESC';
    const result = await pool.query(query);
    return result.rows.map(row => {
      if (row.product_data) {
        if (typeof row.product_data === 'string') {
          try {
            return JSON.parse(row.product_data);
          } catch (parseError) {
            console.warn('Could not parse product_data JSON, returning raw value:', row.product_data);
            return row.product_data;
          }
        }
        return row.product_data;
      }
      return row;
    });
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
}

async function deleteProduct(productId) {
  try {
    const query = 'DELETE FROM products WHERE product_id = $1 RETURNING *';
    const result = await pool.query(query, [productId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

module.exports = {
  saveProduct,
  saveProducts,
  getAllProducts,
  deleteProduct
};
