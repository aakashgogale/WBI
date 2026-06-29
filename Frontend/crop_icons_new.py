import os
from PIL import Image, ImageDraw

def process_grid():
    img_path = r"C:\Users\XIAOMI\.gemini\antigravity-ide\brain\5783b01a-926f-4158-824d-2ccc7112afb9\grid.png"
    out_dir = r"c:\Users\XIAOMI\WBI\Frontend\src\assets\images\icons\services\vector"
    os.makedirs(out_dir, exist_ok=True)
    
    img = Image.open(img_path).convert("RGBA")
    
    services = [
        "home-cleaning", "ac-repair", "plumbing", "electrician", "salon-at-home",
        "painting", "pest-control", "car-wash", "appliance-repair", "carpenter",
        "laundry", "beauty-services", "deep-cleaning", "home-maintenance"
    ]
    
    # Define card boxes
    # Row vertical ranges (top, bottom)
    row_y = [
        (18, 220),  # Row 0
        (236, 438), # Row 1
        (454, 656)  # Row 2
    ]
    
    card_boxes = []
    
    # Row 0 (5 columns)
    for col in range(5):
        left = 14 + col * 200
        right = left + 184
        card_boxes.append((left, row_y[0][0], right, row_y[0][1]))
        
    # Row 1 (5 columns)
    for col in range(5):
        left = 14 + col * 200
        right = left + 184
        card_boxes.append((left, row_y[1][0], right, row_y[1][1]))
        
    # Row 2 (4 columns)
    for col in range(4):
        left = 114 + col * 200
        right = left + 184
        card_boxes.append((left, row_y[2][0], right, row_y[2][1]))
        
    for idx, (left, top, right, bottom) in enumerate(card_boxes):
        if idx >= len(services):
            break
            
        # Crop the card
        card = img.crop((left, top, right, bottom))
        cw, ch = card.size
        
        # Detect the circle color boundary to find the center of the circle
        pixels = card.load()
        x_coords = []
        y_coords = []
        
        # Search in the top part of the card where the circle resides (height <= 145)
        # Card edges (left < 10, right > cw - 10) are ignored to avoid shadows
        for y in range(5, 145):
            for x in range(10, cw - 10):
                r, g, b, a = pixels[x, y]
                # A pixel is part of the circle if it is colored and not white/very light grey background
                if a > 50 and (r < 242 or g < 242 or b < 242):
                    x_coords.append(x)
                    y_coords.append(y)
                    
        if not x_coords:
            cx, cy = cw / 2, 75
            radius = 65
        else:
            min_x, max_x = min(x_coords), max(x_coords)
            min_y, max_y = min(y_coords), max(y_coords)
            cx = (min_x + max_x) / 2
            cy = (min_y + max_y) / 2
            circle_w = max_x - min_x
            circle_h = max_y - min_y
            # We add a slight margin of 1.5 pixels to ensure we don't slice the edge of the colored circle
            radius = max(circle_w, circle_h) / 2 + 1.5
            
        # Crop a square of size 2*radius centered at (cx, cy)
        crop_left = cx - radius
        crop_top = cy - radius
        crop_right = cx + radius
        crop_bottom = cy + radius
        
        icon_square = card.crop((crop_left, crop_top, crop_right, crop_bottom))
        icon_square = icon_square.convert("RGBA")
        
        # Create a circular mask
        size = icon_square.size
        mask = Image.new("L", size, 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size[0], size[1]), fill=255)
        
        # Apply the circular mask to the alpha channel of icon_square
        result = Image.new("RGBA", size)
        result.paste(icon_square, (0, 0), mask=mask)
        
        # Resize to 96x96 for web optimization
        resized_icon = result.resize((96, 96), Image.Resampling.LANCZOS)
        
        # Save as PNG
        out_path = os.path.join(out_dir, f"{services[idx]}.png")
        resized_icon.save(out_path, "PNG", optimize=True)
        print(f"Saved {services[idx]}.png: center ({cx:.1f}, {cy:.1f}), radius {radius:.1f}")

if __name__ == "__main__":
    process_grid()
