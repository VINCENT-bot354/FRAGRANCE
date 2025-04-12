document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Handle product thumbnails on product detail page
    const productThumbnails = document.querySelectorAll('.product-thumbnail');
    const productMainImage = document.querySelector('.product-detail-img');
    
    if (productThumbnails.length > 0 && productMainImage) {
        productThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Update main image
                productMainImage.src = this.src;
                
                // Update active state
                productThumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Set first thumbnail as active by default
        productThumbnails[0].classList.add('active');
    }
    
    // Handle size selection
    const sizeOptions = document.querySelectorAll('.size-box');
    if (sizeOptions.length > 0) {
        sizeOptions.forEach(option => {
            option.addEventListener('click', function() {
                sizeOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }
    
    // Handle color selection
    const colorOptions = document.querySelectorAll('.color-circle');
    if (colorOptions.length > 0) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                colorOptions.forEach(opt => opt.style.border = '1px solid var(--border-color)');
                this.style.border = '2px solid var(--text-color)';
            });
        });
    }
    
    // Handle order buttons
    const orderButtons = document.querySelectorAll('.order-btn');
    
    if (orderButtons.length > 0) {
        orderButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const contactMethod = this.dataset.contact;
                const productName = this.dataset.product || '';
                
                switch (contactMethod) {
                    case 'whatsapp':
                        const whatsappNumber = this.dataset.number;
                        // Only add message text if ordering a specific product
                        if (productName) {
                            const whatsappMessage = encodeURIComponent(`Hello, I am interested in ${productName} and would like to discuss more.`);
                            window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
                        } else {
                            window.open(`https://wa.me/${whatsappNumber}`, '_blank');
                        }
                        break;
                        
                    case 'instagram':
                        const instagramUsername = this.dataset.username;
                        window.open(`https://instagram.com/${instagramUsername}`, '_blank');
                        break;
                        
                    case 'phone':
                        const phoneNumber = this.dataset.number;
                        window.location.href = `tel:${phoneNumber}`;
                        break;
                        
                    default:
                        console.error('Unknown contact method');
                }
            });
        });
    }
    
    // Initialize the filter form in the homepage
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const typeSelect = document.getElementById('filter-type');
            const categorySelect = document.getElementById('filter-category');
            
            let queryParams = [];
            
            if (typeSelect.value) {
                queryParams.push(`type=${typeSelect.value}`);
            }
            
            if (categorySelect.value) {
                queryParams.push(`category=${categorySelect.value}`);
            }
            
            let url = window.location.pathname;
            if (queryParams.length > 0) {
                url += '?' + queryParams.join('&');
            }
            
            window.location.href = url;
        });
        
        // Update categories when type changes
        const typeSelect = document.getElementById('filter-type');
        const categorySelect = document.getElementById('filter-category');
        
        if (typeSelect && categorySelect) {
            typeSelect.addEventListener('change', function() {
                const productType = this.value;
                
                // Clear current categories
                categorySelect.innerHTML = '<option value="">All Categories</option>';
                
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
            });
        }
    }
    
    // Fade out flash messages after 3 seconds
    const flashMessages = document.querySelectorAll('.alert');
    if (flashMessages.length > 0) {
        setTimeout(() => {
            flashMessages.forEach(message => {
                message.style.transition = 'opacity 1s';
                message.style.opacity = '0';
                
                setTimeout(() => {
                    message.remove();
                }, 1000);
            });
        }, 3000);
    }
});
