class CertificatePreview {
    constructor() {
        this.dragItem = null;
        this.container = null;
        this.active = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.scale = 1;

        // Initialize event listeners
        this.initializeEventListeners();
        this.generatedFiles = new Map(); 
        window.addEventListener('beforeunload', () => this.clearTempData());
    }

    initializeEventListeners() {
        // Preview text input
        document.getElementById('previewText').addEventListener('input', () => this.updatePreviewText());

        // Font size input
        document.getElementById('fontSize').addEventListener('input', () => this.updatePreviewFontSize());

        // Position inputs
        document.getElementById('positionX').addEventListener('input', (e) => this.updatePosition());
        document.getElementById('positionY').addEventListener('input', (e) => this.updatePosition());

        // Template upload
        document.getElementById('template').addEventListener('change', (e) => this.handleTemplateUpload(e));
    }

    handleTemplateUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('templatePreview');
            const previewText = document.getElementById('previewText').value || 'Sample Name';
            
            // Create a temporary image to get original dimensions
            const tempImg = new Image();
            tempImg.onload = () => {
                this.originalImageWidth = tempImg.width;
                this.originalImageHeight = tempImg.height;
                
                // Set the template image and preview text
                preview.innerHTML = `
                    <div style="position: relative;">
                        <img src="${event.target.result}" alt="Certificate template" id="templateImage" style="max-width: 100%; display: block;">
                        <div class="text-preview" style="position: absolute; top: 0; left: 0; color: black; cursor: move; user-select: none; background-color: rgba(255, 255, 255, 0.3); padding: 5px; border: 1px dashed #666;">${previewText}</div>
                    </div>
                `;

                const img = preview.querySelector('img');
                img.onload = () => {
                    // Calculate scale based on original vs displayed dimensions
                    this.scale = img.offsetWidth / this.originalImageWidth;
                    
                    // Set initial font size scaled appropriately
                    const fontSize = document.getElementById('fontSize').value || '24';
                    const scaledFontSize = Math.round(parseInt(fontSize) * this.scale);
                    this.dragItem = preview.querySelector('.text-preview');
                    this.dragItem.style.fontSize = `${scaledFontSize}px`;
                    
                    this.initializeDraggable();
                    this.updatePosition();
                    document.getElementById('uploadPrompt').style.display = 'none';
                };
            };
            tempImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    initializeDraggable() {
        this.dragItem = document.querySelector('.text-preview');
        this.container = document.querySelector('.template-preview');
        
        if (!this.dragItem || !this.container) {
            console.error('Draggable elements not found');
            return;
        }

        
        this.dragItem.style.display = 'block';
        this.dragItem.style.zIndex = '1000';

        // Mouse events
        this.dragItem.addEventListener('mousedown', (e) => this.dragStart(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.dragEnd());

        // Touch events
        this.dragItem.addEventListener('touchstart', (e) => this.dragStart(e));
        document.addEventListener('touchmove', (e) => this.drag(e));
        document.addEventListener('touchend', () => this.dragEnd());
    }

    dragStart(e) {
        if (e.type === 'touchstart') {
            this.initialX = e.touches[0].clientX - this.xOffset;
            this.initialY = e.touches[0].clientY - this.yOffset;
        } else {
            this.initialX = e.clientX - this.xOffset;
            this.initialY = e.clientY - this.yOffset;
        }

        if (e.target === this.dragItem) {
            this.active = true;
            this.dragItem.classList.add('dragging');
        }
    }

    drag(e) {
        if (!this.active) return;
        e.preventDefault();

        if (e.type === 'touchmove') {
            this.currentX = e.touches[0].clientX - this.initialX;
            this.currentY = e.touches[0].clientY - this.initialY;
        } else {
            this.currentX = e.clientX - this.initialX;
            this.currentY = e.clientY - this.initialY;
        }

        this.xOffset = this.currentX;
        this.yOffset = this.currentY;

        // Convert to actual coordinates (unscaled)
        const actualX = Math.round(this.currentX / this.scale);
        const actualY = Math.round(this.currentY / this.scale);

        // Store actual positions
        this.dragItem.dataset.actualX = actualX;
        this.dragItem.dataset.actualY = actualY;

        // Update position inputs with actual (unscaled) values
        document.getElementById('positionX').value = actualX;
        document.getElementById('positionY').value = actualY;

        this.updateCoordinatesDisplay(actualX, actualY);
        this.setTranslate(this.currentX, this.currentY, this.dragItem);
    }

    dragEnd() {
        this.active = false;
        this.dragItem?.classList.remove('dragging');
    }

    updatePreviewText() {
        if (!this.dragItem) return;
        const text = document.getElementById('previewText').value || 'Sample Name';
        this.dragItem.textContent = text;
    }

    updatePreviewFontSize() {
        if (!this.dragItem) return;
        const fontSize = document.getElementById('fontSize').value;
        // Store the actual font size for form submission
        this.dragItem.dataset.actualFontSize = fontSize;
        // Display scaled font size in preview
        const scaledFontSize = Math.round(parseInt(fontSize) * this.scale);
        this.dragItem.style.fontSize = `${scaledFontSize}px`;
    }

    updatePosition() {
        if (!this.dragItem) return;
        const x = parseInt(document.getElementById('positionX').value) || 0;
        const y = parseInt(document.getElementById('positionY').value) || 0;
        
        // Store actual positions for form submission
        this.dragItem.dataset.actualX = x;
        this.dragItem.dataset.actualY = y;
        
        // Display scaled positions in preview
        this.xOffset = x * this.scale;
        this.yOffset = y * this.scale;
        
        this.setTranslate(this.xOffset, this.yOffset, this.dragItem);
        this.updateCoordinatesDisplay(x, y);
    }

    setTranslate(xPos, yPos, element) {
        if (element) {
            element.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }
    }

    updateCoordinatesDisplay(x, y) {
        let display = document.querySelector('.coordinates-display');
        if (!display) {
            display = document.createElement('div');
            display.className = 'coordinates-display';
            document.body.appendChild(display);
        }
        display.textContent = `X: ${x}, Y: ${y}`;
    }
    async generateCertificates(formData) {
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok && data.files) {
                // Convert each file to a blob and store in memory
                await Promise.all(data.files.map(async (file) => {
                    try {
                        const fileResponse = await fetch(`/download/${file}`);
                        const blob = await fileResponse.blob();
                        const url = URL.createObjectURL(blob);
                        
                        this.generatedFiles.set(file, {
                            url: url,
                            timestamp: new Date().getTime()
                        });
                    } catch (error) {
                        console.error(`Error processing file ${file}:`, error);
                    }
                }));
    
                document.getElementById('result').innerHTML = `
                    <h3>Certificates generated successfully!</h3>
                    <p>Generated ${data.files.length} certificates.</p>
                    <button id="download">Download All Certificates</button>
                `;
    
                // Add click handler for the download button
                const downloadButton = document.getElementById('download');
                downloadButton.onclick = () => this.downloadCertificates();
                
            } else {
                throw new Error(data.error || 'Failed to generate certificates');
            }
        } catch (error) {
            document.getElementById('result').innerHTML = `
                <div class="error">Error: ${error.message}</div>
            `;
        }
    }
    // New method to handle certificate download (Download all generated certificates)
    downloadCertificates() {
        this.generatedFiles.forEach((fileData, fileName) => {
            const link = document.createElement('a');
            link.href = fileData.url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
    clearTempData() {
        // Revoke all object URLs to free up memory
        this.generatedFiles.forEach(fileData => {
            URL.revokeObjectURL(fileData.url);
        });
        this.generatedFiles.clear();
    }
    getActualValues() {
        if (!this.dragItem) return null;
        
        return {
            fontSize: parseInt(this.dragItem.dataset.actualFontSize) || parseInt(document.getElementById('fontSize').value),
            position: {
                x: parseInt(this.dragItem.dataset.actualX) || parseInt(document.getElementById('positionX').value),
                y: parseInt(this.dragItem.dataset.actualY) || parseInt(document.getElementById('positionY').value)
            }
        };
    }
}

// Initialize the preview functionality
const certificatePreview = new CertificatePreview();

// Add event listener for the download button (now handles downloading all certificates)
document.getElementById('download').addEventListener('click', () => {
    // Assuming the server returns a list of generated certificate files
    const files = ['certificate1.png', 'certificate2.png', 'certificate3.png']; // Replace this with actual file list from response
    certificatePreview.downloadCertificates(files);
});

// Form submission handler
document.getElementById('certificateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const templateFile = document.getElementById('template').files[0];
    const excelFile = document.getElementById('excel').files[0];
    
    if (!templateFile || !excelFile) {
        alert('Please upload both template and Excel file.');
        return;
    }
    
    formData.append('template', templateFile);
    formData.append('excel', excelFile);
    
    const fontFile = document.getElementById('font').files[0];
    if (fontFile) {
        formData.append('font', fontFile);
    }
    
    // Get actual (unscaled) values for submission
    const actualValues = certificatePreview.getActualValues();
    if (actualValues) {
        formData.append('fontSize', actualValues.fontSize);
        formData.append('position', JSON.stringify(actualValues.position));
    }
    
    try {
        // Use the certificate preview's generate method
        await certificatePreview.generateCertificates(formData);
    } catch (error) {
        document.getElementById('result').innerHTML = `
            <div class="error">Error: ${error.message}</div>
        `;
    }
});
