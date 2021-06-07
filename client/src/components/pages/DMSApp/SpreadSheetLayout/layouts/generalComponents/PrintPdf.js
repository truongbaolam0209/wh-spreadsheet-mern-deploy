import { BlobProvider, Document, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';
import React from 'react';
import { getInfoValueFromRfaData } from '../pageSpreadsheet/CellRFA';
import { getFileNameFromLinkResponse } from '../pageSpreadsheet/PanelSetting';




const Doc = ({ pdfContent }) => {
   const {
      refNumberText, listRecipientTo, listRecipientCc, isCostImplication, isTimeExtension,
      requestedBy, signatureBy, conversationAmong, textEmailTitle, dateConversation, timeConversation, description,
      filesPdfDrawing, dwgsImportFromRFA, dateReplyForSubmitForm, projectName, listConsultantMustReply
   } = pdfContent;


   let dataTableInput = [];
   filesPdfDrawing.map((file, i) => {
      dataTableInput.push([
         i + 1,
         'Drawing',
         file.name
      ]);
   });
   dwgsImportFromRFA.map((dwg, i) => {
      const link = getInfoValueFromRfaData(dwg, 'submission', 'drawing');
      dataTableInput.push([
         i + 1 + filesPdfDrawing.length,
         'Submitted RFA',
         getFileNameFromLinkResponse(link)
      ]);
   });


   return (
      <Document>
         <Page size='A4' style={{ fontSize: 11, padding: 12 }}>
            <View style={{ flexDirection: 'row', marginBottom: 15, paddingBottom: 5, borderBottom: '1px solid grey' }}>
               <View style={{ width: '9%' }}>
                  <Text>To</Text>
                  <Text>Attention</Text>
                  <Text>Project</Text>
               </View>

               <View style={{ width: '53%' }}>
                  <Text>{`: ${(listConsultantMustReply || []).join(', ')}`}</Text>
                  <Text>{`: `}</Text>
                  <Text>{`: ${projectName}`}</Text>
               </View>

               <View style={{ width: '18%' }}>
                  <Text>Ref. No</Text>
                  <Text>Date Submission</Text>
                  <Text>Date Reply</Text>
               </View>
               <View style={{ width: '20%' }}>
                  <Text>{`: ${refNumberText}`}</Text>
                  <Text>{`: ${moment(new Date()).format('DD/MM/YY')}`}</Text>
                  <Text>{`: ${moment(dateReplyForSubmitForm).format('DD/MM/YY')}`}</Text>
               </View>
            </View>


            <View style={{ flexDirection: 'row', marginBottom: 15, paddingBottom: 5, borderBottom: '1px solid grey' }}>
               <Text>Subject</Text>
               <Text>{`: ${textEmailTitle}`}</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
               <Text>Conversation Among</Text>
               <Text>{`: ${conversationAmong}`}</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
               <Text>Date</Text>
               <Text style={{ marginRight: 30 }}>{`: ${moment(dateConversation).format('DD/MM/YY')}`}</Text>
               <Text>Time</Text>
               <Text>{`: ${moment(timeConversation).format('HH: mm')}`}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 15, paddingBottom: 5, borderBottom: '1px solid grey' }}>
               <Text>Details</Text>
               <Text>{`: ${description}`}</Text>
            </View>


            <TableDrawings
               th
               col={['5%', '20%', '75%']}
               children={[
                  ['', 'Type', 'File'],
                  ...dataTableInput
               ]}
            />
         </Page>
      </Document>
   );
};


const PrintPdf = ({ pdfContent, getPdfOutputFile }) => {
   return (
      <>
         <BlobProvider document={<Doc pdfContent={pdfContent} />}>
            {({ blob, url, loading, error }) => {
               getPdfOutputFile(blob);
               return null;
            }}
         </BlobProvider>

         {/* <PDFViewer>
            <Doc pdfContent={pdfContent} />
         </PDFViewer> */}
      </>
   );
};


export default PrintPdf;




const stylesTable = StyleSheet.create({
   em: {
      fontStyle: 'bold'
   },
   table: {
      width: '100%',
      border: '1px solid black',
      display: 'flex',
      flexDirection: 'column',
      marginVertical: 1,
      borderCollapse: 'collapse'
   },
   tableRow: {
      display: 'flex',
      flexDirection: 'row',
   },
   cell: {
      border: '1px solid black',
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      // textAlign: 'center',
      flexWrap: 'wrap',
      paddingLeft: 5

   }
});


const TableDrawings = ({ children, col, th }) => (
   <View style={stylesTable.table}>
      {children.map((row, ind) =>
         <View key={ind} style={[stylesTable.tableRow, th && ind === 0 ? stylesTable.em : {}]}>
            {row.map((cell, j) =>
               <View key={j} style={[stylesTable.cell, { width: col[j], height: 20 }]}>
                  {(typeof (cell) === 'string' || typeof (cell) === 'number')
                     ? <Text style={{ height: 15 }}>{cell}</Text>
                     : cell
                  }
               </View>
            )}
         </View>
      )}
   </View>
);