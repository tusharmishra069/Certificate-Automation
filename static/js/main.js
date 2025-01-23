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
            
            // Set the template image and preview text
            preview.innerHTML = `
                <img src="${event.target.result}" alt="Certificate template" id="templateImage">
                <div class="text-preview">${previewText}</div>
            `;

            const img = preview.querySelector('img');
            img.onload = () => {
                this.scale = img.offsetWidth / img.naturalWidth;
                this.initializeDraggable();
                this.updatePreviewFontSize();
                this.updatePosition();
                document.getElementById('uploadPrompt').style.display = 'none';
            };
        };
        reader.readAsDataURL(file);
    }

    initializeDraggable() {
        this.dragItem = document.querySelector('.text-preview');
        this.container = document.querySelector('.template-preview');
        
        if (!this.dragItem || !this.container) return;

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

        const relativeX = Math.round(this.currentX / this.scale);
        const relativeY = Math.round(this.currentY / this.scale);

        // Update position inputs
        document.getElementById('positionX').value = relativeX;
        document.getElementById('positionY').value = relativeY;

        this.updateCoordinatesDisplay(relativeX, relativeY);
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
        this.dragItem.style.fontSize = `${fontSize}px`;
    }

    updatePosition() {
        if (!this.dragItem) return;
        const x = parseInt(document.getElementById('positionX').value) || 0;
        const y = parseInt(document.getElementById('positionY').value) || 0;
        
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

    // New method to handle certificate download (Download all generated certificates)
    downloadCertificates(files) {
        // Create a temporary link to download each file
        files.forEach(file => {
            const link = document.createElement('a');
            link.href = `/static/uploads/${file}`;
            link.download = file;
            link.click();
        });
    }
}

// Initialize the preview functionality
const certificatePreview = new CertificatePreview();

// Add event listener for the download button (now handles downloading all certificates)
document.getElementById('downloadButton').addEventListener('click', () => {
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
    
    formData.append('fontSize', document.getElementById('fontSize').value);
    formData.append('position', JSON.stringify({
        x: parseInt(document.getElementById('positionX').value),
        y: parseInt(document.getElementById('positionY').value)
    }));
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('result').innerHTML = `
                <h3>Certificates generated successfully!</h3>
                <p>Generated ${data.files.length} certificates.</p>
                <button id="downloadButton">Download All Certificates</button>
            `;

            // Attach the files array to the download button's click handler
            document.getElementById('downloadButton').addEventListener('click', () => {
                certificatePreview.downloadCertificates(data.files);
            });
        } else {
            throw new Error(data.error || 'Failed to generate certificates');
        }
    } catch (error) {
        document.getElementById('result').innerHTML = `
            <div class="error">Error: ${error.message}</div>
        `;
    }
});
