import os
from PIL import Image

def process_grid():
    img_path = r"C:\Users\XIAOMI\.gemini\antigravity-ide\brain\6bc1f02e-c0e6-4bf3-9ac2-dc7f2d278b41\media__1782546854086.png"
    out_dir = r"c:\Users\XIAOMI\WBI\Frontend\src\assets\images\icons\services\vector"
    os.makedirs(out_dir, exist_ok=True)
    
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    
    cols = 5
    rows = 3
    
    cell_w = width / cols
    cell_h = height / rows
    
    services = [
        "home-cleaning", "ac-repair", "plumbing", "electrician", "salon-at-home",
        "painting", "pest-control", "car-wash", "appliance-repair", "carpenter",
        "laundry", "beauty-services", "deep-cleaning", "home-maintenance"
    ]
    
    idx = 0
    for r in range(rows):
        for c in range(cols):
            if idx >= len(services):
                break
                
            left = c * cell_w
            top = r * cell_h
            right = (c + 1) * cell_w
            bottom = (r + 1) * cell_h
            
            # Crop the cell
            cell = img.crop((left, top, right, bottom))
            
            # The icon is likely centered in the top ~70% of the cell
            # Let's crop a square from the center-top of the cell
            cw, ch = cell.size
            icon_size = int(cw * 0.74) # 74% to capture the whole colored circle
            icon_left = (cw - icon_size) / 2
            icon_top = ch * 0.06 # 6% from top
            icon_right = icon_left + icon_size
            icon_bottom = icon_top + icon_size
            
            icon = cell.crop((icon_left, icon_top, icon_right, icon_bottom))
            
            # Resize for fast loading
            result = icon.resize((96, 96), Image.Resampling.LANCZOS)
            
            out_path = os.path.join(out_dir, f"{services[idx]}.png")
            result.save(out_path, "PNG", optimize=True)
            print(f"Saved {out_path}")
            
            idx += 1

if __name__ == "__main__":
    process_grid()
