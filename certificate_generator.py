from PIL import Image, ImageDraw, ImageFont
import pandas as pd
import os

def generate_certificates(template_path, excel_path, font_path, font_size, text_position):
    df = pd.read_excel(excel_path)
    output_files = []
    
    for index, row in df.iterrows():
        name = row["User Name"]
        image = Image.open(template_path)
        draw = ImageDraw.Draw(image)
        
        font = ImageFont.truetype(font_path, font_size)
        draw.text(text_position, name, fill=(0, 0, 0), font=font)
        
        output_filename = f"certificate_{name}.png"
        output_path = os.path.join('static/uploads', output_filename)
        image.save(output_path)
        output_files.append(output_filename)
    
    return output_files