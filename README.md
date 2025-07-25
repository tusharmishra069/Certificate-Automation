# AutoCerti - Certificate Automation

AutoCerti is a web-based application that streamlines the process of generating personalized certificates in bulk. Users can upload their own certificate template and an Excel file containing recipient details, and AutoCerti will automatically generate certificates for each recipient with a single click.

## Features

- **Bulk Certificate Generation:** Generate certificates for multiple recipients at once using an Excel file.
- **Custom Templates:** Upload your own certificate design to personalize the look and feel.
- **Instant Processing:** Generate and download certificates instantly.
- **User-Friendly Interface:** Simple, intuitive UI for both technical and non-technical users.
- **Preview Functionality:** Preview certificates before finalizing the generation process.
- **Downloadable Output:** Download all generated certificates in a convenient format.
- **QR Code Support:** Optionally embed QR codes for verification or additional information.

## How It Works

1. **Upload Template:** Provide your own certificate template image (PNG, JPG, etc.).
2. **Upload Excel File:** Upload an Excel (.xlsx) file containing recipient names and other relevant details.
3. **Map Fields:** (If applicable) Map Excel columns to certificate fields.
4. **Preview:** Review a sample certificate to ensure correct placement and formatting.
5. **Generate:** Click to generate certificates for all recipients.
6. **Download:** Download the generated certificates as a ZIP file or individually.

## Folder Structure

```
Certificate Automation/
├── app.py                        # Main Flask application
├── certificate_generator.py      # Certificate generation logic
├── requirement.txt               # Python dependencies
├── static/
│   ├── css/                      # Stylesheets
│   ├── fonts/                    # Custom fonts
│   ├── images/                   # Static images
│   ├── js/                       # JavaScript files
│   └── uploads/                  # Uploaded templates and Excel files
├── templates/
│   ├── generate.html             # Certificate generation page
│   ├── index.html                # Landing page
│   └── preview.html              # Certificate preview page
└── vercel.json                   # Vercel deployment configuration
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/certificate-automation.git
   cd certificate-automation
   ```
2. **Install dependencies:**
   ```bash
   pip install -r requirement.txt
   ```
3. **Run the application:**
   ```bash
   python app.py
   ```
4. **Access the app:**
   Open your browser and go to `http://localhost:5000`

## Usage

- Navigate to the "Get Started" page.
- Upload your certificate template and Excel file.
- Preview and generate certificates.
- Download the generated certificates.

## Technologies Used

- **Python 3**
- **Flask** (Web framework)
- **OpenPyXL** (Excel file processing)
- **Pillow** (Image processing)
- **HTML5/CSS3/JavaScript** (Frontend)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements, bug fixes, or new features.


## Support

For support, please open an issue or contact the maintainer.
