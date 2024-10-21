from PIL import Image
import os

def optimize_images(input_dir, output_dir):
    for filename in os.listdir(input_dir):
        if filename.endswith('.jpg') or filename.endswith('.png'):
            img_path = os.path.join(input_dir, filename)
            with Image.open(img_path) as img:
                img = img.resize((img.width // 2, img.height // 2))  # Resize to half
                img.save(os.path.join(output_dir, filename), optimize=True, quality=85)

if __name__ == "__main__":
    input_directory = '/images'  # Input directory for original images
    output_directory = '_site/assets/images'  # Output directory in Jekyll
    optimize_images(input_directory, output_directory)
