import os
import json
import uuid
import logging
import shutil
from datetime import datetime
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, abort

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "chara_fashion_fragrance_secret")

# Ensure data directory exists
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')
PRODUCTS_DIR = os.path.join(DATA_DIR, 'products')

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)
if not os.path.exists(PRODUCTS_DIR):
    os.makedirs(PRODUCTS_DIR)

# Register a route for serving product images
from flask import send_from_directory

@app.route('/data/products/<product_id>/<filename>')
def product_image(product_id, filename):
    return send_from_directory(os.path.join(PRODUCTS_DIR, product_id), filename)

# Add current_year to all templates
@app.context_processor
def inject_current_year():
    return {'current_year': datetime.now().year}

# Helper function to get the first image of a product
@app.context_processor
def inject_utility_functions():
    def get_first_image(product_id):
        product_folder = os.path.join(PRODUCTS_DIR, product_id)
        if os.path.exists(product_folder):
            for filename in os.listdir(product_folder):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                    return filename
        return None
    
    return {
        'get_first_image': get_first_image
    }

# Admin password
ADMIN_PASSWORD = "CHARA7436"

# Contact information
CONTACT_INFO = {
    "phone": "0702533122",
    "whatsapp": "254702533122",
    "instagram": "chara_fashion_fragrance"
}

# Create products.json if it doesn't exist
if not os.path.exists(PRODUCTS_FILE):
    with open(PRODUCTS_FILE, 'w') as f:
        json.dump([], f)

# Product types and categories
PRODUCT_TYPES = ["clothes", "shoes", "perfumes", "jewelry"]
PRODUCT_CATEGORIES = {
    "clothes": ["Dresses", "Tops", "Bottoms", "Outerwear", "Activewear"],
    "shoes": ["Casual", "Formal", "Athletic", "Boots", "Sandals"],
    "perfumes": ["Floral", "Woody", "Oriental", "Fresh", "Citrus"],
    "jewelry": ["Necklaces", "Earrings", "Bracelets", "Rings", "Watches"]
}

# Helper function to load products from JSON
def load_products():
    try:
        with open(PRODUCTS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

# Helper function to save products to JSON
def save_products(products):
    with open(PRODUCTS_FILE, 'w') as f:
        json.dump(products, f, indent=4)

# Helper function to get a product by ID
def get_product_by_id(product_id):
    products = load_products()
    for product in products:
        if product['id'] == product_id:
            return product
    return None

# Admin login required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    products = load_products()
    
    # Get filter parameters
    product_type = request.args.get('type')
    category = request.args.get('category')
    
    # Apply filters if provided
    if product_type:
        products = [p for p in products if p['type'].lower() == product_type.lower()]
    if category:
        products = [p for p in products if p['category'].lower() == category.lower()]
    
    return render_template('index.html', 
                          products=products, 
                          product_types=PRODUCT_TYPES, 
                          product_categories=PRODUCT_CATEGORIES,
                          contact_info=CONTACT_INFO)

@app.route('/product/<product_id>')
def product_detail(product_id):
    product = get_product_by_id(product_id)
    if not product:
        flash('Product not found', 'danger')
        return redirect(url_for('index'))
    
    # Get product images
    product_folder = os.path.join(PRODUCTS_DIR, product_id)
    images = []
    if os.path.exists(product_folder):
        for filename in os.listdir(product_folder):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                images.append(filename)
    
    return render_template('product.html', 
                          product=product, 
                          images=images, 
                          contact_info=CONTACT_INFO)

@app.route('/about')
def about():
    return render_template('about.html', contact_info=CONTACT_INFO)

@app.route('/contact')
def contact():
    return render_template('contact.html', contact_info=CONTACT_INFO)

@app.route('/how-to-order')
def how_to_order():
    return render_template('how_to_order.html', contact_info=CONTACT_INFO)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        password = request.form.get('password')
        
        if password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            flash('Successfully logged in!', 'success')
            return redirect(url_for('admin'))
        else:
            flash('Invalid password!', 'danger')
    
    return render_template('admin_login.html', contact_info=CONTACT_INFO)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    flash('You have been logged out!', 'success')
    return redirect(url_for('index'))

@app.route('/admin')
@admin_required
def admin():
    products = load_products()
    return render_template('admin.html', 
                          products=products, 
                          product_types=PRODUCT_TYPES, 
                          product_categories=PRODUCT_CATEGORIES,
                          contact_info=CONTACT_INFO)

@app.route('/admin/product/add', methods=['POST'])
@admin_required
def add_product():
    # Get form data
    name = request.form.get('name')
    product_type = request.form.get('type')
    category = request.form.get('category')
    brand = request.form.get('brand')
    price = request.form.get('price')
    description = request.form.get('description')
    
    # Handle colors and sizes (comma-separated values)
    colors = [c.strip() for c in request.form.get('colors', '').split(',') if c.strip()]
    sizes = [s.strip() for s in request.form.get('sizes', '').split(',') if s.strip()]
    
    # Create unique ID
    product_id = str(uuid.uuid4())
    
    # Create product object
    product = {
        'id': product_id,
        'name': name,
        'type': product_type,
        'category': category,
        'brand': brand,
        'price': price,
        'description': description,
        'colors': colors,
        'sizes': sizes,
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Save product to products.json
    products = load_products()
    products.append(product)
    save_products(products)
    
    # Create product directory if it doesn't exist
    product_dir = os.path.join(PRODUCTS_DIR, product_id)
    if not os.path.exists(product_dir):
        os.makedirs(product_dir)
    
    # Handle file uploads
    files = request.files.getlist('images')
    for file in files:
        if file and file.filename:
            filename = secure_filename(file.filename)
            file.save(os.path.join(product_dir, filename))
    
    flash('Product added successfully!', 'success')
    return redirect(url_for('admin'))

@app.route('/admin/product/edit/<product_id>', methods=['POST'])
@admin_required
def edit_product(product_id):
    products = load_products()
    product = None
    
    # Find the product to edit
    for i, p in enumerate(products):
        if p['id'] == product_id:
            product = p
            product_index = i
            break
    
    if not product:
        flash('Product not found!', 'danger')
        return redirect(url_for('admin'))
    
    # Update product fields
    product['name'] = request.form.get('name')
    product['type'] = request.form.get('type')
    product['category'] = request.form.get('category')
    product['brand'] = request.form.get('brand')
    product['price'] = request.form.get('price')
    product['description'] = request.form.get('description')
    
    # Handle colors and sizes
    product['colors'] = [c.strip() for c in request.form.get('colors', '').split(',') if c.strip()]
    product['sizes'] = [s.strip() for s in request.form.get('sizes', '').split(',') if s.strip()]
    
    # Update timestamp
    product['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Update product in list
    products[product_index] = product
    
    # Save updated products
    save_products(products)
    
    # Handle file uploads
    product_dir = os.path.join(PRODUCTS_DIR, product_id)
    if not os.path.exists(product_dir):
        os.makedirs(product_dir)
    
    files = request.files.getlist('images')
    for file in files:
        if file and file.filename:
            filename = secure_filename(file.filename)
            file.save(os.path.join(product_dir, filename))
    
    flash('Product updated successfully!', 'success')
    return redirect(url_for('admin'))

@app.route('/admin/product/delete/<product_id>', methods=['POST'])
@admin_required
def delete_product(product_id):
    products = load_products()
    
    # Filter out the product to delete
    updated_products = [p for p in products if p['id'] != product_id]
    
    # Save updated products
    save_products(updated_products)
    
    # Delete product image directory
    product_dir = os.path.join(PRODUCTS_DIR, product_id)
    if os.path.exists(product_dir):
        shutil.rmtree(product_dir)
    
    flash('Product deleted successfully!', 'success')
    return redirect(url_for('admin'))

@app.route('/admin/product/images/<product_id>')
@admin_required
def get_product_images(product_id):
    product_folder = os.path.join(PRODUCTS_DIR, product_id)
    images = []
    
    if os.path.exists(product_folder):
        for filename in os.listdir(product_folder):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                images.append(filename)
    
    return jsonify({'success': True, 'images': images})

@app.route('/admin/product/image/delete', methods=['POST'])
@admin_required
def delete_product_image():
    product_id = request.form.get('product_id')
    image_name = request.form.get('image_name')
    
    if not product_id or not image_name:
        return jsonify({'success': False, 'message': 'Missing product ID or image name'}), 400
    
    image_path = os.path.join(PRODUCTS_DIR, product_id, image_name)
    
    if os.path.exists(image_path):
        os.remove(image_path)
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Image not found'}), 404

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', contact_info=CONTACT_INFO), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html', contact_info=CONTACT_INFO), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
