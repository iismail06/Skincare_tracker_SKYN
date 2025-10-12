import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
import sys

# Ask for Cloudinary credentials if not in environment
cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
api_key = os.environ.get('CLOUDINARY_API_KEY')
api_secret = os.environ.get('CLOUDINARY_API_SECRET')

if not cloud_name or not api_key or not api_secret:
    print("Cloudinary credentials not found in environment variables.")
    print("Please enter your Cloudinary credentials:")
    cloud_name = input("Cloud Name: ").strip()
    api_key = input("API Key: ").strip()
    api_secret = input("API Secret: ").strip()
    
    if not cloud_name or not api_key or not api_secret:
        print("Error: You must provide all Cloudinary credentials.")
        sys.exit(1)

# Configure Cloudinary
cloudinary.config(
    cloud_name=cloud_name,
    api_key=api_key,
    api_secret=api_secret
)

# Define the path to your hero images
image_paths = {
    'hero_image': 'static/images/hero/hero.webp',
    'feature_image': 'static/images/features/features.webp'
}

def upload_image_to_cloudinary(image_path, public_id):
    """Upload an image to Cloudinary with a specific public ID"""
    print(f"Uploading {image_path} to Cloudinary...")
    
    try:
        # Upload the image to Cloudinary
        result = cloudinary.uploader.upload(image_path, 
                                           public_id=public_id,
                                           overwrite=True)
        print(f"Successfully uploaded {image_path} to Cloudinary")
        print(f"Cloudinary URL: {result['url']}")
        print(f"Secure URL: {result['secure_url']}")
        return result
    except Exception as e:
        print(f"Error uploading {image_path} to Cloudinary: {e}")
        return None

def main():
    print("Starting image upload to Cloudinary...")
    
    # Upload hero image
    if os.path.exists(image_paths['hero_image']):
        hero_result = upload_image_to_cloudinary(
            image_paths['hero_image'], 
            'skyn/hero_image'
        )
    else:
        print(f"Hero image not found at {image_paths['hero_image']}")
    
    # Upload feature image
    if os.path.exists(image_paths['feature_image']):
        feature_result = upload_image_to_cloudinary(
            image_paths['feature_image'], 
            'skyn/feature_image'
        )
    else:
        print(f"Feature image not found at {image_paths['feature_image']}")
    
    print("Image upload process completed.")

if __name__ == "__main__":
    main()