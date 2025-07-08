import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-convertion',
  templateUrl: './convertion.component.html',
  styleUrls: ['./convertion.component.scss']
})
export class ConvertionrComponent {
  @ViewChild('fileInputMT') fileInputMT!: ElementRef<HTMLInputElement>; // For MT files
  @ViewChild('fileInputMX') fileInputMX!: ElementRef<HTMLInputElement>; // For MX files

  // State variables for both MT and MX messages
  mtMsg: string | null = null;  // MT message content
  mxMsg: string | null = null;  // MX message content
  isDragOver = false;           // Dragover state for UI
  originalFileNameMT = 'mt-message.txt'; // Default MT file name
  originalFileNameMX = 'mx-message.txt'; // Default MX file name
  droppedFileMT: File | null = null; // MT file that is dropped or selected
  droppedFileMX: File | null = null; // MX file that is dropped or selected

  // Handle drag and drop UI state for both MT and MX
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  // Handle dropped file for MT or MX
  onDrop(event: DragEvent, type: 'mt' | 'mx') {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files.length) {
      this.readFile(event.dataTransfer.files[0], type);
    }
  }

  // Handle manual file selection for MT or MX
  onFileSelected(event: Event, type: 'mt' | 'mx') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.readFile(input.files[0], type);
    }
  }

  // Read and preview the file (either MT or MX)
  readFile(file: File, type: 'mt' | 'mx') {
    if (type === 'mt') {
      this.originalFileNameMT = file.name;
      this.droppedFileMT = file;
    } else {
      this.originalFileNameMX = file.name;
      this.droppedFileMX = file;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result as string;
      if (type === 'mt') {
        this.mtMsg = fileContent;
        this.simulateConversion(this.mtMsg, 'mt');
      } else {
        this.mxMsg = fileContent;
        this.simulateConversion(this.mxMsg, 'mx');
      }
    };
    reader.readAsText(file);
  }

  // Simulate MT to MX or MX to MT conversion
  simulateConversion(content: string, type: 'mt' | 'mx') {
    if (type === 'mt') {
      // MT to MX conversion simulation
      this.mxMsg = `<!-- Simulated MX Message Start -->\n${content}\n<!-- Simulated MX Message End -->`;
    } else if (type === 'mx') {
      // MX to MT conversion simulation
      this.mtMsg = `<!-- Simulated MT Message Start -->\n${content}\n<!-- Simulated MT Message End -->`;
    }
  }

  // Upload MT or MX file to backend based on file type
  uploadFile(type: 'mt' | 'mx') {
    let droppedFile = type === 'mt' ? this.droppedFileMT : this.droppedFileMX;
    if (!droppedFile) return;

    const formData = new FormData();
    formData.append('file', droppedFile, droppedFile.name);

    const token = localStorage.getItem('authToken');  // Get token from localStorage or sessionStorage

    const apiUrl = type === 'mt' ? 'http://localhost:8080/api/upload-mt' : 'http://localhost:8080/api/upload-mx';

    fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`  // Add the token to the Authorization header
      }
    })
      .then(response => {
        if (response.ok) {
          alert(`✅ Fichier ${type === 'mt' ? 'MT' : 'MX'} envoyé avec succès.`);
        } else {
          alert(`❌ Erreur lors de l'envoi du fichier ${type === 'mt' ? 'MT' : 'MX'}.`);
        }
      })
      .catch(error => {
        console.error('Upload failed:', error);
        alert('❌ Une erreur est survenue pendant l\'envoi.');
      });
  }

  // Download the converted file (either MT or MX)
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
