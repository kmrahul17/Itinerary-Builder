import html2pdf from 'html2pdf.js'

export function generatePdfFromElement(element, filename, opts = {}){
  const defaultOpts = {
    margin:       0.2,
    filename:     filename || 'itinerary.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  }
  const final = Object.assign({}, defaultOpts, opts)
  return html2pdf().set(final).from(element).save()
}
