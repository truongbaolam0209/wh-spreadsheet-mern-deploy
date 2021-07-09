import { PDFViewer } from '@react-pdf/renderer';
import React from 'react';
import ExportPdf from './ExportPdf';



const PrintPdf = ({ pdfContent }) => {
   return (
      <>
         <PDFViewer width={800}>
            <ExportPdf pdfContent={pdfContent} />
         </PDFViewer>
      </>
   );
};

export default PrintPdf;


