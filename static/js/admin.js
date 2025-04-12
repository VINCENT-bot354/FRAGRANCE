document.addEventListener('DOMContentLoaded', function() {
    // Product type and category handling
    const typeSelect = document.getElementById('product-type');
    const categorySelect = document.getElementById('product-category');
    
    if (typeSelect && categorySelect) {
        typeSelect.addEventListener('change', function() {
            updateCategories();
        });
        
        // Update categories on load
        updateCategories();
        
        function updateCategories() {
            const productType = typeSelect.value;
            
            // Clear current categories
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            
            if (productType) {
                // Get categories for selected type from data attribute
                const categoriesData = categorySelect.dataset.categories;
                if (categoriesData) {
                    try {
                        const categories = JSON.parse(categoriesData);
                        const typeCategories = categories[productType] || [];
                        
                        typeCategories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category;
                            option.textContent = category;
                            categorySelect.appendChild(option);
                        });
                    } catch (error) {
                        console.error('Error parsing categories data:', error);
                    }
                }
            }
        }
    }
    
    // Image preview for add/edit product
    const imageInput = document.getElementById('product-images');
    const imagePreviewContainer = document.getElementById('image-preview');
    
    if (imageInput && imagePreviewContainer) {
        imageInput.addEventListener('change', function() {
            // Clear previews
            imagePreviewContainer.innerHTML = '';
            
            if (this.files) {
                Array.from(this.files).forEach(file => {
                    if (!file.type.startsWith('image/')) return;
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const previewWrapper = document.createElement('div');
                        previewWrapper.className = 'product-image-preview';
                        
                        const image = document.createElement('img');
                        image.src = e.target.result;
                        image.alt = 'Product preview';
                        
                        previewWrapper.appendChild(image);
                        imagePreviewContainer.appendChild(previewWrapper);
                    };
                    
                    reader.readAsDataURL(file);
                });
            }
        });
    }
    
    // Product image deletion
    const imageDeleteButtons = document.querySelectorAll('.image-delete');
    
    if (imageDeleteButtons.length > 0) {
        imageDeleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (!confirm('Are you sure you want to delete this image?')) {
                    return;
                }
                
                const productId = this.dataset.productId;
                const imageName = this.dataset.imageName;
                const imagePreview = this.parentElement;
                
                fetch('/admin/product/image/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `product_id=${productId}&image_name=${imageName}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Remove the image preview
                        imagePreview.remove();
                    } else {
                        alert('Error deleting image: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to delete image');
                });
            });
        });
    }
    
    // Product edit form
    const editButtons = document.querySelectorAll('.edit-product-btn');
    const editProductForm = document.getElementById('edit-product-form');
    
    if (editButtons.length > 0 && editProductForm) {
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const productName = this.dataset.productName;
                const productType = this.dataset.productType;
                const productCategory = this.dataset.productCategory;
                const productSubcategory = this.dataset.productSubcategory;
                const productBrand = this.dataset.productBrand;
                const productPrice = this.dataset.productPrice;
                const productDescription = this.dataset.productDescription;
                const productColors = this.dataset.productColors;
                const productSizes = this.dataset.productSizes;
                
                // Update form action
                editProductForm.action = `/admin/product/edit/${productId}`;
                
                // Update form fields
                document.getElementById('edit-name').value = productName;
                
                // Set product type (and trigger change event for categories)
                const editTypeSelect = document.getElementById('edit-type');
                editTypeSelect.value = productType;
                
                // Trigger a change event to update categories
                const event = new Event('change');
                editTypeSelect.dispatchEvent(event);
                
                // Set category (after categories are updated)
                setTimeout(() => {
                    const editCategorySelect = document.getElementById('edit-category');
                    if (editCategorySelect) {
                        editCategorySelect.value = productCategory;
                    }
                }, 100);
                
                // Set remaining fields
                document.getElementById('edit-subcategory').value = productSubcategory;
                document.getElementById('edit-brand').value = productBrand;
                document.getElementById('edit-price').value = productPrice;
                document.getElementById('edit-description').value = productDescription;
                document.getElementById('edit-colors').value = productColors;
                document.getElementById('edit-sizes').value = productSizes;
                
                // Load product images
                const editImagesContainer = document.getElementById('edit-images-preview');
                if (editImagesContainer) {
                    // Clear container
                    editImagesContainer.innerHTML = '';
                    
                    // Fetch product images
                    fetch(`/admin/product/images/${productId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.images) {
                            data.images.forEach(image => {
                                const imageWrapper = document.createElement('div');
                                imageWrapper.className = 'product-image-preview';
                                
                                const img = document.createElement('img');
                                img.src = `/data/products/${productId}/${image}`;
                                img.alt = 'Product image';
                                
                                const deleteBtn = document.createElement('span');
                                deleteBtn.className = 'image-delete';
                                deleteBtn.innerHTML = '&times;';
                                deleteBtn.dataset.productId = productId;
                                deleteBtn.dataset.imageName = image;
                                
                                deleteBtn.addEventListener('click', function() {
                                    if (!confirm('Are you sure you want to delete this image?')) {
                                        return;
                                    }
                                    
                                    fetch('/admin/product/image/delete', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                        },
                                        body: `product_id=${productId}&image_name=${image}`
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.success) {
                                            imageWrapper.remove();
                                        } else {
                                            alert('Error deleting image: ' + (data.message || 'Unknown error'));
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error:', error);
                                        alert('Failed to delete image');
                                    });
                                });
                                
                                imageWrapper.appendChild(img);
                                imageWrapper.appendChild(deleteBtn);
                                editImagesContainer.appendChild(imageWrapper);
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching product images:', error);
                    });
                }
                
                // Show the edit modal
                const editModal = new bootstrap.Modal(document.getElementById('edit-product-modal'));
                editModal.show();
            });
        });
    }
    
    // Product delete confirmation
    const deleteButtons = document.querySelectorAll('.delete-product-btn');
    
    if (deleteButtons.length > 0) {
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                    e.preventDefault();
                }
            });
        });
    }
    
    // Type-specific fields on edit form
    const editTypeSelect = document.getElementById('edit-type');
    const editCategorySelect = document.getElementById('edit-category');
    
    if (editTypeSelect && editCategorySelect) {
        editTypeSelect.addEventListener('change', function() {
            updateEditCategories();
        });
        
        function updateEditCategories() {
            const productType = editTypeSelect.value;
            
            // Clear current categories
            editCategorySelect.innerHTML = '<option value="">Select Category</option>';
            
            if (productType) {
                // Get categories for selected type from data attribute
                const categoriesData = editCategorySelect.dataset.categories;
                if (categoriesData) {
                    try {
                        const categories = JSON.parse(categoriesData);
                        const typeCategories = categories[productType] || [];
                        
                        typeCategories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category;
                            option.textContent = category;
                            editCategorySelect.appendChild(option);
                        });
                    } catch (error) {
                        console.error('Error parsing categories data:', error);
                    }
                }
            }
        }
    }
});

// Helper function to fetch product images for editing
function fetchProductImages(productId) {
    return fetch(`/admin/product/images/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch product images');
            }
            return response.json();
        });
}
