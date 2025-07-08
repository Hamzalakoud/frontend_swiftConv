import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-mx-mt-converter',
  templateUrl: './mt-mx-converter.component.html',
  styleUrls: ['./mt-mx-converter.component.scss']
})
export class MtMxConverterComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  mtMsg: string | null = null;
  mxMsg: string | null = null;
  isDragOver = false;
  originalFileName = 'mt-message.txt';
  droppedFile: File | null = null;

  // Handle drag and drop UI state
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files.length) {
      this.readFile(event.dataTransfer.files[0]);
    }
  }

  // Manual file selection
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.readFile(input.files[0]);
    }
  }

  // Read and preview file content
  readFile(file: File) {
    this.originalFileName = file.name;
    this.droppedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.mtMsg = reader.result as string;
      this.simulateConversion(this.mtMsg);
    };
    reader.readAsText(file);
  }

  // Simulate MT to MX conversion
  simulateConversion(mtContent: string) {
    this.mxMsg = `<!-- Simulated MX Message Start -->\n${mtContent}\n<!-- Simulated MX Message End -->`;
  }

  // Upload MT file to backend
uploadFile() {
  if (!this.droppedFile) return;

  const formData = new FormData();
  formData.append('file', this.droppedFile, this.droppedFile.name);

  const token = localStorage.getItem('authToken');  // Get token from localStorage or sessionStorage

  fetch('http://localhost:8080/api/upload-mt', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`  // Add the token to the Authorization header
    }
  })
    .then(response => {
      if (response.ok) {
        alert('✅ Fichier MT envoyé avec succès.');
      } else {
        alert('❌ Erreur lors de l\'envoi du fichier.');
      }
    })
    .catch(error => {
      console.error('Upload failed:', error);
      alert('❌ Une erreur est survenue pendant l\'envoi.');
    });
}


  // Optional: Download converted MX file
  downloadFile(content: string | null, filename: string) {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
