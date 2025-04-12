// Full-screen immersive gallery implementation
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const galleryOverlay = document.querySelector('.gallery-overlay');
    const galleryContainer = document.querySelector('.gallery-container');
    const galleryImage = document.querySelector('.gallery-image');
    const galleryNext = document.querySelector('.gallery-next');
    const galleryPrev = document.querySelector('.gallery-prev');
    const galleryClose = document.querySelector('.gallery-close');
    const galleryThumbnails = document.querySelector('.gallery-thumbnails');
    
    // Gallery variables
    let currentIndex = 0;
    let images = [];
    
    // Open gallery from product detail page
    const productMainImage = document.querySelector('.product-detail-img');
    if (productMainImage && galleryOverlay) {
        productMainImage.addEventListener('click', function() {
            openGallery();
        });
        
        // Get images from thumbnails
        const productThumbnails = document.querySelectorAll('.product-thumbnail');
        if (productThumbnails.length > 0) {
            images = Array.from(productThumbnails).map(thumbnail => thumbnail.src);
            
            // Also add the main product image if it's not already included
            if (!images.includes(productMainImage.src)) {
                images.unshift(productMainImage.src);
            }
            
            // Create thumbnail elements in the gallery
            if (galleryThumbnails) {
                galleryThumbnails.innerHTML = '';
                images.forEach((image, index) => {
                    const thumbnail = document.createElement('img');
                    thumbnail.src = image;
                    thumbnail.alt = 'Product thumbnail';
                    thumbnail.classList.add('gallery-thumbnail');
                    
                    thumbnail.addEventListener('click', function() {
                        currentIndex = index;
                        updateGallery();
                    });
                    
                    galleryThumbnails.appendChild(thumbnail);
                });
            }
        }
    }
    
    // Gallery controls
    if (galleryNext) {
        galleryNext.addEventListener('click', nextImage);
    }
    
    if (galleryPrev) {
        galleryPrev.addEventListener('click', prevImage);
    }
    
    if (galleryClose) {
        galleryClose.addEventListener('click', closeGallery);
    }
    
    if (galleryOverlay) {
        // Close gallery on overlay click (not on image)
        galleryOverlay.addEventListener('click', function(event) {
            if (event.target === galleryOverlay) {
                closeGallery();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(event) {
            if (!galleryOverlay.classList.contains('active')) return;
            
            switch (event.key) {
                case 'ArrowRight':
                    nextImage();
                    break;
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'Escape':
                    closeGallery();
                    break;
            }
        });
        
        // Touch swipe for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        galleryContainer.addEventListener('touchstart', function(event) {
            touchStartX = event.changedTouches[0].screenX;
        }, false);
        
        galleryContainer.addEventListener('touchend', function(event) {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const SWIPE_THRESHOLD = 50;
            if (touchEndX < touchStartX - SWIPE_THRESHOLD) {
                // Swipe left, show next image
                nextImage();
            }
            if (touchEndX > touchStartX + SWIPE_THRESHOLD) {
                // Swipe right, show previous image
                prevImage();
            }
        }
    }
    
    // Gallery functions
    function openGallery() {
        if (!galleryOverlay || images.length === 0) return;
        
        galleryOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Find index of main image
        const mainImgSrc = productMainImage.src;
        currentIndex = images.findIndex(src => src === mainImgSrc);
        if (currentIndex === -1) currentIndex = 0;
        
        updateGallery();
    }
    
    function closeGallery() {
        if (!galleryOverlay) return;
        
        galleryOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    function nextImage() {
        if (images.length === 0) return;
        
        currentIndex = (currentIndex + 1) % images.length;
        updateGallery();
    }
    
    function prevImage() {
        if (images.length === 0) return;
        
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateGallery();
    }
    
    function updateGallery() {
        if (!galleryImage || images.length === 0) return;
        
        galleryImage.src = images[currentIndex];
        
        // Update thumbnails active state
        const thumbnails = document.querySelectorAll('.gallery-thumbnail');
        thumbnails.forEach((thumbnail, index) => {
            if (index === currentIndex) {
                thumbnail.classList.add('active');
            } else {
                thumbnail.classList.remove('active');
            }
        });
    }
});
