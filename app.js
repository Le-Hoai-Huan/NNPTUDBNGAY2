// Biến toàn cục
let postsData = [];
let commentsData = [];
let selectedPostId = null;
let editingPostId = null;
let editingCommentId = null;

// Load dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// Load dữ liệu từ db.json
async function loadData() {
    try {
        const response = await fetch('db.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        postsData = data.posts || [];
        commentsData = data.comments || [];
        
        displayPosts();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Lỗi khi tải dữ liệu: ' + error.message);
    }
}

// Lấy ID tiếp theo
function getNextId(dataArray) {
    if (dataArray.length === 0) return "1";
    const maxId = Math.max(...dataArray.map(item => parseInt(item.id)));
    return String(maxId + 1);
}

// ========== POSTS CRUD ==========

// Hiển thị danh sách posts
function displayPosts() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    
    postsData.forEach(post => {
        const row = document.createElement('tr');
        if (post.isDeleted) {
            row.classList.add('deleted-item');
        }
        
        const commentCount = commentsData.filter(c => c.postId === post.id && !c.isDeleted).length;
        const statusBadge = post.isDeleted ? 
            '<span class="badge bg-danger">Đã xóa</span>' : 
            '<span class="badge bg-success">Hoạt động</span>';
        
        row.innerHTML = `
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="showComments('${post.id}')">
                    <i class="bi bi-chat-dots"></i> ${commentCount}
                </button>
            </td>
            <td>${statusBadge}</td>
            <td>
                ${post.isDeleted ? 
                    `<button class="btn btn-sm btn-success" onclick="restorePost('${post.id}')" title="Khôi phục">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button class="btn btn-sm btn-dark" onclick="hardDeletePost('${post.id}')" title="Xóa vĩnh viễn">
                        <i class="bi bi-trash-fill"></i>
                    </button>` :
                    `<button class="btn btn-sm btn-primary" onclick="editPost('${post.id}')" title="Sửa">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="deletePost('${post.id}')" title="Xóa mềm">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hardDeletePost('${post.id}')" title="Xóa vĩnh viễn">
                        <i class="bi bi-trash-fill"></i>
                    </button>`
                }
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Lưu post (thêm mới hoặc cập nhật)
function Save() {
    const id = document.getElementById('id_txt').value;
    const title = document.getElementById('title_txt').value.trim();
    const views = parseInt(document.getElementById('views_txt').value) || 0;
    
    if (!title) {
        alert('Vui lòng nhập tiêu đề!');
        return;
    }
    
    if (editingPostId) {
        // Cập nhật post
        const postIndex = postsData.findIndex(p => p.id === editingPostId);
        if (postIndex !== -1) {
            postsData[postIndex].title = title;
            postsData[postIndex].views = views;
        }
        editingPostId = null;
    } else {
        // Thêm post mới
        const newPost = {
            id: getNextId(postsData),
            title: title,
            views: views,
            isDeleted: false
        };
        postsData.push(newPost);
    }
    
    clearPostForm();
    displayPosts();
}

// Sửa post
function editPost(id) {
    const post = postsData.find(p => p.id === id);
    if (!post) return;
    
    document.getElementById('id_txt').value = post.id;
    document.getElementById('title_txt').value = post.title;
    document.getElementById('views_txt').value = post.views;
    document.getElementById('form-title').textContent = 'Sửa Post';
    editingPostId = id;
}

// Xóa mềm post
function deletePost(id) {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    
    const postIndex = postsData.findIndex(p => p.id === id);
    if (postIndex !== -1) {
        postsData[postIndex].isDeleted = true;
        displayPosts();
    }
}

// Khôi phục post
function restorePost(id) {
    const postIndex = postsData.findIndex(p => p.id === id);
    if (postIndex !== -1) {
        postsData[postIndex].isDeleted = false;
        displayPosts();
    }
}

// Xóa cứng post
function hardDeletePost(id) {
    if (!confirm('Bạn có chắc muốn XÓA VĨNH VIỄN bài viết này? Hành động này không thể hoàn tác!')) return;
    
    const postIndex = postsData.findIndex(p => p.id === id);
    if (postIndex !== -1) {
        // Xóa tất cả comments của post này
        commentsData = commentsData.filter(c => c.postId !== id);
        // Xóa post khỏi mảng
        postsData.splice(postIndex, 1);
        displayPosts();
    }
}

// Xóa form post
function clearPostForm() {
    document.getElementById('id_txt').value = '';
    document.getElementById('title_txt').value = '';
    document.getElementById('views_txt').value = '0';
    document.getElementById('form-title').textContent = 'Thêm/Sửa Post';
    editingPostId = null;
}

// ========== COMMENTS CRUD ==========

// Hiển thị comments của post
function showComments(postId) {
    selectedPostId = postId;
    const post = postsData.find(p => p.id === postId);
    
    document.getElementById('posts-section').classList.add('d-none');
    document.getElementById('comments-section').classList.remove('d-none');
    document.getElementById('current-post-title').textContent = post ? post.title : '';
    
    displayComments();
}

// Quay lại danh sách posts
function backToPosts() {
    selectedPostId = null;
    editingCommentId = null;
    clearCommentForm();
    document.getElementById('comments-section').classList.add('d-none');
    document.getElementById('posts-section').classList.remove('d-none');
}

// Hiển thị danh sách comments
function displayComments() {
    const tbody = document.getElementById('comments-table-body');
    tbody.innerHTML = '';
    
    const postComments = commentsData.filter(c => c.postId === selectedPostId);
    
    if (postComments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Chưa có comment nào</td></tr>';
        return;
    }
    
    postComments.forEach(comment => {
        const row = document.createElement('tr');
        if (comment.isDeleted) {
            row.classList.add('deleted-item');
        }
        
        const statusBadge = comment.isDeleted ? 
            '<span class="badge bg-danger">Đã xóa</span>' : 
            '<span class="badge bg-success">Hoạt động</span>';
        
        row.innerHTML = `
            <td>${comment.id}</td>
            <td>${comment.text}</td>
            <td>${statusBadge}</td>
            <td>
                ${comment.isDeleted ? 
                    `<button class="btn btn-sm btn-success" onclick="restoreComment('${comment.id}')" title="Khôi phục">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button class="btn btn-sm btn-dark" onclick="hardDeleteComment('${comment.id}')" title="Xóa vĩnh viễn">
                        <i class="bi bi-trash-fill"></i>
                    </button>` :
                    `<button class="btn btn-sm btn-primary" onclick="editComment('${comment.id}')" title="Sửa">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="deleteComment('${comment.id}')" title="Xóa mềm">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hardDeleteComment('${comment.id}')" title="Xóa vĩnh viễn">
                        <i class="bi bi-trash-fill"></i>
                    </button>`
                }
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Lưu comment (thêm mới hoặc cập nhật)
function SaveComment() {
    const text = document.getElementById('comment_text_txt').value.trim();
    
    if (!text) {
        alert('Vui lòng nhập nội dung comment!');
        return;
    }
    
    if (editingCommentId) {
        // Cập nhật comment
        const commentIndex = commentsData.findIndex(c => c.id === editingCommentId);
        if (commentIndex !== -1) {
            commentsData[commentIndex].text = text;
        }
        editingCommentId = null;
    } else {
        // Thêm comment mới
        const newComment = {
            id: getNextId(commentsData),
            text: text,
            postId: selectedPostId,
            isDeleted: false
        };
        commentsData.push(newComment);
    }
    
    clearCommentForm();
    displayComments();
}

// Sửa comment
function editComment(id) {
    const comment = commentsData.find(c => c.id === id);
    if (!comment) return;
    
    document.getElementById('comment_id_txt').value = comment.id;
    document.getElementById('comment_text_txt').value = comment.text;
    document.getElementById('comment-form-title').textContent = 'Sửa Comment';
    editingCommentId = id;
}

// Xóa mềm comment
function deleteComment(id) {
    if (!confirm('Bạn có chắc muốn xóa comment này?')) return;
    
    const commentIndex = commentsData.findIndex(c => c.id === id);
    if (commentIndex !== -1) {
        commentsData[commentIndex].isDeleted = true;
        displayComments();
    }
}

// Khôi phục comment
function restoreComment(id) {
    const commentIndex = commentsData.findIndex(c => c.id === id);
    if (commentIndex !== -1) {
        commentsData[commentIndex].isDeleted = false;
        displayComments();
    }
}

// Xóa cứng comment
function hardDeleteComment(id) {
    if (!confirm('Bạn có chắc muốn XÓA VĨNH VIỄN comment này? Hành động này không thể hoàn tác!')) return;
    
    const commentIndex = commentsData.findIndex(c => c.id === id);
    if (commentIndex !== -1) {
        commentsData.splice(commentIndex, 1);
        displayComments();
    }
}

// Xóa form comment
function clearCommentForm() {
    document.getElementById('comment_id_txt').value = '';
    document.getElementById('comment_text_txt').value = '';
    document.getElementById('comment-form-title').textContent = 'Thêm/Sửa Comment';
    editingCommentId = null;
}
