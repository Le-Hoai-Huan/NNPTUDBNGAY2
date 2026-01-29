let productsData = [];

// Load dữ liệu từ db.json
async function loadData() {
    try {
        const loadingEl = document.getElementById('loading');
        const errorEl = document.getElementById('error-message');
        
        loadingEl.style.display = 'block';
        errorEl.innerHTML = '';

        const response = await fetch('db.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        productsData = await response.json();
        
        loadingEl.style.display = 'none';
        displayProducts(productsData);
        updateStats();
        
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-message').innerHTML = 
            `<div class="error">❌ Lỗi: ${error.message}</div>`;
    }
}

// Hiển thị sản phẩm
function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Không có sản phẩm nào</p>';
        return;
    }

    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// Hàm lấy URL hình ảnh an toàn
function getSafeImageUrl(product) {
    let imageUrl = 'https://placehold.co/600x400/667eea/white?text=No+Image';
    
    if (product.images && product.images[0]) {
        const originalUrl = product.images[0];
        
        // Kiểm tra nếu là imgur hoặc placeimg - thay thế bằng placeholder
        if (originalUrl.includes('i.imgur.com') || originalUrl.includes('placeimg.com')) {
            // Tạo màu ngẫu nhiên dựa trên category
            const colors = {
                'Clothes': '764ba2/white',
                'Electronics': '667eea/white',
                'Shoes': 'f093fb/white',
                'Furniture': '4facfe/white',
                'Miscellaneous': '43e97b/white'
            };
            const categoryName = product.category ? product.category.name : 'Miscellaneous';
            const colorScheme = colors[categoryName] || '667eea/white';
            
            imageUrl = `https://placehold.co/600x400/${colorScheme}?text=${encodeURIComponent(product.title.substring(0, 20))}`;
        } else if (originalUrl.includes('placehold.co')) {
            imageUrl = originalUrl;
        } else {
            // Thử load URL gốc, nếu lỗi sẽ fallback
            imageUrl = originalUrl;
        }
    }
    
    return imageUrl;
}

// Tạo thẻ sản phẩm
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageUrl = getSafeImageUrl(product);
    const categoryName = product.category ? product.category.name : 'Không xác định';
    const createdDate = new Date(product.creationAt).toLocaleDateString('vi-VN');

    card.innerHTML = `
        <img src="${imageUrl}" alt="${product.title}" class="product-image" 
             onerror="this.src='https://placehold.co/600x400/667eea/white?text=Error+Loading'">
        <div class="product-body">
            <span class="product-category">${categoryName}</span>
            <h3 class="product-title">${product.title}</h3>
            <p class="product-description">${product.description || 'Không có mô tả'}</p>
            <div class="product-price">$${product.price.toLocaleString('vi-VN')}</div>
            <div class="product-footer">
                <span>📅 ${createdDate}</span>
            </div>
        </div>
    `;

    return card;
}

// Cập nhật thống kê
function updateStats() {
    const count = productsData.length;
    document.getElementById('product-count').textContent = `${count} sản phẩm`;
}

// Sắp xếp theo giá
function sortByPrice() {
    const sorted = [...productsData].sort((a, b) => a.price - b.price);
    displayProducts(sorted);
}

// Sắp xếp theo tên
function sortByTitle() {
    const sorted = [...productsData].sort((a, b) => 
        a.title.localeCompare(b.title, 'vi')
    );
    displayProducts(sorted);
}

// Tải dữ liệu khi trang load
document.addEventListener('DOMContentLoaded', loadData);
