class Editor {
  constructor(editorEl) {
    this.editor = editorEl;
  }

  exec(cmd, value = null) {
    document.execCommand(cmd, false, value);
  }

  setFontSize(size) {
    this.exec('fontSize', size);
  }

  setColor(color) {
    this.exec('foreColor', color);
  }

  setHilite(color) {
    this.exec('hiliteColor', color);
  }

  insertLink(url) {
    this.exec('createLink', url);
  }

  insertImage(url) {
    const img = document.createElement('img');
    img.src = url;
    img.style.width = '300px'; // default width
    img.onload = () => this.editor.appendChild(img);
  }

  insertImageWithOverlay(url) {
    const container = document.createElement('div');
    container.classList.add('img-text-container');

    const img = document.createElement('img');
    img.src = url;

    const overlay = document.createElement('div');
    overlay.classList.add('overlay-text');
    overlay.contentEditable = true;
    overlay.innerText = 'Your Text Here';

    container.appendChild(img);
    container.appendChild(overlay);
    this.editor.appendChild(container);

    // Focus overlay so user can type immediately
    overlay.focus();
  }

  insertTable(rows, cols) {
    let table = '<table border="1">';
    for (let r = 0; r < rows; r++) {
      table += '<tr>';
      for (let c = 0; c < cols; c++) {
        table += '<td>&nbsp;</td>';
      }
      table += '</tr>';
    }
    table += '</table>';
    this.editor.innerHTML += table;
  }

  clearFormatting() {
    this.exec('removeFormat');
  }

  reset() {
    this.editor.innerHTML = '';
    localStorage.removeItem('editorContent');
  }
}

class Exporter {
  constructor(editor, titleEl, authorEl) {
    this.editor = editor;
    this.titleEl = titleEl;
    this.authorEl = authorEl;
  }

  buildDocHtml() {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${this.titleEl.value}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 20px; }
            .img-text-container { position: relative; display: inline-block; max-width: 100%; }
            .img-text-container img { width: 100%; height: auto; display: block; }
            .overlay-text {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              background: rgba(0,0,0,0.6);
              padding: 8px 12px;
              border-radius: 6px;
              text-align: center;
              min-width: 100px;
            }
          </style>
        </head>
        <body>
          <h1>${this.titleEl.value}</h1>
          <h3>By ${this.authorEl.value}</h3>
          ${this.editor.innerHTML}
        </body>
      </html>`;
  }

  exportDoc() {
    const html = this.buildDocHtml();
    const blob = new Blob([html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.titleEl.value || 'document'}.doc`;
    a.click();
  }

  exportPDF() {
    const html = this.buildDocHtml();
    const opt = {
      margin:       10,
      filename:     `${this.titleEl.value || 'document'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(html).set(opt).save();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const editor = new Editor(document.getElementById('editor'));
  const exporter = new Exporter(
    document.getElementById('editor'),
    document.getElementById('docTitle'),
    document.getElementById('docAuthor')
  );

  // Load autosaved content
  const saved = localStorage.getItem('editorContent');
  if (saved) {
    editor.editor.innerHTML = saved;
  }

  // Autosave
  setInterval(() => {
    localStorage.setItem('editorContent', editor.editor.innerHTML);
  }, 3000);

  // Toolbar commands
  document.querySelectorAll('#toolbar [data-cmd]').forEach(btn => {
    btn.addEventListener('click', () => editor.exec(btn.dataset.cmd));
  });
  document.getElementById('headings').addEventListener('change', e =>
    editor.exec('formatBlock', e.target.value)
  );
  document.getElementById('fontSize').addEventListener('change', e =>
    editor.setFontSize(e.target.value)
  );
  document.getElementById('fontColor').addEventListener('input', e =>
    editor.setColor(e.target.value)
  );
  document.getElementById('hiliteColor').addEventListener('input', e =>
    editor.setHilite(e.target.value)
  );

  document.getElementById('insertLinkBtn').addEventListener('click', () => {
    const url = prompt('Enter link URL:');
    if (url) editor.insertLink(url);
  });

  document.getElementById('insertImgBtn').addEventListener('click', () => {
    const url = document.getElementById('imgURL').value;
    if (url) editor.insertImage(url);
  });

  document.getElementById('insertOverlayBtn').addEventListener('click', () => {
    const url = document.getElementById('imgURL').value;
    if (url) editor.insertImageWithOverlay(url);
  });

  document.getElementById('imgFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => editor.insertImage(reader.result);
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('insertTableBtn').addEventListener('click', () => {
    const rows = parseInt(document.getElementById('tableRows').value);
    const cols = parseInt(document.getElementById('tableCols').value);
    if (rows && cols) editor.insertTable(rows, cols);
  });

  document.getElementById('clearFormat').addEventListener('click', () =>
    editor.clearFormatting()
  );
  document.getElementById('resetContent').addEventListener('click', () =>
    editor.reset()
  );

  document.getElementById('copyPlain').addEventListener('click', () => {
    navigator.clipboard.writeText(editor.editor.innerText);
    alert('Copied plain text!');
  });
  document.getElementById('copyHtml').addEventListener('click', () => {
    navigator.clipboard.writeText(editor.editor.innerHTML);
    alert('Copied HTML!');
  });

  document.getElementById('previewBtn').addEventListener('click', () => {
    const previewWindow = document.getElementById('previewWindow');
    previewWindow.innerHTML = exporter.buildDocHtml();
    document.getElementById('previewModal').style.display = 'flex';
  });

  document.getElementById('closePreview').addEventListener('click', () => {
    document.getElementById('previewModal').style.display = 'none';
  });

  document.getElementById('exportPdf').addEventListener('click', () =>
    exporter.exportPDF()
  );
  document.getElementById('exportDoc').addEventListener('click', () =>
    exporter.exportDoc()
  );

  document.getElementById('toggleTheme').addEventListener('click', () =>
    document.body.classList.toggle('dark')
  );
});
