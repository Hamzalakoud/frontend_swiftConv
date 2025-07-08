import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-convertion',
  templateUrl: './convertion.component.html',
  styleUrls: ['./convertion.component.scss']
})
export class ConvertionComponent {
  @ViewChild('fileInputMT') fileInputMT!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputMX') fileInputMX!: ElementRef<HTMLInputElement>;

  mtFileName: string | null = null;  // Store MT file name
  mxFileName: string | null = null;  // Store MX file name
  isDragOver = false;
  droppedFileMT: File | null = null;
  droppedFileMX: File | null = null;

  // Handle drag over for both MT and MX
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  // Handle dropped file for MT and MX
  onDrop(event: DragEvent, type: 'mt' | 'mx') {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (type === 'mt') {
        this.readFile(file, 'mt');
      } else {
        this.readFile(file, 'mx');
      }
    }
  }

  // Handle file selection for MT and MX
  onFileSelected(event: Event, type: 'mt' | 'mx') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      if (type === 'mt') {
        this.readFile(file, 'mt');
      } else {
        this.readFile(file, 'mx');
      }
    }
  }

  // Read file content for both MT and MX
  readFile(file: File, type: 'mt' | 'mx') {
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'mt') {
        this.mtFileName = file.name;
        this.droppedFileMT = file;
        this.mtMsg = reader.result as string;
      } else {
        this.mxFileName = file.name;
        this.droppedFileMX = file;
        this.mxMsg = reader.result as string;
      }
    };
    reader.readAsText(file);
  }

  // Upload MT or MX file to the backend
  uploadFile(type: 'mt' | 'mx') {
    const file = type === 'mt' ? this.droppedFileMT : this.droppedFileMX;
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file, file.name);

    const token = localStorage.getItem('authToken');

    const apiUrl = type === 'mt' ? 'http://localhost:8080/api/upload-mt' : 'http://localhost:8080/api/upload-mx';

    fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
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

  mtMsg: string | null = null;  // MT message content
  mxMsg: string | null = null;  // MX message content
}
