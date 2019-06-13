// @see https://github.com/hou2zi0/mei-doc-link
if (typeof MEI_DOC_LINK === 'undefined') MEI_DOC_LINK = `xml mei-doc-link`;
if (typeof MEI_DOC_LINK_CONFIG === 'undefined') MEI_DOC_LINK_CONFIG = {};

let codeList;

if (MEI_DOC_LINK_CONFIG.querySelectorAll) {
  codeList = document.querySelectorAll(MEI_DOC_LINK);
} else {
  codeList = document.getElementsByClassName(MEI_DOC_LINK);
}


function teiDocLinks() {

  // elementReplacer function (includes attribute attributeReplacer function declaration)
  function elementReplacer(match, p1, p2, p3, p4, offset, string) {
    const frontDelimiters = (p1) ? p1 : "";
    const element = (p2) ? p2 : "";
    const attribute = (p3) ? p3 : "";
    const backDelimiter = (p4) ? p4 : "";

    // ATTRIBUTES & VALUES
    const regexAttr = `([-A-Za-z:.]*?)="(.*?)"`;
    const regularExpressionAttr = new RegExp(regexAttr, 'g');

    // Replace function for RegEx maps attribute names to respective TEI documentation pages
    function attributeReplacer(match, p1, p2, offset, string) {

      let attribute = p1;
      let curr_element = element;

      const value = p2;
      return `<span class="attribute">${attribute}</span><span class="delimiters">=</span><span class="value">"${value}"</span>`;
    }

    const newSnippetAttr = attribute.replace(regularExpressionAttr, attributeReplacer);

    return `<span class='delimiters'>&lt;${frontDelimiters}</span><span class='element'><a class='mei-doc-link' href='https://music-encoding.org/guidelines/v4/elements/${element.toLowerCase()}.html'>${element}</a>${newSnippetAttr}</span><span class='delimiters'>${backDelimiter}&gt;</span>`;
  }


  // PROCESSING of found node list
  Array.from(codeList)
    .forEach((node) => {
      const text = node.textContent.replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      // ELEMENT NAMES
      const regexEl = `&lt;([\/\?]{0,1})([-A-Za-z:]*?)(\\s.*?.*?){0,1}([\/\?]{0,1})&gt;`;
      const regularExpressionEl = new RegExp(regexEl, 'g');
      // for elementReplacer function declaration and attributeReplacer function declaration see above
      const newSnippetEl = text.replace(regularExpressionEl, elementReplacer);
      // COMMENT STRINGS
      const regexCommStr = `(&lt;\!)(.*?)(&gt;)`;
      const regularExpressionCommStr = new RegExp(regexCommStr, 'g');
      const newSnippetCommStr = newSnippetEl.replace(regularExpressionCommStr, '<span class="comment-string">$1$2$3</span>');

      let snippet;

      if (MEI_DOC_LINK_CONFIG.lineNumbering && node.parentNode.nodeName == 'PRE') {
        snippet = newSnippetCommStr.split('\n')
          .filter((line) => {
            return line.length > 0
          })
          .map((line, index) => {
            return `<span class="line-numbering">${index+1}</span><span class="code-line">${line}</span>`;
          })
          .join('\n');
        node.parentNode.setAttribute('style', 'padding: 10px 15px 10px 35px;');
      } else {
        snippet = newSnippetCommStr;
        if (node.getAttribute('class')
          .includes('linenumbers')) {
          node.parentNode.setAttribute('style', 'padding: 0px 15px 0px 35px;');
        }
      }
      node.innerHTML = snippet;
    });
};

teiDocLinks();