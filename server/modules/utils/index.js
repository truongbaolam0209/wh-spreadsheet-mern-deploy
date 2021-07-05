const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { HTTP } = require('../errors');
const moment = require('moment');

const getFileNameFromLinkResponse = (link) => /[^/]*$/.exec(link)[0];


function toObjectId(idStr, defaultValue) {
   try {
      if (!idStr) throw new Error('Empty id!');

      return ObjectId(idStr);

   } catch (err) {
      if (defaultValue === undefined) {
         throw new HTTP(400, 'Invalid id!');
      } else {
         return defaultValue;
      };
   };
};

function filterObject(src, ...fields) {
   let result = {};
   if (src instanceof Object) {
      for (let field in src) {
         if (fields.includes(field)) {
            result[field] = src[field]
         };
      };
   };
   return result;
};

function mongoObjectId() {
   var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
   return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
      return (Math.random() * 16 | 0).toString(16);
   }).toLowerCase();
};


const getInfoKeyFromRfaData = (obj, type, info) => {
   for (const key in obj) {
      if (key.includes(`${type}-$$$-${info}-`)) {
         return key;
      };
   };
};

const getInfoValueFromRfaData = (obj, type, info, company = '') => {
   for (const key in obj) {
      if (key.includes(`${type}-$$$-${info}-${company}`)) {
         return obj[key];
      };
   };
};

const getInfoValueFromRefDataForm = (obj, typeSubmit, typeForm, info, company = '') => {
   for (const key in obj) {
      if (key.includes(`${typeSubmit}-${typeForm}-${info}-${company}`)) {
         return obj[key];
      };
   };
};
const getInfoKeyFromRefDataForm = (obj, typeSubmit, typeForm, info, company = '') => {
   for (const key in obj) {
      if (key.includes(`${typeSubmit}-${typeForm}-${info}-${company}`)) {
         return key;
      };
   };
};

const addBackgroundForCell = (stringStyle, status) => {
   const newStr = stringStyle.slice(0, stringStyle.length - 1);
   let colorTextAdd = `'`;
   if (status === 'Approved with Comment, no submission Required') {
      colorTextAdd = `background: #006400;'`;
   } else if (status === 'Approved for Construction') {
      colorTextAdd = `background: #90EE90;'`;
   } else if (status === 'Reject and resubmit') {
      colorTextAdd = `background: #b33939;'`;
   } else if (status === 'Approved with comments, to Resubmit') {
      colorTextAdd = `background: #ff6600;'`;
   };
   return newStr + colorTextAdd;
};

const generateEmailInnerHTMLBackend = (company, emailType, rowsData) => {
   const headersArray = [
      '',
      'Drawing Number',
      'Drawing Name',
      'Rev',
      'Status',
   ];
   const typeInput = emailType === 'submit' ? 'submission' : emailType === 'reply' ? 'reply' : '';
   let emailTitle = '';
   let emailAdditionalNotes = '';
   let rfaRefText = '';

   let requestedBy = '';

   let drgToConsultantA = '';
   let consultantReplyT = '';

   const rowContainsRfaData = rowsData.find(row => row[getInfoKeyFromRfaData(row, 'submission', 'consultantMustReply')]);
   if (rowContainsRfaData) {
      emailTitle = rowContainsRfaData[`${typeInput}-$$$-emailTitle-${company}`];
      emailAdditionalNotes = rowContainsRfaData[`${typeInput}-$$$-emailAdditionalNotes-${company}`];
      rfaRefText = rowContainsRfaData['RFA Ref'];
      requestedBy = rowContainsRfaData[`submission-$$$-requestedBy-${company}`];

      drgToConsultantA = rowContainsRfaData['Drg To Consultant (A)'];
      consultantReplyT = rowContainsRfaData['Consultant Reply (T)'];
   };

   const th_td_style = `style='border: 1px solid #dddddd; text-align: left; padding: 8px; position: relative;'`;

   let tableBody = '';


   rowsData.forEach((rowData, i) => {
      let str = `<td ${th_td_style}>${i + 1}</td>`;

      headersArray.forEach((headerText, i) => {
         if (i !== 0) {
            if (headerText === 'Status' && emailType === 'reply') {
               const status = rowData[`reply-$$$-status-${company}`] || '';
               str += `<td ${addBackgroundForCell(th_td_style, status)}>${status}</td>`;
            } else if (headerText === 'Status' && emailType === 'submit') {
               str += `<td ${th_td_style}>Consultant reviewing</td>`;
            } else if (headerText === 'Drawing Number') {
               str += `
                  <td ${th_td_style}>
                     <a style='text-decoration: none;' href='${rowData[`${typeInput}-$$$-drawing-${company}`]}' download>
                        ${rowData[headerText] || ''}
                     </a>
                  </td>
               `;
            } else {
               str += `<td ${th_td_style}>${rowData[headerText] || ''}</td>`;
            };
         };
      });
      tableBody += `<tr>${str}</tr>`;
   });


   let tableHeader = '';
   headersArray.forEach(headerText => {
      tableHeader += `<th ${th_td_style}>${headerText}</th>`;
   });
   tableHeader = `<tr style='background: #34495e; color: white;'>${tableHeader}</tr>`;


   const emailOutput = `
   <div style='line-height: 1.6; font-family: Arial, Helvetica, sans-serif;'>
      <div>Subject: <span style='font-weight: bold;'>${emailTitle}</span></div>
      <div>RFA Ref: <span style='font-weight: bold;'>${rfaRefText}</span></div>
      ${emailType === 'submit'
         ? `
         <div>Submission Date: <span style='font-weight: bold;'>${drgToConsultantA}</span></div>
         <div>Requested by: <span style='font-weight: bold;'>${requestedBy}</span></div>
         <br />
         <div>Dear all,</div>
         <div>
            <span style='font-weight: bold;'>${company}</span> has submitted <span
               style='font-weight: bold;'>${rfaRefText}</span> for you to review, the
            drawings included in this RFA
            are in the list below.
            <div>${emailAdditionalNotes.replace('\n', '<br />')}</div>
         </div>
         <div>Please review and reply to us by <span style='font-weight: bold;'>${consultantReplyT}</span>.</div>
      ` : `
         <div>Reply Date: <span style='font-weight: bold;'>${moment().format('MMM Do YYYY')}</span></div>
         <br />
         <div>Dear all,</div>
         <div>
            <span style='font-weight: bold;'>${company}</span> has replied <span style='font-weight: bold;'>${rfaRefText}</span>
            , the replied and commented drawings can be found below:
            <br />
            <br />
            <br />
            <div>${emailAdditionalNotes.replace('\n', '<br />')}</div>
         </div>
      `}
      
      <br />
      <div>Uploaded Documents</div>
      <table align='center' cellpadding='0' cellspacing='0' width='100%' style='border-collapse: collapse; font-size: 14px;'>
         ${tableHeader}
         ${tableBody}
      </table>
      
      <div style='font-size: 12px;'>The links will expire on ${moment().add(7, 'days').format('MMM Do YYYY')}.</div>
      <br />
      <a href="https://idd.wohhup.com/projects">Go to BIM APP</a>
      <div>This is an automatic email from <span style='font-weight: bold;'>${company}</span>.</div>
      <br />
   </div>
   `;
   return emailOutput;
};


const validateEmailInput = (email) => {
   const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return re.test(String(email).toLowerCase());
};










const generateEmailMultiFormInnerHtml = (company, formSubmitType, rowData, action) => {
   const headersArray = [
      '',
      'Type',
      'File Name',
   ];
   const typeInput = action.includes('submit') ? 'submission' : 'reply';


   const emailTitle = rowData[`${typeInput}-${formSubmitType}-emailTitle-${company}`];
   const emailAdditionalNotes = rowData[`${typeInput}-${formSubmitType}-description-${company}`];
   const refNumber = rowData.revision === '0' ? rowData[`${formSubmitType}Ref`] : rowData[`${formSubmitType}Ref`] + rowData.revision;


   const requestedBy = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'requestedBy');

   const dateSubmission = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'date');
   const dueDate = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'due');


   const th_td_style = `style='border: 1px solid #dddddd; text-align: left; padding: 8px; position: relative;'`;

   let tableHeader = '';
   headersArray.forEach(headerText => {
      tableHeader += `<th ${th_td_style}>${headerText}</th>`;
   });
   tableHeader = `<tr style='background: #34495e; color: white;'>${tableHeader}</tr>`;



   const linkFormNoSignature = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'linkFormNoSignature');
   const linkFormSignedOff = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'linkSignedOffFormSubmit');

   const linkReplyForm = getInfoValueFromRefDataForm(rowData, 'reply', formSubmitType, 'linkFormReply', company);
   const replyStatus = getInfoValueFromRefDataForm(rowData, 'reply', formSubmitType, 'status', company);

   const linkAttachedArray = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'linkDrawings');


   let tableBody = `
      <tr>
         <td ${th_td_style}>1</td>
         <td ${th_td_style}>Form Cover</td>
         <td ${th_td_style}>
            <a style='text-decoration: none;' href='${linkFormSignedOff}' download>
               ${refNumber}
            </a>
         </td>
      </tr>
   `;

   if (linkAttachedArray && linkAttachedArray.length > 0) {
      linkAttachedArray.forEach((link, i) => {
         tableBody += `
            <tr>
               <td ${th_td_style}>${i + 2}</td>
               <td ${th_td_style}>Drawing</td>
               <td ${th_td_style}>
                  <a style='text-decoration: none;' href='${link.fileLink}' download>
                     ${link.fileName}
                  </a>
               </td>
            </tr>
         `;
      });
   };



   const emailOutput = `
      <div style='line-height: 1.6; font-family: Arial, Helvetica, sans-serif;'>
         <div>Subject: <span style='font-weight: bold;'>${emailTitle}</span></div>
         <div>${formSubmitType.toUpperCase()} Ref: <span style='font-weight: bold;'>${refNumber}</span></div>
         ${action === 'submit-request-signature' ?
         `
            <div>Submission Date: <span style='font-weight: bold;'>${moment(dateSubmission).format('MMM Do YYYY')}</span></div>
            <div>Requested by: <span style='font-weight: bold;'>${requestedBy}</span></div>
            <br />
            <div>Dear Mr/Mrs,</div>
            <div>
               Please help to sign in cover form 
               <a href='${linkFormNoSignature}'>
                  <span style='font-weight: bold;'>${refNumber}</span> 
               </a>
               for submission. Please pass this back to DC by attached signed form to DC or give him by hand.
	            The form can find in this 
               <a href='${linkFormNoSignature}'>
                  <span style='font-weight: bold;'>link</span> 
               </a>.
            </div>

         ` : action === 'submit-signed-off-final' ?
            `
            <div>Submission Date: <span style='font-weight: bold;'>${moment(dateSubmission).format('MMM Do YYYY')}</span></div>
            <div>Requested by: <span style='font-weight: bold;'>${requestedBy}</span></div>
            <br />
            <div>Dear All,</div>
            <div>
               <span style='font-weight: bold;'>${company}</span> has submitted <span style='font-weight: bold;'>${refNumber}</span> for you to review.
            </div>
            <div>Please review and reply to us by <span style='font-weight: bold;'>${moment(dueDate).format('MMM Do YYYY')}</span>.</div>
            <br />
            ${(linkAttachedArray && linkAttachedArray.length > 0) ?
               `
               <div>Uploaded Documents</div>
               <table align='center' cellpadding='0' cellspacing='0' width='100%' style='border-collapse: collapse; font-size: 14px;'>
                  ${tableHeader}
                  ${tableBody}
               </table>
               <div style='font-size: 12px;'>The links will expire on ${moment().add(7, 'days').format('MMM Do YYYY')}.</div>
            ` : ''}
         ` : action === 'submit-meeting-minutes' ?
            `
            <div>Submission Date: <span style='font-weight: bold;'>${moment(dateSubmission).format('MMM Do YYYY')}</span></div>
            <br />
            <div>Dear All,</div>
            <div>
               <span style='font-weight: bold;'>${company}</span> has submitted <span style='font-weight: bold;'>${refNumber}</span> for you to review.
            </div>
         ` : action === 'reply-signed-off' ? `
            <div>Reply Date: <span style='font-weight: bold;'>${moment().format('MMM Do YYYY')}</span></div>
            <div>Status: <span style='font-weight: bold;'>${replyStatus}</span></div>
            <br />
            <div>Dear all,</div>
            <div>
               <span style='font-weight: bold;'>${company}</span> has replied 
               <a href='${linkReplyForm}'>
                  <span style='font-weight: bold;'>${refNumber}</span>
               </a>, please check replied form in the link.
                  <br />
                  <br />
               <div>${emailAdditionalNotes.replace('\n', '<br />')}</div>
            </div>
         ` : ''}
         
         <br />
         <a href='https://idd.wohhup.com/projects'>Go to BIM APP</a>
         <div>This is an automatic email from <span style='font-weight: bold;'>${company}</span>.</div>
         <br />
      </div>
   `;


   return emailOutput;
};






module.exports = {
   toObjectId,
   filterObject,
   mongoObjectId,
   generateEmailInnerHTMLBackend,
   generateEmailMultiFormInnerHtml,
   getInfoValueFromRfaData,
   validateEmailInput,
   getInfoValueFromRefDataForm,
   getInfoKeyFromRefDataForm
};
