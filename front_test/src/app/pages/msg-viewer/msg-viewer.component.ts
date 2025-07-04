import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScConversionService } from '../../services/scconversion.service';

@Component({
  selector: 'app-msg-viewer',
  templateUrl: './msg-viewer.component.html',
  styleUrls: ['./msg-viewer.component.scss']
})
export class MsgViewerComponent implements OnInit {
  mtMsg: string | null = null;
  mxMsg: string | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scConversionService: ScConversionService
  ) {}

  ngOnInit(): void {
    this.loadMessage();
  }

  loadMessage(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No message ID provided.';
      this.isLoading = false;
      return;
    }

    this.scConversionService.getFileById(+id).subscribe({
      next: (file) => {
        this.mtMsg = file.msgOrigMT || null;
        this.mxMsg = file.msgOrigMX || null;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load message content.';
        this.isLoading = false;
        console.error('Error fetching message:', err);
      }
    });
  }

  openMsgOrig(): void {
    const newWindow = window.open();
    if (newWindow) {
      const htmlContent = `
      <html>
        <head>
          <title>Message Content</title>
          <style>
            body {
              font-family: monospace;
              margin: 0;
              padding: 10px;
              background: #f8f9fa;
              height: 100vh;
              box-sizing: border-box;
            }
            .container {
              display: flex;
              gap: 20px;
              height: 100%;
              box-sizing: border-box;
            }
            .msg-box {
              flex: 1;
              overflow: auto;
              white-space: pre-wrap;
              background: #fff;
              border: 1px solid #ddd;
              padding: 15px;
              box-sizing: border-box;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 6px;
              font-size: 1.1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="msg-box">
              <div class="header">MT Message</div>
              ${this.mtMsg ? this.escapeHtml(this.mtMsg) : '<i>No MT message content available.</i>'}
            </div>
            <div class="msg-box">
              <div class="header">MX Message</div>
              ${this.mxMsg ? this.escapeHtml(this.mxMsg) : '<i>No MX message content available.</i>'}
            </div>
          </div>
        </body>
      </html>
      `;
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } else {
      alert('Popup blocked! Please allow popups for this site to view the message.');
    }
  }

  // Helper function to escape HTML special characters
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  closeViewer(): void {
    this.router.navigate(['/table']);
  }
}