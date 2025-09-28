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