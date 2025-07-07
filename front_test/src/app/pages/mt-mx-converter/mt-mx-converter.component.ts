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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.readFile(input.files[0]);
    }
  }

  readFile(file: File) {
    this.originalFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.mtMsg = reader.result as string;
      this.simulateConversion(this.mtMsg);
    };
    reader.readAsText(file);
  }

  simulateConversion(mtContent: string) {
    // Simple simulation: wrap MT content with MX header/footer
    this.mxMsg = `<!-- Simulated MX Message Start -->\n${mtContent}\n<!-- Simulated MX Message End -->`;
  }

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
