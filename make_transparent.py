
from PIL import Image
import os

def remove_black_background(image_path, threshold=30):
    try:
        img = Image.open(image_path).convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            # Check if pixel is black (allowing for some noise/compression artifacts)
            if item[0] < threshold and item[1] < threshold and item[2] < threshold:
                new_data.append((255, 255, 255, 0)) # Make Transparent
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(image_path, "PNG")
        print(f"Processed: {image_path}")
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

files = [
    "C:/Users/nafis/OneDrive/Documents/AntiGravity/Aim/favicon_home.png",
    "C:/Users/nafis/OneDrive/Documents/AntiGravity/Aim/favicon_aim.png",
    "C:/Users/nafis/OneDrive/Documents/AntiGravity/Aim/favicon_cps.png",
    "C:/Users/nafis/OneDrive/Documents/AntiGravity/Aim/favicon_reaction.png"
]

for f in files:
    if os.path.exists(f):
        remove_black_background(f)
    else:
        print(f"File not found: {f}")
