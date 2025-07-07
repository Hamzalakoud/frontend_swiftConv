import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-mx-mt-converter',
  templateUrl: './mx-mt-converter.component.html',
  styleUrls: ['./mx-mt-converter.component.scss']
})
export class MxMtConverterComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  mxMsg: string | null = null;
  mtMsg: string | null = null;
  isDragOver = false;
  originalFileName = 'mx-message.txt';

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
      this.mxMsg = reader.result as string;
      this.simulateConversion(this.mxMsg);
    };
    reader.readAsText(file);
  }

  simulateConversion(mxContent: string) {
    // Simple simulation: wrap MX content with MT header/footer
    this.mtMsg = `<!-- Simulated MT Message Start -->\n${mxContent}\n<!-- Simulated MT Message End -->`;
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
