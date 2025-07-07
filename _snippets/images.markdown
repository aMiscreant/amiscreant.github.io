---
layout: page
title: Image Processing
published: 2025-07-08
date: 2024-10-19
description: A comprehensive set of Python scripts to transform, enhance, and analyze images. Whether it's applying filters, performing geometric transformations, or advanced computer vision tasks, these scripts empower you to unlock the full potential of image data.
permalink: /snippets/python/images
---
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https:; script-src 'self'; style-src 'self' 'unsafe-inline';">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload">
<meta name="referrer" content="no-referrer">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta http-equiv="Access-Control-Allow-Origin" content="*">
<meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
<meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
<meta http-equiv="Cross-Origin-Resource-Policy" content="same-origin">
<meta http-equiv="Expect-CT" content="max-age=86400, enforce">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="stylesheet" href="{{ 'css/main.css' | relative_url }}">
<script src="{{ 'assets/js/copy-to-clipboard.js' | relative_url }}"></script>

---

<p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
<p>{{ page.description }}</p>

---

## Advanced Python Scripts for Image Processing and Visual Effects
Instructions for setting up the snippet locally.

ImageTools is a comprehensive collection of Python scripts and tools designed to unleash the power of image manipulation. Whether you're a developer, designer, or AI enthusiast, this library provides a diverse range of visual effects, transformations, and enhancements that can take your image processing projects to the next level.

![Base Image](https://github.com/user-attachments/assets/36b5ee57-9af3-42df-9a7a-a8960b1ae0b1)

This image serves as the baseline for all the operations shown here, allowing you to test and visualize the transformations as you explore each technique.

Note: While this page showcases a selection of image processing examples, not all available scripts and techniques are included here. For the complete set of examples, please visit my GitHub repository for [ImageTools](https://github.com/aMiscreant/ImageTools). For a full reference and visual examples of each script, including those not featured here [Github](https://github.com/aMiscreant/ImageTools/blob/master/website_uploads.md), check out the website uploads reference.
# Image Processing Techniques

## Image Filters
- **Sepia**, **grayscale**, and custom color filters
- **Blur** (Gaussian, median, etc.)
- **Edge detection** (using Canny or Sobel filters)

> Use these filters to enhance images, reduce noise, or detect edges.

### Sepia >

```python
# Insert script for image filters here
# Example: Applying a sepia.py filter using OpenCV
import cv2
import numpy as np
import os
import shutil
import imageio
import matplotlib.pyplot as plt
import threading

# Load the image
image_path = 'your_image.jpg'  # Replace with your image path
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"Image not found at path: {image_path}")

# Ensure the output directory exists and delete it if it does
output_dir = 'output_frames'
if os.path.exists(output_dir):
    shutil.rmtree(output_dir)
os.makedirs(output_dir, exist_ok=True)

# Function to apply a sepia filter
def apply_sepia(image):
    sepia_filter = np.array([[0.272, 0.534, 0.131],
                             [0.349, 0.686, 0.168],
                             [0.393, 0.769, 0.189]])
    sepia_image = cv2.transform(image, sepia_filter)
    sepia_image = np.clip(sepia_image, 0, 255)  # Ensure pixel values are valid
    return sepia_image

# Apply sepia filter
sepia_image = apply_sepia(image)

# Save and display the sepia image
sepia_image_path = 'sepia_image.jpg'
cv2.imwrite(sepia_image_path, sepia_image)

plt.imshow(cv2.cvtColor(sepia_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.title('Sepia Image')
# plt.title('') # Blank title
plt.show()

print(f'Sepia image created and saved as "{sepia_image_path}".')

```

Output:

After applying the effect/filter, your image should look like this:

![Sepia](https://github.com/user-attachments/assets/5129194c-af1c-4dc3-a217-0ef3defab064)

---

### Grayscale >

```python
# Insert script for image filters here
# Example: Applying a grayscale.py filter using OpenCV
import cv2
import numpy as np
import os
import shutil
import imageio
import matplotlib.pyplot as plt
import threading

# Load the image
image_path = 'your_image.jpg'  # Replace with your image path
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"Image not found at path: {image_path}")

# Ensure the output directory exists and delete it if it does
output_dir = 'output_frames'
if os.path.exists(output_dir):
    shutil.rmtree(output_dir)
os.makedirs(output_dir, exist_ok=True)

# Function to apply a sepia filter
def apply_sepia(image):
    sepia_filter = np.array([[0.272, 0.534, 0.131],
                             [0.349, 0.686, 0.168],
                             [0.393, 0.769, 0.189]])
    sepia_image = cv2.transform(image, sepia_filter)
    sepia_image = np.clip(sepia_image, 0, 255)  # Ensure pixel values are valid
    return sepia_image

# Function to apply a grayscale filter
def apply_grayscale(image):
    grayscale_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Convert to 3 channels for consistency
    return cv2.cvtColor(grayscale_image, cv2.COLOR_GRAY2BGR)  

# Apply sepia filter
sepia_image = apply_sepia(image)

# Save and display the sepia image
sepia_image_path = 'sepia_image.jpg'
cv2.imwrite(sepia_image_path, sepia_image)

plt.imshow(cv2.cvtColor(sepia_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.title('Sepia Image')
plt.show()

print(f'Sepia image created and saved as "{sepia_image_path}".')

# Apply grayscale filter
grayscale_image = apply_grayscale(image)

# Save and display the grayscale image
grayscale_image_path = 'grayscale_image.jpg'
cv2.imwrite(grayscale_image_path, grayscale_image)

plt.imshow(cv2.cvtColor(grayscale_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.title('Grayscale Image')
plt.show()

print(f'Grayscale image created and saved as "{grayscale_image_path}".')

```

Output:

After applying the effect/filter, your image should look like this:

![Grayscale](https://github.com/user-attachments/assets/deb99d56-9e38-4580-8347-5c989c45fa38)

---

### Blur >

```python
# Insert script for image filters here
# Example: Applying a blur.py filter using OpenCV
import cv2
import numpy as np
import os
import shutil
import imageio
import matplotlib.pyplot as plt
import threading

# Load the image
image_path = 'your_image.jpg'  # Replace with your image path
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"Image not found at path: {image_path}")

# Ensure the output directory exists and delete it if it does
output_dir = 'output_frames'
if os.path.exists(output_dir):
    shutil.rmtree(output_dir)
os.makedirs(output_dir, exist_ok=True)

# Function to apply a blur effect
def apply_blur(image, kernel_size=(15, 15)):
    blurred_image = cv2.GaussianBlur(image, kernel_size, 0)
    return blurred_image

# Apply blur filter
blurred_image = apply_blur(image)

# Save and display the blurred image
blurred_image_path = 'blurred_image.jpg'
cv2.imwrite(blurred_image_path, blurred_image)

plt.imshow(cv2.cvtColor(blurred_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.title('Blurred Image')
plt.show()

print(f'Blurred image created and saved as "{blurred_image_path}".')

```

Output:

After applying the effect/filter, your image should look like this:

![Blurred](https://github.com/user-attachments/assets/11e7ab1b-8fcc-447b-a964-222cb7e80991)

---

### Median >

```python
# Insert script for image filters here
# Example: Applying a median.py filter using OpenCV
import cv2
import numpy as np
import os
import shutil
import imageio
import matplotlib.pyplot as plt
import threading

# Load the image
image_path = 'your_image.jpg'  # Replace with your image path
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"Image not found at path: {image_path}")

# Ensure the output directory exists and delete it if it does
output_dir = 'output_frames'
if os.path.exists(output_dir):
    shutil.rmtree(output_dir)
os.makedirs(output_dir, exist_ok=True)

# Function to apply a median effect
def apply_median_effect(image, kernel_size=15):
    median_image = cv2.medianBlur(image, kernel_size)
    return median_image

# Apply Median effect
median_image = apply_median_effect(image)

# Save and display the Median image
median_image_path = 'median_image.jpg'
cv2.imwrite(median_image_path, median_image)

plt.imshow(cv2.cvtColor(median_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.title('Median Image')
plt.show()

print(f'Median image created and saved as "{median_image_path}".')

```

Output:

After applying the effect/filter, your image should look like this:

![Median](https://github.com/user-attachments/assets/a458fe35-526b-4859-9527-5864812160fc)

---

### Canny >

```python
# Insert script for image filters here
# Example: Applying a canny.py filter using OpenCV
import cv2
import numpy as np
import os
import shutil
import imageio
import matplotlib.pyplot as plt
import threading

# Load the image
image_path = 'your_image.jpg'  # Replace with your image path
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"Image not found at path: {image_path}")

# Ensure the output directory exists and delete it if it does
output_dir = 'output_frames'
if os.path.exists(output_dir):
    shutil.rmtree(output_dir)
os.makedirs(output_dir, exist_ok=True)

# Function to apply Canny edge detection
def apply_canny_edge_detection(image, threshold1=100, threshold2=200):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray_image, threshold1, threshold2)
    edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    # Convert to 3 channels for consistency
    return edges_colored

# Apply Canny edge detection
canny_image = apply_canny_edge_detection(image)

# Save and display the Canny edge detection image
canny_image_path = 'canny_image.jpg'
cv2.imwrite(canny_image_path, canny_image)

plt.imshow(cv2.cvtColor(canny_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.title('Canny Edge Detection')
plt.show()

print(f'Canny edge detection image created and saved as "{canny_image_path}".')

```

Output:

After applying the effect/filter, your image should look like this:

![Canny](https://github.com/user-attachments/assets/ba0bd9bf-6529-476d-8202-9b7f6b8219fc)

---

### Sobel >

```python
# Insert script for image filters here
# Example: Applying a sobel.py filter using OpenCV
import cv2
import numpy as np
import os
import shutil
import imageio
import matplotlib.pyplot as plt
import threading

# Load the image
image_path = 'your_image.jpg'  # Replace with your image path
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"Image not found at path: {image_path}")

# Ensure the output directory exists and delete it if it does
output_dir = 'output_frames'
if os.path.exists(output_dir):
    shutil.rmtree(output_dir)
os.makedirs(output_dir, exist_ok=True)

# Function to apply Sobel edge detection
def apply_sobel_edge_detection(image, ksize=3):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    sobelx = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=ksize)
    sobely = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=ksize)
    sobel_combined = cv2.magnitude(sobelx, sobely)
    # Ensure pixel values are valid
    sobel_combined = np.uint8(np.clip(sobel_combined, 0, 255))
    # Convert to 3 channels for consistency
    sobel_colored = cv2.cvtColor(sobel_combined, cv2.COLOR_GRAY2BGR)
    return sobel_colored

# Apply Sobel edge detection
sobel_image = apply_sobel_edge_detection(image)

# Save and display the Sobel edge detection image
sobel_image_path = 'sobel_image.jpg'
cv2.imwrite(sobel_image_path, sobel_image)

plt.imshow(cv2.cvtColor(sobel_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.title('Sobel Edge Detection')
plt.show()

print(f'Sobel edge detection image created and saved as "{sobel_image_path}".')

```

Output:

After applying the effect/filter, your image should look like this:

![Sobel](https://github.com/user-attachments/assets/1800a69a-5294-4dd0-bf04-b78e8b1c913f)

---

## Geometric Transformations

- **Image rotation**, **flipping**, **scaling**, and **skewing**
- **Perspective transformations** (warping images)

> Use these techniques to modify the geometry of images, whether it's for rotating an image, changing its perspective, or applying various transformations to improve visual composition.

###  Skewing >
```python
# Insert script for image filters here
# Example: Applying a skewing.py filter using OpenCV
import cv2
import numpy as np
import os
import matplotlib.pyplot as plt

# Load the image
image_path = 'your_image.jpg'  # Replace with your image path
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"Image not found at path: {image_path}")

# Ensure the output directory exists and delete it if it does
output_dir = 'output_frames'
if os.path.exists(output_dir):
    os.makedirs(output_dir, exist_ok=True)

# Function to apply skew/perspective transformation
def skew_image(image):
    (h, w) = image.shape[:2]
    src_points = np.float32([[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]])
    dst_points = np.float32([[0, 0], [w - 1, 0], [int(0.33 * w), h - 1], [int(0.66 * w), h - 1]])
    perspective_matrix = cv2.getPerspectiveTransform(src_points, dst_points)
    skewed_image = cv2.warpPerspective(image, perspective_matrix, (w, h))
    return skewed_image

# Apply skew/perspective transformation to the image
skewed_image = skew_image(image)
skewed_image_path = 'skewed_image.jpg'
cv2.imwrite(skewed_image_path, skewed_image)

plt.imshow(cv2.cvtColor(skewed_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.title('Skewed Image')
plt.show()

print(f'Skewed image created and saved as "{skewed_image_path}".')

```

Output:

After applying the effect/filter, your image should look like this:

![image](https://github.com/user-attachments/assets/09e584c6-b47b-454c-b17d-8ab36f9efd98)

---

### Rotate >
```python
# Insert script for image filters here
# Example: Applying a rotate.py filter using OpenCV
import cv2
import numpy as np
import os
import matplotlib.pyplot as plt

# Load the image
image_path = 'your_image.jpg'  # Replace with your image path
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"Image not found at path: {image_path}")

# Ensure the output directory exists and delete it if it does
output_dir = 'output_frames'
if os.path.exists(output_dir):
    os.makedirs(output_dir, exist_ok=True)

# Function to apply image rotation
def rotate_image(image, angle, scale=1.0):
    (h, w) = image.shape[:2]  # Get the image dimensions
    center = (w // 2, h // 2)  # Determine the center of the image

    # Compute the rotation matrix
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, scale)

    # Perform the rotation
    rotated_image = cv2.warpAffine(image, rotation_matrix, (w, h))
    return rotated_image

# Apply rotation to the image
rotation_angle = 45  # You can change this value to rotate the image at different angles
rotated_image = rotate_image(image, rotation_angle)

# Save and display the rotated image
rotated_image_path = 'rotated_image.jpg'
cv2.imwrite(rotated_image_path, rotated_image)

plt.imshow(cv2.cvtColor(rotated_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.title(f'Rotated Image ({rotation_angle} degrees)')
plt.show()

print(f'Rotated image created and saved as "{rotated_image_path}".')

```

Output:

After applying the effect/filter, your image should look like this:

![image](https://github.com/user-attachments/assets/86d9355d-1340-4fb3-99f1-c0440830c4f1)

---

### Flipping >
```python
# Insert script for image filters here
# Example: Applying a flipping.py filter using OpenCV
import cv2
import numpy as np
import os
import matplotlib.pyplot as plt

# Load the image
image_path = 'your_image.jpg'  # Replace with your image path
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"Image not found at path: {image_path}")

# Ensure the output directory exists and delete it if it does
output_dir = 'output_frames'
if os.path.exists(output_dir):
    os.makedirs(output_dir, exist_ok=True)

# Function to flip the image
def flip_image(image, flip_code):
    flipped_image = cv2.flip(image, flip_code)
    return flipped_image

# Apply flipping to the image
flipped_image = flip_image(image, 1)  # 1 for horizontal, 0 for vertical, -1 for both
flipped_image_path = 'flipped_image.jpg'
cv2.imwrite(flipped_image_path, flipped_image)

plt.imshow(cv2.cvtColor(flipped_image, cv2.COLOR_BGR2RGB))
plt.axis('off')
plt.title('Flipped Image (Horizontal)')
plt.show()

print(f'Flipped image created and saved as "{flipped_image_path}".')

```

Output:

After applying the effect/filter, your image should look like this:

![image](https://github.com/user-attachments/assets/e54123c8-c4f1-4480-b7b4-b3dd44e57f32)

---