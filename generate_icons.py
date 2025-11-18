#!/usr/bin/env python3
"""Generate simple PNG icons for the Chrome extension."""

try:
    from PIL import Image, ImageDraw, ImageFont
    
    def create_icon(size, output_path):
        # Create a new image with a blue background
        img = Image.new('RGB', (size, size), color='#4A90E2')
        draw = ImageDraw.Draw(img)
        
        # Draw rounded rectangle effect by drawing a border
        border_radius = size // 6
        
        # Draw white text "CG"
        try:
            # Try to use a system font
            font_size = size // 2
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
        
        text = "CG"
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Center the text
        x = (size - text_width) // 2
        y = (size - text_height) // 2 - size // 10
        
        draw.text((x, y), text, fill='white', font=font)
        
        # Save the image
        img.save(output_path, 'PNG')
        print(f"Created {output_path}")
    
    # Generate icons in different sizes
    create_icon(16, 'assets/icon16.png')
    create_icon(48, 'assets/icon48.png')
    create_icon(128, 'assets/icon128.png')
    
    print("All icons generated successfully!")

except ImportError:
    print("PIL/Pillow not installed. Installing...")
    import subprocess
    subprocess.run(['pip3', 'install', 'Pillow'], check=True)
    print("Please run this script again.")
