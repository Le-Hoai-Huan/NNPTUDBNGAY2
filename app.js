// Global variables
let productsData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = { field: null, order: null };

// Load dữ liệu từ db.json
async function loadData() {
    try {
        const loadingEl = document.getElementById('loading');
        const errorEl = document.getElementById('errorMessage');
        
        loadingEl.classList.remove('d-none');
        errorEl.innerHTML = '';

        const response = await fetch('db.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        productsData = await response.json();
        filteredData = [...productsData];
        
        loadingEl.classList.add('d-none');
        updateDisplay();
        
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        document.getElementById('loading').classList.add('d-none');
        document.getElementById('errorMessage').innerHTML = 
            `<div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle"></i> Lỗi: ${error.message}
            </div>`;
    }
}

// Hàm tìm kiếm - sử dụng onchange
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredData = [...productsData];
    } else {
        filteredData = productsData.filter(product => 
            product.title.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1; // Reset về trang đầu
    updateDisplay();
}

// Xử lý thay đổi số items per page
function handleItemsPerPageChange() {
    const selectEl = document.getElementById('itemsPerPage');
    itemsPerPage = parseInt(selectEl.value);
    currentPage = 1; // Reset về trang đầu
    updateDisplay();
}

// Sắp xếp theo tên
function sortByName(order) {
    currentSort = { field: 'name', order: order };
    
    if (order === 'asc') {
        filteredData.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    } else {
        filteredData.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
    }
    
    updateActiveButton('name', order);
    currentPage = 1;
    updateDisplay();
}

// Sắp xếp theo giá
function sortByPrice(order) {
    currentSort = { field: 'price', order: order };
    
    if (order === 'asc') {
        filteredData.sort((a, b) => a.price - b.price);
    } else {
        filteredData.sort((a, b) => b.price - a.price);
    }
    
    updateActiveButton('price', order);
    currentPage = 1;
    updateDisplay();
}

// Cập nhật button active
function updateActiveButton(field, order) {
    // Remove all active classes
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    const buttons = document.querySelectorAll('.sort-btn');
    buttons.forEach(btn => {
        const btnText = btn.textContent;
        if (field === 'name' && order === 'asc' && btnText.includes('A-Z')) {
            btn.classList.add('active');
        } else if (field === 'name' && order === 'desc' && btnText.includes('Z-A')) {
            btn.classList.add('active');
        } else if (field === 'price' && order === 'asc' && btnText.includes('tăng')) {
            btn.classList.add('active');
        } else if (field === 'price' && order === 'desc' && btnText.includes('giảm')) {
            btn.classList.add('active');
        }
    });
}

// Cập nhật hiển thị
function updateDisplay() {
    displayProducts();
    updatePagination();
    updateStats();
}

// Hiển thị sản phẩm trong bảng
function displayProducts() {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredData.slice(startIndex, endIndex);
    
    if (paginatedProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-3">Không tìm thấy sản phẩm nào</p>
                </td>
            </tr>
        `;
        return;
    }
    
    paginatedProducts.forEach((product, index) => {
        const row = createProductRow(product, startIndex + index + 1);
        tbody.appendChild(row);
    });
}

// Tạo dòng sản phẩm
function createProductRow(product, rowNumber) {
    const tr = document.createElement('tr');
    
    const imageUrl = getSafeImageUrl(product);
    const categoryName = product.category ? product.category.name : 'N/A';
    const description = product.description || 'Không có mô tả';
    const shortDesc = description.length > 80 ? description.substring(0, 80) + '...' : description;
    
    // Determine badge color based on category
    const badgeColors = {
        'Clothes': 'primary',
        'Electronics': 'success',
        'Shoes': 'warning',
        'Furniture': 'info',
        'Miscellaneous': 'secondary'
    };
    const badgeColor = badgeColors[categoryName] || 'secondary';
    
    tr.innerHTML = `
        <td class="text-center"><strong>${rowNumber}</strong></td>
        <td>
            <img src="${imageUrl}" 
                 alt="${product.title}" 
                 class="product-image-thumb"
                 onerror="this.src='https://placehold.co/60x60/667eea/white?text=Error'">
        </td>
        <td><strong>${product.title}</strong></td>
        <td>
            <span class="badge bg-${badgeColor} badge-category">
                ${categoryName}
            </span>
        </td>
        <td><small class="text-muted">${shortDesc}</small></td>
        <td class="price-cell">$${product.price.toLocaleString()}</td>
        <td class="text-muted"><small>#${product.id}</small></td>
    `;
    
    return tr;
}

// Hàm lấy URL hình ảnh an toàn
function getSafeImageUrl(product) {
    let imageUrl = 'https://placehold.co/600x400/667eea/white?text=No+Image';
    
    if (product.images && product.images[0]) {
        const originalUrl = product.images[0];
        
        if (originalUrl.includes('i.imgur.com') || originalUrl.includes('placeimg.com')) {
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
            imageUrl = originalUrl;
        }
    }
    
    return imageUrl;
}

// Cập nhật phân trang
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    // Update showing info
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
    
    document.getElementById('showingFrom').textContent = filteredData.length > 0 ? startIndex : 0;
    document.getElementById('showingTo').textContent = endIndex;
    document.getElementById('totalItems').textContent = filteredData.length;
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
            <i class="bi bi-chevron-left"></i> Trước
        </a>
    `;
    pagination.appendChild(prevLi);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        firstLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(1); return false;">1</a>`;
        pagination.appendChild(firstLi);
        
        if (startPage > 2) {
            const dotsLi = document.createElement('li');
            dotsLi.className = 'page-item disabled';
            dotsLi.innerHTML = `<a class="page-link">...</a>`;
            pagination.appendChild(dotsLi);
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>`;
        pagination.appendChild(pageLi);
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dotsLi = document.createElement('li');
            dotsLi.className = 'page-item disabled';
            dotsLi.innerHTML = `<a class="page-link">...</a>`;
            pagination.appendChild(dotsLi);
        }
        
        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        lastLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>`;
        pagination.appendChild(lastLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
            Sau <i class="bi bi-chevron-right"></i>
        </a>
    `;
    pagination.appendChild(nextLi);
}

// Chuyển trang
function changePage(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    updateDisplay();
    
    // Scroll to top of table
    document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Cập nhật thống kê
function updateStats() {
    document.getElementById('productCount').textContent = filteredData.length;
}

// Tải dữ liệu khi trang load
document.addEventListener('DOMContentLoaded', loadData);
