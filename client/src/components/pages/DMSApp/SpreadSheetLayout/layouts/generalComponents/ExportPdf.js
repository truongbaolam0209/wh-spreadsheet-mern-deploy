import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';
import React from 'react';
import { imgLink } from '../../constants';
import { getInfoValueFromRfaData } from '../pageSpreadsheet/CellRFA';
import { getFileNameFromLinkResponse } from '../pageSpreadsheet/PanelSetting';


const fontStyles = StyleSheet.create({
   bold: {
     fontWeight: 800,
   }
});


Font.register({
   fonts: [
      {
         src: `/Roboto-Bold.ttf`,
         fontWeight: 'bold'
      },
   ]
});


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

   dataTableInput = dataTableInput.filter((item, i) => i < 5);




   const formTitle = pageSheetTypeName === 'page-rfam' ? 'Request For Approval Of Material'
      : pageSheetTypeName === 'page-rfi' ? 'Request For Information'
         : pageSheetTypeName === 'page-cvi' ? 'Confirmation of Verbal Instruction'
            : pageSheetTypeName === 'page-dt' ? 'Document Transmittal'
               : pageSheetTypeName === 'page-mm' ? 'Meeting Minutes'
               : null;


   const testLorem1 = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';
   const testLorem2 = 'All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.';
   const testLorem3 = 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which dont look even slightly believable.';


   return (
      <Document>
         <Page size='A4' style={{ fontSize: 9, padding: 12 }}>
            <View style={{
               border: '1px solid grey', padding: 12, height: '100%', width: '100%', position: 'relative'
            }}>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                  <Image src={imgLink.logoWohhup} style={{ width: 90, height: 25, marginRight: 6 }} />
                  <Text style={{ fontSize: 13 }}>{formTitle}</Text>
               </View>


               <View style={{
                  flexDirection: 'row', marginBottom: 15, paddingBottom: 5, borderBottom: '1px solid grey'
               }}>
                  <View style={{ width: '9%' }}>
                     <Text style={{ marginBottom: 4 }}>To</Text>
                     <Text>Project</Text>
                  </View>

                  <View style={{ width: '53%' }}>
                     <Text style={{ marginBottom: 4 }}>{`: ${(listConsultantMustReply || []).join(', ')}`}</Text>
                     <Text style={{
                        marginRight: 20, height: 20,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                     }}>{`: ${projectName}`}</Text>
                  </View>

                  <View style={{ width: '18%' }}>
                     <Text style={{ marginBottom: 4 }}>Ref. No</Text>
                     <Text style={{ marginBottom: 4 }}>Date Submission</Text>
                     <Text>Page</Text>
                  </View>
                  <View style={{ width: '20%', ...fontStyles.bold }}>
                     <Text style={{ marginBottom: 4, ...fontStyles.bold }}>{`: ${refNumberText}`}</Text>
                     <Text style={{ marginBottom: 4 }}>{`: ${moment(new Date()).format('DD/MM/YY')}`}</Text>
                     <Text>: 01/01</Text>
                  </View>
               </View>


               <View style={{ flexDirection: 'row', marginBottom: 15, paddingBottom: 5, borderBottom: '1px solid grey' }}>
                  <Text>Subject: </Text>
                  <Text style={{
                     fontWeight: 'bold',
                     marginRight: 20,
                     height: 20,
                     textOverflow: 'ellipsis',
                     overflow: 'hidden',
                     whiteSpace: 'nowrap',

                  }}>{` ${emailTextTitle}`}</Text>
               </View>

               {pageSheetTypeName === 'page-dt' && (
                  <>
                     <Text>We forward herewith the following :</Text>
                     <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: '34%', padding: 10, marginRight: 10 }}>
                           {['Drawings', 'CD', 'Calculations', 'Method Statement'].map((item, i) => (
                              <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                 <Image src={herewithForDt === item ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                 <Text>{item}</Text>
                              </View>
                           ))}
                        </View>
                        <View style={{ width: '33%', padding: 10, marginRight: 10 }}>
                           {['Document', 'Programme', 'Specifications', 'Part Prints/Sketches'].map((item, i) => (
                              <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                 <Image src={herewithForDt === item ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                 <Text>{item}</Text>
                              </View>
                           ))}
                        </View>
                        <View style={{ width: '33%', padding: 10, marginRight: 10 }}>
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
                        <View style={{ width: '50%', padding: 10, marginRight: 10 }}>
                           {['Information / Action', 'Comments / Approval', 'Construction', 'Record'].map((item, i) => (
                              <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                 <Image src={transmittedForDt === item ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                                 <Text>{item}</Text>
                              </View>
                           ))}
                        </View>
                     </View>
                  </>
               )}
               {pageSheetTypeName === 'page-cvi' && (
                  <>
                     <View>
                        <Text>Conversation Among: </Text>
                        <Text style={{
                           marginRight: 10,
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
                     <View style={{ flexDirection: 'row', marginBottom: 15, paddingBottom: 5, borderBottom: '1px solid grey' }}>
                        <Text>Details :</Text>
                        <Text style={{
                           marginRight: 10,
                           marginBottom: 10,
                           height: 60,
                           textOverflow: 'ellipsis',
                           overflow: 'hidden',
                           whiteSpace: 'nowrap',
                        }}>{` ${description}`}</Text>
                     </View>
                  </>
               )}

               {pageSheetTypeName === 'page-rfam' && (
                  <View style={{
                     flexDirection: 'row', marginBottom: 15, paddingBottom: 5, borderBottom: '1px solid grey'
                  }}>
                     <View style={{ width: '70%' }}>
                        <Text style={{ marginBottom: 5 }}>Reply Required By:</Text>
                        <Text>{(listConsultantMustReply || []).join(', ')}</Text>
                     </View>


                     <View style={{ width: '30%' }}>
                        {[
                           'New Submittal',
                           'Alternative',
                           'Resubmittal',
                        ].map((note, ind) => (
                           <View key={ind} style={{ flexDirection: 'row' }}>
                              <Image src={note === submissionType ? imgLink.imgCheckTrue : imgLink.imgCheckFalse} style={{ width: 15, height: 15, marginRight: 6 }} />
                              <Text>{note}</Text>
                           </View>
                        ))}
                     </View>

                  </View>
               )}

               {pageSheetTypeName === 'page-rfam' && (
                  <TableDrawings
                     th
                     col={['34%', '33%', '33%']}
                     children={[
                        ['DESCRIPTION OF ITEM SUBMITTED', 'CONTRACT SPECIFICATION / SUPPLIER', 'PROPOSED SPECIFICATION / SUPPLIER'],
                        [description, contractSpecification, proposedSpecification]
                     ]}
                     isRfamDescriptionTable={true}
                  />
               )}


               {(pageSheetTypeName === 'page-rfi' || pageSheetTypeName === 'page-dt') && (
                  <View style={{ marginBottom: pageSheetTypeName === 'page-rfi' ? 10 : 5, paddingBottom: 10, borderBottom: '1px solid black' }}>
                     <Text>Description:</Text>
                     <Text style={{
                        marginRight: 20, height: pageSheetTypeName === 'page-rfi' ? 150 : 70,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                     }}>{description}</Text>
                  </View>
               )}



               {dataTableInput.length > 0 && (
                  <>
                     <View style={{ marginTop: 10 }}>
                        <Text>Document / Drawing Reference</Text>
                     </View>
                     <TableDrawings
                        th
                        col={['5%', '20%', '75%']}
                        children={[
                           ['', 'Type', 'File'],
                           ...dataTableInput
                        ]}
                     />
                  </>
               )}


               {pageSheetTypeName === 'page-cvi' && (
                  <>
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
                  </>
               )}


               {pageSheetTypeName === 'page-rfi' && (
                  <>
                     <View style={{ flexDirection: 'row', marginBottom: 5, marginTop: 10 }}>
                        <Text>Date Required: </Text>
                        <Text>{moment(dateReplyForSubmitForm).format('DD/MM/YY')}</Text>
                     </View>
                     <View style={{ flexDirection: 'row' }}>
                        <Text>Requested By: </Text>
                        <Text>{requestedBy}</Text>
                     </View>
                  </>
               )}




               <View style={{ position: 'absolute', bottom: 0, left: 8 }}>

                  <View style={{ marginBottom: 2, marginTop: 35, paddingTop: 3, borderTop: '1px solid black', width: 100 }}>
                     <Text>Site Manager</Text>
                  </View>
                  {pageSheetTypeName === 'page-dt' && (
                     <Text>Please Sign and Return the Duplicate copy of this transmittal to Woh Hup (Private) Limited at Technical Department</Text>
                  )}

                  <View style={{ marginBottom: 15, marginTop: 15, borderTop: '1px solid grey', paddingTop: 10 }}>
                     <Text style={{ fontSize: 10, marginBottom: 5, textDecoration: 'underline' }}>REPLY</Text>
                     <Text style={{ marginBottom: 5 }}>To: Woh Hup (Private) Limited</Text>
                     {pageSheetTypeName === 'page-rfi' ? (
                        <Text>Ref to the above query, we advise as follows: </Text>
                     ) : (
                        <Text>Attention: </Text>
                     )}
                  </View>

                  {pageSheetTypeName === 'page-rfam' ? (
                     <View style={{ border: '1px solid black', width: '100%', flexDirection: 'row' }}>
                        <View style={{ width: '67%', borderRight: '1px solid black', padding: 10 }}>
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

                        <View style={{ width: '33%', padding: 10 }}>
                           <Text>Comments:</Text>
                        </View>
                     </View>
                  ) : (
                     <>
                        <Text style={{ marginBottom: 10 }}>Company Stamp & Signature : _________________</Text>
                        <View style={{ flexDirection: 'row' }}>
                           <Text style={{ marginRight: 20 }}>Name :_________________________</Text>
                           <Text>Date :_____________</Text>
                        </View>
                     </>
                  )}


                  <View style={{
                     flexDirection: 'row',
                     marginBottom: 15,
                     marginTop: 7,
                     borderTop: '1px solid grey',
                     paddingTop: 12,
                  }}>
                     <Text>CC</Text>
                     <Text style={{
                        fontWeight: 'bold',
                        marginRight: 5,
                        height: 30,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',

                     }}>{`: ${(listRecipientCc || []).join(', ')}`}</Text>
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

      // justifyContent: 'center',
      // textAlign: 'center',
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
                           height: textArea ? 150 : drawingInfo ? 12 : 20,
                           padding: drawingInfo ? 1 : 5,
                           paddingLeft: 5,
                           justifyContent: textArea ? 'none' : 'center'
                        }]}>
                           {(typeof (cell) === 'string' || typeof (cell) === 'number')
                              ? <Text>{cell}</Text>
                              // ? cell
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