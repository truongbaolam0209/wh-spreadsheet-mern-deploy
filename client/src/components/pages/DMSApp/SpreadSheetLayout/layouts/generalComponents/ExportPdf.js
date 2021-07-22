import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';
import React from 'react';
import { imgLink } from '../../constants';
import robotoBold from '../../constants/Roboto-Bold.ttf';
import robotoRegular from '../../constants/Roboto-Regular.ttf';
import { getInfoValueFromRfaData } from '../pageSpreadsheet/CellRFA';
import { getFileNameFromLinkResponse } from '../pageSpreadsheet/PanelSetting';


Font.register({ family: 'Roboto-Regular', fonts: [{ src: robotoRegular }] });
Font.register({ family: 'Roboto-Bold', fonts: [{ src: robotoBold }] });

const fontStyles = StyleSheet.create({
   fontRegular: { fontFamily: 'Roboto-Regular' },
   fontBold: { fontFamily: 'Roboto-Bold' },
});


const getCompanyFullName = (companies, cmp) => {
   const cmpFound = companies.find(cm => cm.company === cmp && cm.fullName);
   if (cmpFound) return cmpFound.fullName;
   return cmp;
};

const ExportPdf = ({ pdfContent }) => {
   const {
      refNumberText, listRecipientTo, listRecipientCc, isCostImplication, isTimeExtension,
      requestedBy, signaturedBy, conversationAmong, emailTextTitle, dateConversation, timeConversation, description,
      filesPdfDrawing, dwgsImportFromRFA, dateReplyForSubmitForm, projectName, listConsultantMustReply,
      contractSpecification, recipientName,
      proposedSpecification,
      submissionType,
      herewithForDt,
      transmittedForDt,
      pageSheetTypeName,
      companies, contractDrawingNo
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

   dataTableInput = dataTableInput.filter((item, i) => i < 7);



   const formTitle = pageSheetTypeName === 'page-rfam' ? 'Request For Approval Of Material'
      : pageSheetTypeName === 'page-rfi' ? 'Request For Information'
         : pageSheetTypeName === 'page-cvi' ? 'Confirmation of Verbal Instruction'
            : pageSheetTypeName === 'page-dt' ? 'Document Transmittal'
               : pageSheetTypeName === 'page-mm' ? 'Meeting Minutes'
                  : null;


   return (
      <Document>
         <Page size='A4' style={{ fontSize: 9, padding: 12 }}>
            <View style={{ border: '1px solid black', padding: 0, height: '100%', width: '100%', position: 'relative' }}>

               <View style={{
                  flexDirection: 'row', justifyContent: 'space-between',
                  paddingRight: 10, paddingLeft: 10, paddingTop: 10
               }}>
                  <Image src={imgLink.logoWohhup} style={{ width: 90, height: 25, marginRight: 6 }} />
                  <Text style={{ fontSize: 13, ...fontStyles.fontBold, textDecoration: 'underline' }}>{formTitle}</Text>
               </View>

               <View style={{ flexDirection: 'row', padding: 10, paddingBottom: 5, borderBottom: '1px solid black', ...fontStyles.fontRegular }}>
                  <View style={{ width: '68%' }}>
                     <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <Text style={{ width: '9%' }}>To</Text>
                        <Text style={{ width: '91%', ...fontStyles.fontBold, paddingRight: 10, paddingLeft: 5 }}>
                           {`: ${(listConsultantMustReply || []).map(cmp => getCompanyFullName(companies, cmp)).join(', ')}`}
                        </Text>
                     </View>

                     <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: '9%' }}>Project</Text>
                        <Text style={{
                           width: '91%',
                           paddingLeft: 5,
                           marginRight: 20, height: 25
                        }}>{`: ${projectName}`}</Text>
                     </View>
                  </View>

                  <View style={{ width: '13%' }}>
                     <Text style={{ marginBottom: 4 }}>Ref. No</Text>
                     <Text style={{ marginBottom: 4 }}>Date Submission</Text>
                     <Text>Page</Text>
                  </View>
                  <View style={{ width: '19%', ...fontStyles.fontBold }}>
                     <Text style={{ marginBottom: 4 }}>{`: ${refNumberText}`}</Text>
                     <Text style={{ marginBottom: 4 }}>{`: ${moment(new Date()).format('DD/MM/YY')}`}</Text>
                     <Text>: 01/01</Text>
                  </View>
               </View>


               <View style={{ flexDirection: 'row', padding: 10, paddingTop: 5, paddingBottom: 0, borderBottom: '1px solid black', ...fontStyles.fontRegular }}>
                  <Text>Subject : </Text>
                  <Text style={{
                     fontWeight: 'bold',
                     paddingRight: 31,
                     paddingLeft: 5,
                     height: 25,
                     ...fontStyles.fontBold
                  }}>{` ${emailTextTitle}`}</Text>
               </View>

               {pageSheetTypeName === 'page-dt' && (
                  <View style={{ ...fontStyles.fontRegular, padding: 10 }}>
                     <Text>We forward herewith the following :</Text>
                     <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                        <View style={{ width: '34%', paddingRight: 10, paddingLeft: 10, paddingBottom: 5, paddingTop: 5, marginRight: 10 }}>
                           {['Drawings', 'CD', 'Calculations', 'Method Statement'].map((item, i) => (
                              <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                 <Image src={herewithForDt === item ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                 <Text>{item}</Text>
                              </View>
                           ))}
                        </View>
                        <View style={{ width: '33%', paddingRight: 10, paddingLeft: 10, paddingBottom: 5, paddingTop: 5, marginRight: 10 }}>
                           {['Document', 'Programme', 'Specifications', 'Part Prints/Sketches'].map((item, i) => (
                              <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                 <Image src={herewithForDt === item ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                 <Text>{item}</Text>
                              </View>
                           ))}
                        </View>
                        <View style={{ width: '33%', paddingRight: 10, paddingLeft: 10, paddingBottom: 5, paddingTop: 5, marginRight: 10 }}>
                           {['Catalogues', 'Test Results', 'Correspondence', 'Others'].map((item, i) => (
                              <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                 <Image src={herewithForDt === item ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                 <Text>{item}</Text>
                              </View>
                           ))}
                        </View>
                     </View>


                     <Text>Transmitted for :</Text>
                     <View>
                        <View style={{ width: '50%', paddingRight: 10, paddingLeft: 10, paddingBottom: 5, paddingTop: 5, marginRight: 10 }}>
                           {['Information / Action', 'Comments / Approval', 'Construction', 'Record'].map((item, i) => (
                              <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                 <Image src={transmittedForDt === item ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                 <Text>{item}</Text>
                              </View>
                           ))}
                        </View>
                     </View>
                  </View>
               )}

               {pageSheetTypeName === 'page-rfi' && (
                  <View style={{ padding: 10, paddingBottom: 0, ...fontStyles.fontRegular }}>
                     <View style={{ flexDirection: 'row' }}>
                        <Text>Requested By: </Text>
                        <Text>{requestedBy}</Text>
                     </View>
                     <View style={{ flexDirection: 'row', marginBottom: 5, marginTop: 10 }}>
                        <Text>Date Required: </Text>
                        <Text>{moment(dateReplyForSubmitForm).format('DD/MM/YY')}</Text>
                     </View>

                  </View>
               )}


               {pageSheetTypeName === 'page-cvi' && (
                  <View style={{ ...fontStyles.fontRegular, padding: 10 }}>
                     <View>
                        <Text>Conversation Among :</Text>
                        <Text style={{
                           marginRight: 5,
                           marginBottom: 10,
                           height: 30,
                           textOverflow: 'ellipsis',
                           overflow: 'hidden',
                           whiteSpace: 'nowrap',
                        }}>{` ${conversationAmong}`}</Text>
                     </View>

                     <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text>Date</Text>
                        <Text style={{ marginRight: 30 }}>{`: ${moment(dateConversation).format('DD/MM/YY')}`}</Text>
                        <Text>Time</Text>
                        <Text>{`: ${moment(timeConversation).format('HH: mm')}`}</Text>
                     </View>

                     <View style={{}}>
                        <Text>Details :</Text>
                        <Text style={{
                           marginRight: 5,
                           marginBottom: 10,
                           height: 60,
                           textOverflow: 'ellipsis',
                           overflow: 'hidden',
                           whiteSpace: 'nowrap',
                        }}>{` ${description}`}</Text>
                     </View>
                  </View>
               )}

               {pageSheetTypeName === 'page-rfam' && (
                  <View style={{ flexDirection: 'row', padding: 10, borderBottom: '1px solid black', ...fontStyles.fontRegular }}>
                     <View style={{ width: '40%' }}>
                        <Text style={{ marginBottom: 5 }}>Contract Drawing No. (if applicable)</Text>
                        <Text style={{ ...fontStyles.fontBold }}>{` ${contractDrawingNo || ''}`}</Text>
                     </View>

                     <View style={{ width: '30%' }}>
                        <Text style={{ marginBottom: 5 }}>Reply Required By : </Text>
                        <Text style={{ ...fontStyles.fontBold }}>{` ${moment(dateReplyForSubmitForm).format('DD/MM/YY')}`}</Text>
                     </View>

                     <View style={{ width: '30%' }}>
                        {['New Submittal', 'Alternative', 'Resubmittal'].map((note, ind) => (
                           <View key={ind} style={{ flexDirection: 'row' }}>
                              <Image src={note === submissionType ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                              <Text>{note}</Text>
                           </View>
                        ))}
                     </View>

                  </View>
               )}

               {pageSheetTypeName === 'page-rfam' && (
                  <View style={{ paddingLeft: 10, paddingRight: 10, marginTop: 5, marginBottom: 5 }}>
                     <TableDrawings
                        th
                        col={['34%', '33%', '33%']}
                        children={[
                           ['DESCRIPTION OF ITEM SUBMITTED', 'CONTRACT SPECIFICATION / SUPPLIER', 'PROPOSED SPECIFICATION / SUPPLIER'],
                           [description, contractSpecification, proposedSpecification]
                        ]}
                        isRfamDescriptionTable={true}
                     />
                  </View>
               )}


               {(pageSheetTypeName === 'page-rfi' || pageSheetTypeName === 'page-dt' || pageSheetTypeName === 'page-mm') && (
                  <View style={{
                     marginBottom: pageSheetTypeName === 'page-rfi' ? 10 : 5,
                     padding: 10, paddingBottom: 5, ...fontStyles.fontRegular
                  }}>
                     <Text style={{ textDecoration: 'underline', marginBottom: 2 }}>Description:</Text>
                     <Text style={{
                        marginRight: 20, height: pageSheetTypeName === 'page-rfi' ? 125 : 65,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                     }}>{description}</Text>
                  </View>
               )}



               {dataTableInput.length > 0 && (
                  <View style={{ paddingLeft: 10, paddingRight: 10 }}>
                     <View style={{ marginTop: 3, marginBottom: 2 }}>
                        <Text>Document / Drawing Reference</Text>
                     </View>
                     <TableDrawings
                        th
                        col={['4%', '20%', '76%']}
                        children={[
                           ['', 'Type', 'File'],
                           ...dataTableInput
                        ]}
                     />
                  </View>
               )}


               {pageSheetTypeName === 'page-cvi' && (
                  <View style={{ ...fontStyles.fontRegular, padding: 10 }}>
                     <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: '50%', padding: 10, marginRight: 10 }}>
                           <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                              <Image src={isCostImplication ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                              <Text>Variation with cost implication</Text>
                           </View>
                           <View style={{ flexDirection: 'row' }}>
                              <Image src={isTimeExtension ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                              <Text>With time extension</Text>
                           </View>
                        </View>
                        <View style={{ width: '50%', padding: 10 }}>
                           <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                              <Image src={!isCostImplication ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                              <Text>With no cost implication</Text>
                           </View>
                           <View style={{ flexDirection: 'row' }}>
                              <Image src={!isTimeExtension ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                              <Text>With no time extension</Text>
                           </View>
                        </View>
                     </View>
                     <Text>This form is issued pursuant to the Conditions of Contract and also constitutes our notification of an event which may form the basis of a possible claim for additional costs or an extension of time or both.</Text>
                  </View>
               )}


               <View style={{ position: 'absolute', bottom: 0, ...fontStyles.fontRegular, width: '100%' }}>
                  <View style={{ marginLeft: 10, marginTop: 0, paddingTop: 5, paddingBottom: 10, marginBottom: 5, borderTop: '1px solid black', width: 100 }}>
                     <Text style={{ marginBottom: 1 }}>{recipientName}</Text>
                     <Text>Project Manager</Text>
                  </View>


                  <View style={{ borderTop: '1px solid black', padding: 10, paddingTop: 5 }}>
                     <Text style={{ fontSize: 10, marginBottom: 3, textDecoration: 'underline' }}>
                        {(pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi') ? 'REPLY' : 'ACKNOWLEDGEMENT'}
                     </Text>
                     <Text style={{ marginBottom: 5 }}>To: <Text style={{ ...fontStyles.fontBold }}>Woh Hup (Private) Limited</Text></Text>

                     {pageSheetTypeName === 'page-rfi' && (
                        <Text>Refer to the above query, we advise as follows: </Text>
                     )}

                  </View>

                  {pageSheetTypeName === 'page-rfam' ? (
                     <View style={{
                        borderTop: '1px solid black', borderBottom: '1px solid black',
                        width: '100%', flexDirection: 'row'
                     }}>
                        <View style={{ width: '67%', borderRight: '1px solid black', padding: 10, paddingTop: 5 }}>
                           <Text>The material / equipment submitted is hereby transmitted with actions as indicated.</Text>
                           <View style={{ flexDirection: 'row' }}>
                              <View style={{ width: '47%', padding: 10, marginRight: 10 }}>
                                 <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                    <Image src={imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                    <Text>Approved For Construction (AP)</Text>
                                 </View>
                                 <View style={{ flexDirection: 'row' }}>
                                    <Image src={imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                    <Text>Approved with comments, no submission required (AC)</Text>
                                 </View>
                              </View>
                              <View style={{ width: '47%', padding: 10 }}>
                                 <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                    <Image src={imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                    <Text>Rejected, resubmission required (RR)</Text>
                                 </View>
                                 <View style={{ flexDirection: 'row' }}>
                                    <Image src={imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                    <Text>Approved with comments, resubmission required (AR)</Text>
                                 </View>
                              </View>
                           </View>
                           <Text style={{ marginBottom: 10 }}>Company Stamp & Signature : _________________</Text>
                           <View style={{ flexDirection: 'row' }}>
                              <Text style={{ marginRight: 20 }}>Name :_________________________</Text>
                              <Text>Date :_____________</Text>
                           </View>

                        </View>

                        <View style={{ width: '33%', padding: 10, paddingTop: 5 }}>
                           <Text>Comments:</Text>
                        </View>
                     </View>
                  ) : (
                     <View style={{ padding: 10, marginTop: pageSheetTypeName === 'page-rfi' ? 100 : 30, borderBottom: '1px solid black' }}>
                        <Text style={{ marginBottom: 5 }}>Company Stamp & Signature : _________________</Text>
                        <View style={{ flexDirection: 'row' }}>
                           <Text style={{ marginRight: 20 }}>Name :_________________________</Text>
                           <Text>Date :_____________</Text>
                        </View>
                     </View>
                  )}


                  <View style={{
                     flexDirection: 'row',
                     padding: 10, paddingTop: 5, paddingBottom: 0,
                     ...fontStyles.fontRegular
                  }}>
                     <Text style={{ ...fontStyles.fontBold, textDecoration: 'underline' }}>CC</Text>
                     <Text style={{
                        height: 50,
                        paddingLeft: 5,
                        paddingRight: 5
                     }}>{`: ${(listRecipientCc || []).map(name => {
                        return name.includes('_%$%_') ? name.replace('_%$%_', ' ') : name;
                     }).join(', ')}`}</Text>
                  </View>

               </View>
            </View>
         </Page>
      </Document>
   );
};


export default ExportPdf;




const stylesTable = StyleSheet.create({
   em: {
      fontStyle: 'bold'
   },
   table: {
      width: '100%',
      borderLeft: '1px solid black',
      borderTop: '1px solid black',
      display: 'flex',
      flexDirection: 'column',
      marginVertical: 1,
      borderCollapse: 'collapse',
      fontSize: '8px'
   },
   tableRow: {
      display: 'flex',
      flexDirection: 'row',
   },
   cell: {
      borderRight: '1px solid black',
      borderBottom: '1px solid black',
      display: 'flex',
      alignContent: 'center',
      flexWrap: 'wrap',
   }
});



const TableDrawings = ({ children, col, th, isRfamDescriptionTable }) => {
   return (
      <View style={stylesTable.table}>
         {children.map((row, ind) => {
            const textArea = isRfamDescriptionTable && ind === 1;
            const drawingInfo = !isRfamDescriptionTable && ind > 0;
            return (
               <View key={ind} style={[stylesTable.tableRow, th && ind === 0 ? stylesTable.em : {}]}>
                  {row.map((cell, j) => {
                     return (
                        <View key={j} style={[stylesTable.cell, {
                           width: col[j],
                           height: textArea ? 150 : drawingInfo ? 12 : 15,
                           padding: 1,
                           paddingLeft: 5,
                           justifyContent: textArea ? 'none' : 'center'
                        }]}>
                           {(typeof (cell) === 'string' || typeof (cell) === 'number')
                              ? <Text>{cell}</Text>
                              : cell
                           }
                        </View>
                     );
                  })}
               </View>
            );
         })}
      </View>
   );
};