// Simple HTML to PDF generator using browser's print functionality
export const generatePDF = (title: string, content: string) => {
  // Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error('Failed to create PDF');
  }

  // Write content to iframe
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          h1 {
            color: #1a1a1a;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 10px;
          }
          h2 {
            color: #2a2a2a;
            margin-top: 30px;
          }
          h3 {
            color: #3a3a3a;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #f0f0f0;
            border-radius: 4px;
            font-size: 14px;
            margin: 4px 0;
          }
          ul {
            padding-left: 20px;
          }
          li {
            margin: 8px 0;
          }
          @media print {
            body { margin: 0; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p><small>Generated on ${new Date().toLocaleString()}</small></p>
        ${content}
      </body>
    </html>
  `);
  iframeDoc.close();

  // Wait for content to load then print
  setTimeout(() => {
    iframe.contentWindow?.print();
    
    // Clean up after print dialog closes
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 100);
  }, 250);
};
