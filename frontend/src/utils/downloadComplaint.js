import { jsPDF } from 'jspdf';

const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

/**
 * Downloads a complaint as a beautifully formatted PDF report.
 */
export const downloadComplaint = async (complaint) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = 25;

  const statusLabel = (s) =>
    s ? s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : '—';

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = 20;
      addPageHeaderFooter();
    }
  };

  const addPageHeaderFooter = () => {
    // Top header
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('HU Campus Guard - Confidential Complaint Report', margin, 12);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin - 10, 12);
  };

  const addDivider = (color = [224, 224, 224]) => {
    checkPageBreak(5);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;
  };

  // Setup initial page header
  addPageHeaderFooter();

  // Header Banner
  doc.setFillColor(26, 35, 126); // Primary dark blue
  doc.rect(margin, y, contentWidth, 12, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('HU CAMPUS GUARD', margin + 5, y + 8);
  y += 18;

  // Complaint Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 35, 126);
  const titleLines = doc.splitTextToSize(complaint.title || 'No Title', contentWidth);
  doc.text(titleLines, margin, y);
  y += (titleLines.length * 6) + 6;

  // Metadata block
  doc.setFontSize(10);
  
  const col1X = margin;
  const col2X = margin + (contentWidth / 2);

  const printMetaRow = (label1, val1, label2, val2) => {
    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(label1 + ':', col1X, y);
    if (label2) {
      doc.text(label2 + ':', col2X, y);
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(66, 66, 66);
    
    const val1Lines = doc.splitTextToSize(String(val1 || '—'), (contentWidth / 2) - 35);
    doc.text(val1Lines, col1X + 32, y);
    
    let val2Lines = [];
    if (label2) {
      val2Lines = doc.splitTextToSize(String(val2 || '—'), (contentWidth / 2) - 35);
      doc.text(val2Lines, col2X + 32, y);
    }
    
    const rowHeight = Math.max(val1Lines.length, label2 ? val2Lines.length : 1) * 5;
    y += rowHeight + 1;
  };

  printMetaRow('Reference No', complaint.referenceNumber || 'N/A', 'Status', statusLabel(complaint.status));
  printMetaRow('Category', statusLabel(complaint.category), 'Priority', statusLabel(complaint.priority));
  printMetaRow('Location', complaint.location || 'N/A', 'Incident Date', complaint.incidentDate ? new Date(complaint.incidentDate).toLocaleDateString() : 'N/A');
  printMetaRow('Submitted At', new Date(complaint.createdAt).toLocaleString(), 'Anonymous', complaint.isAnonymous ? 'Yes' : 'No');

  if (!complaint.isAnonymous && complaint.submittedBy) {
    printMetaRow('Submitted By', complaint.submittedBy.name, 'Email/Roll', complaint.submittedBy.email || complaint.submittedBy.rollNumber || 'N/A');
  }
  
  if (complaint.assignedTo) {
    printMetaRow('Assigned To', complaint.assignedTo.name, 'Assigned Role', 'Proctor');
  }

  y += 3;
  addDivider();

  // Description Section
  checkPageBreak(15);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 35, 126);
  doc.text('Description', margin, y);
  y += 6;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(66, 66, 66);
  const descLines = doc.splitTextToSize(complaint.description || '', contentWidth);
  descLines.forEach(line => {
    checkPageBreak(5);
    doc.text(line, margin, y);
    y += 5;
  });
  y += 3;

  // Evidence Section
  if (complaint.evidence && complaint.evidence.length > 0) {
    addDivider();
    checkPageBreak(15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(`Evidence Files (${complaint.evidence.length})`, margin, y);
    y += 6;

    for (let index = 0; index < complaint.evidence.length; index++) {
      const ev = complaint.evidence[index];
      const label = ev.originalName || `Evidence ${index + 1}`;
      const url = ev.url || '';
      const isImg = ev.resourceType === 'image' || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      const typeLabel = isImg ? '[Image]' : ev.resourceType === 'video' ? '[Video]' : '[File]';

      const nameText = `${index + 1}. ${typeLabel} ${label}`;
      const urlText = url;

      const nameLines = doc.splitTextToSize(nameText, contentWidth - 5);
      const urlLines = doc.splitTextToSize(urlText, contentWidth - 10);

      let needed = (nameLines.length + urlLines.length) * 5 + 3;
      if (isImg) {
        needed += 45; // Reserve space for the image (e.g. 40mm height + margins)
      }
      checkPageBreak(needed);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      nameLines.forEach(line => {
        doc.text(line, margin + 2, y);
        y += 4.5;
      });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(57, 73, 171); // link-blue
      urlLines.forEach(line => {
        doc.text(line, margin + 6, y);
        y += 4.5;
      });
      y += 1.5;

      if (isImg && url) {
        try {
          const img = await loadImage(url);
          // Calculate display dimensions keeping aspect ratio within 60mm x 40mm box
          let w = img.width;
          let h = img.height;
          const maxW = 60;
          const maxH = 40;
          const ratio = w / h;
          if (w > maxW) {
            w = maxW;
            h = w / ratio;
          }
          if (h > maxH) {
            h = maxH;
            w = h * ratio;
          }
          doc.addImage(img, 'JPEG', margin + 6, y, w, h);
          y += h + 4;
        } catch (e) {
          console.error("Failed to load image for PDF:", e);
          // If image fails to load, show a fallback placeholder box in the PDF
          doc.setFillColor(245, 245, 245);
          doc.rect(margin + 6, y, 60, 30, 'F');
          doc.setDrawColor(220, 220, 220);
          doc.rect(margin + 6, y, 60, 30, 'D');
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text('[Image could not be loaded]', margin + 12, y + 15);
          y += 34;
        }
      }
    }
    y += 3;
  }

  // Resolution Section
  if (complaint.resolution) {
    addDivider([46, 125, 50]); // Green divider for resolution
    checkPageBreak(15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50); // Green
    doc.text('Resolution Detail', margin, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(66, 66, 66);
    const resLines = doc.splitTextToSize(complaint.resolution, contentWidth);
    resLines.forEach(line => {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 5;
    });
    
    if (complaint.resolvedAt) {
      checkPageBreak(6);
      doc.setFont('helvetica', 'bold');
      doc.text('Resolved At:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(complaint.resolvedAt).toLocaleString(), margin + 25, y);
      y += 6;
    }
    y += 3;
  }

  // Timeline / Status History
  if (complaint.statusHistory && complaint.statusHistory.length > 0) {
    addDivider();
    checkPageBreak(15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('Status Timeline', margin, y);
    y += 6;

    complaint.statusHistory.forEach((h, index) => {
      const stepText = `${index + 1}. ${statusLabel(h.status)} — ${new Date(h.changedAt || h.createdAt).toLocaleString()}`;
      const noteText = h.note ? `Note: ${h.note}` : '';
      
      const stepLines = doc.splitTextToSize(stepText, contentWidth - 5);
      const noteLines = noteText ? doc.splitTextToSize(noteText, contentWidth - 10) : [];
      
      const needed = (stepLines.length + noteLines.length) * 5 + 2;
      checkPageBreak(needed);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      
      stepLines.forEach(line => {
        doc.text(line, margin + 2, y);
        y += 4.5;
      });

      if (noteText) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(120, 120, 120);
        noteLines.forEach(line => {
          doc.text(line, margin + 6, y);
          y += 4.5;
        });
      }
      y += 1.5;
    });
    y += 3;
  }

  // Comments Timeline
  const publicComments = (complaint.comments || []).filter(c => !c.isInternal);
  if (publicComments.length > 0) {
    addDivider();
    checkPageBreak(15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('Updates & Comments', margin, y);
    y += 6;

    publicComments.forEach((c) => {
      const authorInfo = `[${statusLabel(c.authorRole)}] ${c.author?.name || 'User'} — ${new Date(c.createdAt).toLocaleString()}`;
      const commentText = c.text || '';

      const authorLines = doc.splitTextToSize(authorInfo, contentWidth - 5);
      const commentLines = doc.splitTextToSize(commentText, contentWidth - 10);
      
      const needed = (authorLines.length + commentLines.length) * 5 + 2;
      checkPageBreak(needed);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      authorLines.forEach(line => {
        doc.text(line, margin + 2, y);
        y += 4.5;
      });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      commentLines.forEach(line => {
        doc.text(line, margin + 6, y);
        y += 4.5;
      });
      y += 2;
    });
    y += 3;
  }

  // Document Footer
  addDivider();
  checkPageBreak(15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(140, 140, 140);
  doc.text('This is a computer-generated official document from HU Campus Guard.', margin, y);
  y += 4;
  doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);

  // Save PDF
  doc.save(`Complaint-${complaint.referenceNumber || complaint._id}.pdf`);
};

/**
 * Downloads a list of complaints as a CSV file.
 */
export const downloadComplaintsCSV = (complaints, filename = 'complaints') => {
  const headers = ['Ref #', 'Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Assigned To', 'Date'];
  const rows = complaints.map((c) => [
    c.referenceNumber,
    `"${(c.title || '').replace(/"/g, '""')}"`,
    c.category,
    c.priority,
    c.status,
    c.isAnonymous ? 'Anonymous' : (c.submittedBy?.name || '—'),
    c.assignedTo?.name || 'Unassigned',
    new Date(c.createdAt).toLocaleDateString(),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

