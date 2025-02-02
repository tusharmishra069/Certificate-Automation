from flask import Flask, render_template, request, jsonify, send_file
import os
from werkzeug.utils import secure_filename
from certificate_generator import generate_certificates
import json
import shutil

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'xlsx', 'xls', 'ttf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate')
def generate():
    return render_template('generate.html')

@app.route('/upload', methods=['POST'])
def upload_files():
    if 'template' not in request.files or 'excel' not in request.files:
        return jsonify({'error': 'Missing files'}), 400
    
    template_file = request.files['template']
    excel_file = request.files['excel']
    font_file = request.files.get('font')  # Optional font file
    
    # Save uploaded files
    template_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(template_file.filename))
    excel_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(excel_file.filename))
    
    template_file.save(template_path)
    excel_file.save(excel_path)
    
    font_path = 'static/fonts/arialbd.ttf'  # Default font
    if font_file and allowed_file(font_file.filename):
        font_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(font_file.filename))
        font_file.save(font_path)
    
    # Get position and font settings from form data
    position = json.loads(request.form.get('position', '{"x": 550, "y": 5}'))
    font_size = int(request.form.get('fontSize', 50))
    
    # Generate certificates
    output_files = generate_certificates(
        template_path=template_path,
        excel_path=excel_path,
        font_path=font_path,
        font_size=font_size,
        text_position=(position['x'], position['y'])
    )
    
    return jsonify({'message': 'Certificates generated successfully', 'files': output_files})

if __name__ == '__main__':
    os.makedirs('static/uploads', exist_ok=True)
    os.makedirs('static/fonts', exist_ok=True)
    app.run(debug=True)
