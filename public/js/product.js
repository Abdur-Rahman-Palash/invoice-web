// Product Module

const Product = {
    currentProduct: null,
    editingProductId: null,

    init() {
        this.renderProducts();
        this.bindEvents();
    },

    bindEvents() {
        // Add product button
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.openAddModal());
        }

        // Product form
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleSaveProduct(e));
        }

        // Cancel product button
        const cancelProductBtn = document.getElementById('cancel-product');
        if (cancelProductBtn) {
            cancelProductBtn.addEventListener('click', () => this.closeModal());
        }

        // Close modal button
        const closeProductModalBtn = document.getElementById('close-product-modal');
        if (closeProductModalBtn) {
            closeProductModalBtn.addEventListener('click', () => this.closeModal());
        }

        // Category filter buttons
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
                categoryBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    },

    renderProducts(category = 'all') {
        const products = Storage.get('products') || [];
        const filtered = category === 'all' ? products : products.filter(p => p.category === category);
        const grid = document.getElementById('products-grid');

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="no-products">No products found. Add your first product!</div>';
            return;
        }

        grid.innerHTML = filtered.map(p => `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p class="category">${p.category}</p>
                <p class="price">$${p.price.toFixed(2)}</p>
                <p class="stock">Stock: ${p.stock}</p>
                <div class="product-actions">
                    <button class="btn btn-sm btn-outline" onclick="Product.editProduct('${p.id}')">Edit</button>
                    <button class="btn btn-sm btn-outline" onclick="Product.deleteProduct('${p.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    },

    openAddModal() {
        this.editingProductId = null;
        document.getElementById('product-modal-title').textContent = 'Add Product';
        document.getElementById('product-form').reset();
        document.getElementById('product-modal').classList.remove('hidden');
    },

    editProduct(productId) {
        const products = Storage.get('products') || [];
        const product = products.find(p => p.id === productId);

        if (product) {
            this.editingProductId = productId;
            document.getElementById('product-modal-title').textContent = 'Edit Product';
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-modal').classList.remove('hidden');
        }
    },

    async handleSaveProduct(e) {
        e.preventDefault();

        const productCode = document.getElementById('product-code').value.trim();
        const name = document.getElementById('product-name').value;
        const category = document.getElementById('product-category').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const stock = parseInt(document.getElementById('product-stock').value);

        // Validate product code uniqueness
        const products = Storage.get('products') || [];
        const existingProductWithCode = products.find(p => p.productCode === productCode && p.id !== this.editingProductId);

        if (existingProductWithCode) {
            alert('Product code already exists. Please use a unique product code.');
            return;
        }

        if (this.editingProductId) {
            // Update existing product
            const index = products.findIndex(p => p.id === this.editingProductId);
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    productCode,
                    name,
                    category,
                    price,
                    stock,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Add new product
            const newProduct = {
                id: `PRD-${Date.now()}`,
                productCode,
                name,
                category,
                price,
                stock,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            products.push(newProduct);
        }

        await Storage.set('products', products);
        this.closeModal();
        this.renderProducts();
        Dashboard.updateStats();
    },

    editProduct(productId) {
        const products = Storage.get('products') || [];
        const product = products.find(p => p.id === productId);

        if (product) {
            this.editingProductId = productId;
            document.getElementById('product-modal-title').textContent = 'Edit Product';
            document.getElementById('product-code').value = product.productCode || '';
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-modal').classList.remove('hidden');
        }
    },

    async deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            const products = Storage.get('products') || [];
            const filtered = products.filter(p => p.id !== productId);
            await Storage.set('products', filtered);
            
            this.renderProducts();
            Dashboard.updateStats();
        }
    },

    filterByCategory(category) {
        this.renderProducts(category);
    },

    closeModal() {
        document.getElementById('product-modal').classList.add('hidden');
        document.getElementById('product-form').reset();
        this.editingProductId = null;
    }
};

window.Product = Product;
