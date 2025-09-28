class Editor {
  constructor(editorEl) {
    this.editor = editorEl;
  }

  exec(cmd, value = null) {
    document.execCommand(cmd, false, value);
  }

  setFontFamily(font) {
    this.exec('fontName', font);
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
    this.exec('insertImage', url);
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
  }
}

class Exporter {
  constructor(editor, titleEl, authorEl) {
    this.editor = editor;
    this.titleEl = titleEl;
    this.authorEl = authorEl;
  }

  buildDocHtml() {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${this.titleEl.value}</title></head><body><h1>${this.titleEl.value}</h1><h3>By ${this.authorEl.value}</h3>${this.editor.innerHTML}</body></html>`;
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
    const element = document.createElement('div');
    element.innerHTML = html;
    html2pdf().from(element).set({ filename: `${this.titleEl.value || 'document'}.pdf` }).save();
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const editor = new Editor(document.getElementById('editor'));
  const exporter = new Exporter(
    document.getElementById('editor'),
    document.getElementById('docTitle'),
    document.getElementById('docAuthor')
  );

  // Toolbar
  document.querySelectorAll('#toolbar [data-cmd]').forEach(btn => {
    btn.addEventListener('click', () => editor.exec(btn.dataset.cmd));
  });

  document.getElementById('headings').addEventListener('change', e => editor.exec('formatBlock', e.target.value));
  document.getElementById('fontSize').addEventListener('change', e => editor.setFontSize(e.target.value));
  document.getElementById('fontColor').addEventListener('input', e => editor.setColor(e.target.value));
  document.getElementById('hiliteColor').addEventListener('input', e => editor.setHilite(e.target.value));

  document.getElementById('insertLinkBtn').addEventListener('click', () => {
    const url = prompt('Enter link URL:');
    if (url) editor.insertLink(url);
  });

  document.getElementById('insertImgBtn').addEventListener('click', () => {
    const url = document.getElementById('imgURL').value;
    if (url) editor.insertImage(url);
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
    const rows = document.getElementById('tableRows').value;
    const cols = document.getElementById('tableCols').value;
    if (rows && cols) editor.insertTable(rows, cols);
  });

  document.getElementById('clearFormat').addEventListener('click', () => editor.clearFormatting());
  document.getElementById('resetContent').addEventListener('click', () => editor.reset());

  document.getElementById('copyPlain').addEventListener('click', () => {
    navigator.clipboard.writeText(editor.editor.innerText);
    alert('Copied plain text!');
  });

  document.getElementById('copyHtml').addEventListener('click', () => {
    navigator.clipboard.writeText(editor.editor.innerHTML);
    alert('Copied HTML!');
  });

  document.getElementById('previewBtn').addEventListener('click', () => {
    document.getElementById('previewWindow').innerHTML = exporter.buildDocHtml();
    document.getElementById('previewModal').style.display = 'flex';
  });

  document.getElementById('closePreview').addEventListener('click', () => {
    document.getElementById('previewModal').style.display = 'none';
  });

  document.getElementById('exportDoc').addEventListener('click', () => exporter.exportDoc());
  document.getElementById('exportPdf').addEventListener('click', () => exporter.exportPDF());
});