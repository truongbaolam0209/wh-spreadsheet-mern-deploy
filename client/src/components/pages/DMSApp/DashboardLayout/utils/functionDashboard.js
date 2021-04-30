import moment from 'moment';


export const inputStackData = [
   'Approved, no resubmission required',
   'Approved with comments, no resubmission required',
   'Approved with comments, resubmission required',
   'Rejected, to resubmit',
   'Consultant reviewing',
   'Pending design',
   'Revision in progress',
   '1st cut of drawing in-progress',
   '1st cut of model in-progress',
   'Not Started',
];
const inputStackResubmit = [
   'Approved in previous version but need resubmit',
   'Rejected, to resubmit',
];

export const converToInputStack = (data) => {
   let output = [];
   data.forEach(item => {
      let arr = { ...item };
      delete arr.name;
      Object.keys(arr).forEach(stt => {
         if (inputStackData.indexOf(stt) !== -1 || inputStackResubmit.indexOf(stt) !== -1) {
            output = [...output, stt];
         };
      });
   });
   return [...new Set(output)];
};
export const sortStatusOrder = (data) => {
   const statusArr = [...data];
   let arr = [];
   inputStackData.forEach(element => {
      statusArr.forEach(e => {
         if (element === e) arr.push(element);
      });
   });
   if (arr.length === 0) return statusArr;
   return arr;
};
export const checkDiffDates = (dateInput1, dateInput2) => {
   let date1 = dateInput1;
   let date2 = dateInput2;
   if (dateInput1 && dateInput1.length === 8 && dateInput1.includes('/')) date1 = moment(dateInput1, 'DD/MM/YY').format('YYYY-MM-DD');
   if (dateInput2 && dateInput2.length === 8 && dateInput2.includes('/')) date2 = moment(dateInput2, 'DD/MM/YY').format('YYYY-MM-DD');

   if (date1 && date2) {
      return moment(date1).diff(moment(date2), 'days');
   } else if (date1 && !date2) {
      return moment(date1).diff(moment(), 'days');
   };
};
export const formatStringNameToId = (str) => {
   let mystring = str.replace(/ /g, '').replace(/\(|\)/g, '');
   return mystring.charAt(0).toLowerCase() + mystring.slice(1);
};
const randomInteger = (min, max) => {
   return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const createDummyRecords = () => {
   let categoryArr = [
      'Drawing Approved For Construction',
      'Drawing Approved With Comments To Resubmit',
      'Drawing Late For Approval',
      'Drawing Late For Submission',
      'Drawing Late For Construction',
   ];

   let recordArray = {};

   categoryArr.forEach(cate => {
      let arr = {};
      if (cate === 'Drawing Late For Approval' || cate === 'Drawing Late For Submission') {
         for (let i = 0; i < 100; i++) {
            if (i % 3 == 0) {
               arr[moment(new Date(2020, 6, 21)).add(i, 'day')._d] = 0;
            } else {
               arr[moment(new Date(2020, 6, 21)).add(i, 'day')._d] = randomInteger(0, 1);
            };
         };

      } else if (cate === 'Drawing Late For Construction') {

         for (let i = 0; i < 100; i++) {
            if (i % 3 == 0) {
               arr[moment(new Date(2020, 6, 21)).add(i, 'day')._d] = 0;
            } else {
               arr[moment(new Date(2020, 6, 21)).add(i, 'day')._d] = randomInteger(0, 2);
            };
         };

      } else {

         for (let i = 0; i < 100; i++) {
            if (i % 3 == 0) {
               arr[moment(new Date(2020, 6, 21)).add(i, 'day')._d] = 1;
            } else {
               arr[moment(new Date(2020, 6, 21)).add(i, 'day')._d] = randomInteger(1, 4);
            };
         };
      };
      recordArray[cate] = arr;
   });
   return recordArray;
};
const getRandomInt = (min, max) => {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};
export const recordDataToChartDaily = (data, category, month) => {
   let arr = [];
   Object.keys(data[category]).forEach((item, i) => {

      const addNos = i % 3 == 0 ? -1
         : i % 2 == 0 ? 1
            : i % 5 == 0 ? 2 : 0;

      const date = moment(item).add(-1, 'day');
      if (date.format('MM/YY') === month) {
         arr.push({
            date: date.format('DD'),
            value: data[category][item],
            target: data[category][item] + addNos
         });
      };
   });
   return arr;
};
export const recordDataToChartWeekly = (data, category) => {
   let arr = [];
   Object.keys(data[category]).forEach((item, i) => {

      const addNos = i % 3 == 0 ? -1
         : i % 5 == 0 ? 1
            : i % 7 == 0 ? 2 : 0;

      const date = moment(item).add(-1, 'day');
      arr.push({
         week: date.format('W'),
         month: date.format('MM'),
         year: date.format('YY'),
         value: data[category][item],
         target: data[category][item] + addNos
      });
   });

   let groups = {};
   for (let i = 0; i < arr.length; i++) {
      let weekName = `W${arr[i].week} ${arr[i].month}/${arr[i].year}`;
      groups[weekName] = {};
   };


   for (let i = 0; i < arr.length; i++) {
      let weekName = `W${arr[i].week} ${arr[i].month}/${arr[i].year}`;
      groups[weekName].value = [...groups[weekName].value || [], arr[i].value];
      groups[weekName].target = [...groups[weekName].target || [], arr[i].target];
   };

   let arrOutput = [];
   for (let week in groups) {
      arrOutput.push({
         week,
         value: groups[week].value.reduce((a, b) => a + b, 0),
         target: groups[week].target.reduce((a, b) => a + b, 0),
      });
   };
   return arrOutput;
};
export const recordDataToChartMonthly = (data, category) => {
   let arr = [];
   Object.keys(data[category]).forEach((item, i) => {

      const addNos = i % 4 == 0 ? -4
         : i % 3 == 0 ? 3
            : i % 2 == 0 ? 2 : 0;

      const date = moment(item).add(-1, 'day');
      arr.push({
         week: date.format('W'),
         month: date.format('MM'),
         year: date.format('YY'),
         value: data[category][item],
         target: data[category][item] + getRandomInt(-3, 3)
      });
   });
   let groups = {};
   for (let i = 0; i < arr.length; i++) {
      let monthName = `${arr[i].month}/${arr[i].year}`;
      groups[monthName] = {};
   };

   for (let i = 0; i < arr.length; i++) {
      let monthName = `${arr[i].month}/${arr[i].year}`;
      groups[monthName].value = [...groups[monthName].value || [], arr[i].value];
      groups[monthName].target = [...groups[monthName].target || [], arr[i].target];
   };

   let arrOutput = [];
   for (let month in groups) {
      arrOutput.push({
         month,
         value: groups[month].value.reduce((a, b) => a + b, 0),
         target: groups[month].target.reduce((a, b) => a + b, 0),
      });
   };
   return arrOutput;
};











const flattenAllTreeChildNode1 = (root) => {
   let temp = [];
   let queue = [...root];
   while (queue.length > 0) {
      let node = queue.shift();
      if (node.children) {
         let childNode = [];
         node.children.forEach(nd => {
            childNode.push({ ...nd, parentId: node.id });
         });
         queue = [...queue, ...childNode];
         let nodeObj = { ...node };
         delete nodeObj.children;
         temp.push(nodeObj);
      } else {
         let nodeObj = { ...node };
         delete nodeObj.children;
         temp.push(nodeObj);
      };
   };
   return temp;
};
const getListOfBranchesTree = (inputArr) => {
   const arr = inputArr.map(x => ({ ...x }));
   arr.sort((a, b) => { return b.treeLevel - a.treeLevel });

   const parentArrIds = [];
   arr.forEach(x => {
      let item = arr.find(fld => fld.id === x.parentId);
      if (item) {
         item.children = [...item.children || [], x];
      } else {
         parentArrIds.push(x.id);
      };
   });
   return arr.filter(x => parentArrIds.indexOf(x.id) !== -1);
};
const getTreeFlattenOfNodeInArray = (treeArray, node) => {
   let obj = { ...node };
   let arrayTree = treeArray.map(x => ({ ...x })).filter(x => x.treeLevel > obj.treeLevel);
   arrayTree = [...arrayTree, obj];
   const treeOfFound = getListOfBranchesTree(arrayTree).find(x => x.id === obj.id);
   return flattenAllTreeChildNode1([treeOfFound]);
};
const getUniqueValueByColumns = (rows, header) => {
   let valueArr = [];
   rows.forEach(row => valueArr.push(row[header]));
   return [...new Set(valueArr)];
};
const countDrawingsByColumnAndStatus = (rows, column) => {
   let valueArray = getUniqueValueByColumns(rows, column).sort();

   let arrCount = [];
   let objDrawings = {};
   valueArray.forEach(columnValue => {
      if (columnValue !== 'NOT ASSIGNED') {
         let rowsFilter = rows.filter(r => r[column] === columnValue);
         let obj = {};
         let objDwgs = {};
         rowsFilter.forEach(r => {
            obj[r.Status] = (obj[r.Status] || 0) + 1;
            objDwgs[r.Status] = [...objDwgs[r.Status] || [], r];
         });
         obj.name = columnValue;
         arrCount.push(obj);
         objDrawings[columnValue] = objDwgs;
      };
   });

   let rowsFilterNA = rows.filter(r => r[column] === 'NOT ASSIGNED');
   let objNA = {};
   let objDwgsNA = {};
   rowsFilterNA.forEach(r => {
      objNA[r.Status] = (objNA[r.Status] || 0) + 1;
      objDwgsNA[r.Status] = [...objDwgsNA[r.Status] || [], r];
   });
   objNA.name = 'NOT ASSIGNED';

   arrCount.unshift(objNA);
   objDrawings['NOT ASSIGNED'] = objDwgsNA;


   return { arrCount, objDrawings };
};







export const convertDataFromDB = (data, dataRowHistories, projectsArray) => {

   let output = {
      projectSplit: [],
   };

   const arrComparison = ['OVERALL', 'WH - ARCHI', 'WH - C&S', 'WH - M&E', 'WH - PRECAST', 'SUBCON'].map(item => ({
      name: item,
      data: []
   }));


   data.forEach(projectData => {

      let { publicSettings: { headers, drawingTypeTree }, rows: rowsAllInProject, _id } = projectData;

      rowsAllInProject = rowsAllInProject.filter(x => x['Drawing Number'] || x['Drawing Name']);

      rowsAllInProject.forEach(r => {
         if (!r.Rev) r.Rev = '0';
         r.Rev = r.Rev.toUpperCase();

         if (!r.Status) r.Status = 'Not Started';

         if (r.Status === 'Revise In-Progress') {
            r.Status = 'Revision in progress';
         } else if (r.Status === 'Reject and resubmit') {
            r.Status = 'Rejected, to resubmit';
         } else if (r.Status === 'Approved with comments, to Resubmit') {
            r.Status = 'Approved with comments, resubmission required';
         } else if (r.Status === 'Approved with Comment, no submission Required') {
            r.Status = 'Approved with comments, no resubmission required';
         } else if (r.Status === 'Approved for Construction') {
            r.Status = 'Approved, no resubmission required';
         };


         if (!r['Modeller']) r['Modeller'] = 'Not assigned';
         r['Modeller'] = r['Modeller'].toUpperCase();

         if (!r['Coordinator In Charge']) r['Coordinator In Charge'] = 'Not assigned';
         r['Coordinator In Charge'] = r['Coordinator In Charge'].toUpperCase();
      });

      const headersArrayText = headers.map(x => x.text);
      const projectName = projectsArray.find(dt => dt.id === _id).name;


      const historiesThisProject = dataRowHistories.find(x => x.projectId === _id).histories || [];

      const dataRowHistoriesThisProject = converHistoryData(historiesThisProject, headers);
      const dataInfoOverAll = convertToInputDataForChart(rowsAllInProject, dataRowHistoriesThisProject, headersArrayText);
      let projectOutput = [{ panel: 'OVERALL', dataInfo: dataInfoOverAll }];

      const found = arrComparison.find(x => x.name === 'OVERALL');

      if (rowsAllInProject.length > 0) {
         found.data.push({
            projectName,
            projectId: _id,
            compareDrawingStatus: dataInfoOverAll.pieDrawingStatusCount,

            compareDrawingsLateSubmission: dataInfoOverAll.drawingsLateSubmission.length,
            compareDrawingsLateApproval: dataInfoOverAll.drawingsLateApproval.length,
            compareDrawingsLateStart: dataInfoOverAll.drawingsLateStart.length,
            compareDrawingsLateConstruction: dataInfoOverAll.drawingsLateConstruction.length,
         });
      };


      let objTradeStatus = {};
      let arrTradeCount = [];
      const wohhupNode = drawingTypeTree.find(x => x.treeLevel === 1 && x.title === 'Woh Hup Private Ltd');
      if (wohhupNode) {
         const arrWHTrade = ['ARCHI', 'C&S', 'M&E', 'PRECAST'];
         arrWHTrade.forEach(trade => {
            const tradeNode = drawingTypeTree.find(x => {
               return x.treeLevel === 2 && x.title === trade && x.parentId === wohhupNode.id;
            });
            if (tradeNode) {
               const allNodesUnderThisTrade = getTreeFlattenOfNodeInArray(drawingTypeTree, tradeNode);
               const allIdsNode = [...new Set(allNodesUnderThisTrade.map(x => x.id))];
               const rowsInThisTrade = rowsAllInProject.filter(x => allIdsNode.find(id => id === x._parentRow));


               const rowsHistoriesThisTrade = dataRowHistoriesThisProject.filter(r => rowsInThisTrade.find(x => x._id === r.row));

               const dataInfoThisTrade = convertToInputDataForChart(rowsInThisTrade, rowsHistoriesThisTrade, headersArrayText);

               projectOutput.push({
                  panel: 'WH - ' + trade,
                  dataInfo: dataInfoThisTrade
               });

               const foundTrade = arrComparison.find(x => x.name === 'WH - ' + trade);

               if (foundTrade && rowsAllInProject.length > 0) {
                  foundTrade.data.push({
                     projectName,
                     projectId: _id,
                     compareDrawingStatus: dataInfoThisTrade.pieDrawingStatusCount,

                     compareDrawingsLateSubmission: dataInfoThisTrade.drawingsLateSubmission.length,
                     compareDrawingsLateApproval: dataInfoThisTrade.drawingsLateApproval.length,
                     compareDrawingsLateStart: dataInfoThisTrade.drawingsLateStart.length,
                     compareDrawingsLateConstruction: dataInfoThisTrade.drawingsLateConstruction.length,
                  });
               };

               const { objCount: objCountTrade, objDrawings: rowsTradeSplitStatus } = splitRowsStatusByTrade(rowsInThisTrade, 'WH - ' + trade);
               objTradeStatus['WH - ' + trade] = rowsTradeSplitStatus;
               arrTradeCount.push(objCountTrade);
            };
         });
      };


      const subconGroup = drawingTypeTree.filter(x => x.treeLevel === 1 && x.title === 'SUBCON');
      let allIsSubconAndUnder = [];
      subconGroup.forEach(sb => {
         const allNodesUnderThisSubcon = getTreeFlattenOfNodeInArray(drawingTypeTree, sb);
         const allIdsNode = [...new Set(allNodesUnderThisSubcon.map(x => x.id))];
         allIsSubconAndUnder = [...allIsSubconAndUnder, ...allIdsNode];
      });
      allIsSubconAndUnder = [...new Set(allIsSubconAndUnder)];
      const rowsOfSubcon = rowsAllInProject.filter(x => allIsSubconAndUnder.find(id => id === x._parentRow));
      const rowsHistoriesSubcon = dataRowHistoriesThisProject.filter(r => rowsOfSubcon.find(x => x._id === r.row));
      const dataInfoSubcon = convertToInputDataForChart(rowsOfSubcon, rowsHistoriesSubcon, headersArrayText);
      projectOutput.push({
         panel: 'SUBCON',
         dataInfo: dataInfoSubcon
      });

      const foundSubcon = arrComparison.find(x => x.name === 'SUBCON');

      if (foundSubcon && rowsAllInProject.length > 0) {
         foundSubcon.data.push({
            projectName,
            projectId: _id,
            compareDrawingStatus: dataInfoSubcon.pieDrawingStatusCount,

            compareDrawingsLateSubmission: dataInfoSubcon.drawingsLateSubmission.length,
            compareDrawingsLateApproval: dataInfoSubcon.drawingsLateApproval.length,
            compareDrawingsLateStart: dataInfoSubcon.drawingsLateStart.length,
            compareDrawingsLateConstruction: dataInfoSubcon.drawingsLateConstruction.length,
         });
      };


      const { objCount: objCountSubcon, objDrawings: rowsSubconSplitStatus } = splitRowsStatusByTrade(rowsOfSubcon, 'SUBCON');
      objTradeStatus['SUBCON'] = rowsSubconSplitStatus;
      arrTradeCount.push(objCountSubcon);

      const overAllObj = projectOutput.find(x => x.panel === 'OVERALL');
      overAllObj.dataInfo['Bar Drawing Trade'] = objTradeStatus;
      overAllObj.dataInfo['barDrawingTradeCount'] = arrTradeCount;


      output.projectSplit.push({
         projectId: _id,
         projectName,
         dataProject: projectOutput
      });
   });

   output.projectComparison = arrComparison;
   return output;
};
const convertToInputDataForChart = (rows, rowsHistory, headers) => {

   let inputStack = getUniqueValueByColumns(rows, 'Status');

   const { arrCount: barDrawingRevCount, objDrawings: barDrawingRevDrawings } = countDrawingsByRevAndStatus(rows);
   let { arrCount: barDrawingModellerCount, objDrawings: barDrawingModellerDrawings } = countDrawingsByColumnAndStatus(rows, 'Modeller');
   let { arrCount: barDrawingCoordinatorCount, objDrawings: barDrawingCoordinatorDrawings } = countDrawingsByColumnAndStatus(rows, 'Coordinator In Charge');

   let itemNoData1 = barDrawingModellerCount.filter(x => x.name === 'Not assigned');
   let itemRest1 = barDrawingModellerCount.filter(x => x.name !== 'Not assigned');
   barDrawingModellerCount = [...itemNoData1, ...itemRest1];

   let itemNoData2 = barDrawingCoordinatorCount.filter(x => x.name === 'Not assigned');
   let itemRest2 = barDrawingCoordinatorCount.filter(x => x.name !== 'Not assigned');
   barDrawingCoordinatorCount = [...itemNoData2, ...itemRest2];



   let pieDrawingStatusCount = {};
   let pieDrawingStatusDrawings = {};
   inputStack.forEach(stt => {
      let rowArr = rows.filter(r => r.Status === stt);
      rowArr.forEach(r => {
         pieDrawingStatusCount[stt] = (pieDrawingStatusCount[stt] || 0) + 1;
      });
      pieDrawingStatusDrawings[stt] = rowArr;
   });


   const drawingsLateSubmission = getDrawingLateNow1(rows, 'drawingsLateSubmission');
   const drawingsLateApproval = getDrawingLateNow1(rows, 'drawingsLateApproval');
   const drawingsLateStart = getDrawingLateNow1(rows, 'drawingsLateStart');
   const drawingsLateConstruction = getDrawingLateNow1(rows, 'drawingsLateConstruction');

   const { rowsToSubmitTarget: rowsToSubmitTargetWeek, rowsToSubmitActual: rowsToSubmitActualWeek } = getDrawingsToSubmitBy(rows, 'week');
   const { rowsToSubmitTarget: rowsToSubmitTargetMonth, rowsToSubmitActual: rowsToSubmitActualMonth } = getDrawingsToSubmitBy(rows, 'month');



   const revArray = ['0', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
   const allDwgsToResubmit = rows.filter(x => {
      return x['Status'] === 'Approved with comments, resubmission required' || x['Status'] === 'Rejected, to resubmit';
   });


   let objData = {};
   allDwgsToResubmit.forEach(r => {
      const columnIndex = revArray.indexOf(r['Rev'] || '0') + 1;
      objData[columnIndex] = [...objData[columnIndex] || [], r];
   });


   let barDrawingResubmitDrawings = {};
   let barDrawingResubmitCount = [];

   Object.keys(objData).forEach(cl => {
      const rows = objData[cl];
      let rejectToResubmit = [];
      let approvedPreviousVersion = [];
      rows.forEach(row => {
         const histories = rowsHistory.filter(r => r.row === row.id);
         const found = histories.find(x => x['Status'] === 'Approved, no resubmission required' || x['Status'] === 'Approved with comments, no resubmission required');
         if (found) {
            approvedPreviousVersion.push(row);
         } else {
            rejectToResubmit.push(row);
         };
      });
      barDrawingResubmitCount.push({
         'Approved in previous version but need resubmit': approvedPreviousVersion.length,
         'Rejected, to resubmit': rejectToResubmit.length,
         name: cl
      });
      barDrawingResubmitDrawings[cl] = {
         'Approved in previous version but need resubmit': approvedPreviousVersion,
         'Rejected, to resubmit': rejectToResubmit
      };
   });


   return {
      rows,
      headers,

      'Bar Drawing Rev': barDrawingRevDrawings,
      barDrawingRevCount,
      'Bar Drawing Modeller': barDrawingModellerDrawings,
      barDrawingModellerCount,
      'Bar Drawing Coordinator': barDrawingCoordinatorDrawings,
      barDrawingCoordinatorCount,
      'Bar Drawing Resubmit': barDrawingResubmitDrawings,
      barDrawingResubmitCount,


      'Pie Drawing Status': pieDrawingStatusDrawings,
      pieDrawingStatusCount,


      drawingsLateSubmission,
      drawingsLateApproval,
      drawingsLateStart,
      drawingsLateConstruction,
      rowsToSubmitTargetWeek,
      rowsToSubmitActualWeek,
      rowsToSubmitTargetMonth,
      rowsToSubmitActualMonth,
   };
};
const countDrawingsByRevAndStatus = (rows) => {
   let valueArray = getUniqueValueByColumns(rows, 'Rev').sort();
   valueArray.unshift('NS');

   let arrCount = [];
   let objDrawings = {};
   valueArray.forEach(columnValue => {
      let obj = {};
      let objDwgs = {};
      let rowsFilter;
      if (columnValue !== 'NS') {
         rowsFilter = rows.filter(r => {
            return r['Rev'] === columnValue &&
               r.Status !== 'Not Started' &&
               r.Status !== '1st cut of model in-progress' &&
               r.Status !== '1st cut of drawing in-progress';
         });
      } else {
         rowsFilter = rows.filter(r => {
            return r.Status === 'Not Started' ||
               r.Status === '1st cut of model in-progress' ||
               r.Status === '1st cut of drawing in-progress';
         });
      };
      rowsFilter.forEach(r => {
         obj[r.Status] = (obj[r.Status] || 0) + 1;
         objDwgs[r.Status] = [...objDwgs[r.Status] || [], r];
      });
      obj.name = columnValue;
      arrCount.push(obj);
      objDrawings[columnValue] = objDwgs;
   });
   return { arrCount, objDrawings };
};

const converHistoryData = (rowsHistory, headers) => {
   return rowsHistory.map(rowH => {
      let obj = {
         row: rowH.row
      };
      const { history } = rowH;
      if (history) {
         headers.forEach(hd => {
            if (history[hd.key]) obj[hd.text] = history[hd.key];
         });
      };
      return obj;
   });
};

const splitRowsStatusByTrade = (rows, title) => {
   const statusArray = [...new Set(rows.map(x => x['Status']))];
   let obj = {};
   let objCount = {};
   statusArray.forEach(stt => {
      const rowsFound = rows.filter(r => r['Status'] === stt);
      obj[stt] = rowsFound;
      objCount[stt] = rowsFound.length;
   });
   return {
      objDrawings: obj,
      objCount: { ...objCount, name: title }
   }
};




export const getRandomIntInclusive = (min, max) => {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1) + min);
};

const getDrawingLateNow1 = (drawings, type) => {
   const conditionArray1 = [
      'Approved, no resubmission required',
      'Approved with comments, no resubmission required',
      'Consultant reviewing'
   ];
   const conditionArray2 = [
      'Approved, no resubmission required',
      'Approved with comments, no resubmission required',
   ];

   let rowsLateOutput;



   if (type === 'drawingsLateStart') {
      rowsLateOutput = drawings.filter(r => {
         return conditionArray1.indexOf(r.Status) === -1 &&
            r['Drawing Start (T)'] && checkDiffDates(r['Drawing Start (T)']) < 0 &&
            (
               !r['Drawing Start (A)'] ||
               (r['Drawing Start (A)'] && r['Drawing Start (T)'] && checkDiffDates(r['Drawing Start (A)'], r['Drawing Start (T)']) > 0)
            );
      });
   } else if (type === 'drawingsLateSubmission') {
      rowsLateOutput = drawings.filter(r => {
         return conditionArray1.indexOf(r.Status) === -1 &&
            r['Drg To Consultant (T)'] &&
            checkDiffDates(r['Drg To Consultant (T)']) < 0 &&
            !r['Drg To Consultant (A)'];
      });
   } else if (type === 'drawingsLateApproval') {
      rowsLateOutput = drawings.filter(r => {
         return conditionArray2.indexOf(r.Status) === -1 &&
            r['Get Approval (T)'] && checkDiffDates(r['Get Approval (T)']) < 0 &&
            (
               !r['Get Approval (A)'] ||
               (r['Get Approval (A)'] && r['Get Approval (T)'] && checkDiffDates(r['Get Approval (A)'], r['Get Approval (T)']) > 0)
            );
      });
   } else if (type === 'drawingsLateConstruction') {
      rowsLateOutput = drawings.filter(r => {
         return conditionArray2.indexOf(r.Status) === -1 &&
            r['Construction Start'] &&
            checkDiffDates(r['Construction Start']) < 0 &&
            (
               !r['Drg To Consultant (A)'] ||
               !r['Get Approval (A)'] ||
               (r['Get Approval (A)'] && r['Construction Start'] && checkDiffDates(r['Get Approval (A)'], r['Construction Start']) > 0)
            );
      });
   };

   return rowsLateOutput;
};

export const getfirstAndLastDayOf = (duration) => {

   const firstday = moment(moment().startOf(duration).toDate()).format('DD/MM/YY');
   const lastday = moment(moment().endOf(duration).toDate()).format('DD/MM/YY');

   return { firstday, lastday };
};

const getDrawingsToSubmitBy = (rows, duration) => {
   let firstday, lastday;
   if (duration === 'week') {
      const { firstday: first, lastday: last } = getfirstAndLastDayOf('week');
      firstday = first;
      lastday = last;
   } else if (duration === 'month') {
      const { firstday: first, lastday: last } = getfirstAndLastDayOf('month');
      firstday = first;
      lastday = last;
   };

   const rowsToSubmitTarget = rows.filter(r => {
      return r['Drg To Consultant (T)'] &&
         checkDiffDates(r['Drg To Consultant (T)'], firstday) >= 0 &&
         checkDiffDates(r['Drg To Consultant (T)'], lastday) <= 0;
   });

   const rowsToSubmitActual = rowsToSubmitTarget.filter(r => {
      return r['Drg To Consultant (A)'] &&
         checkDiffDates(r['Drg To Consultant (A)'], firstday) >= 0 &&
         checkDiffDates(r['Drg To Consultant (A)'], lastday) <= 0;
   });

   return {
      rowsToSubmitTarget,
      rowsToSubmitActual
   };
};


export const getUserRoleTradeCompany = (role, company) => {

   const roleArray = [
      'Document Controller',

      'WH Archi Coordinator',
      'WH C&S Design Engineer',
      'WH M&E Coordinator',
      'WH PRECAST Coordinator',

      'WH Archi Modeller',
      'WH C&S Modeller',
      'WH M&E Modeller',
      'WH PRECAST Modeller',

      'Production',

      'WH Archi Manager',
      'WH C&S Manager',
      'WH M&E Manager',
      'WH PRECAST Manager',

      'Planning Engineer',
      'QS',
      'Project Manager',
      'Corporate Manager',
      'QAQC',
      'Safety',
      'Client',

      'Sub-Con',
      'Consultant',
   ];


   if (
      !role || !company || roleArray.indexOf(role) === -1 ||
      role === 'WH Archi Manager' || role === 'WH C&S Manager' || role === 'WH M&E Manager' || role === 'WH PRECAST Manager' ||
      role === 'Planning Engineer' || role === 'QS' || role === 'Project Manager' || role === 'Corporate Manager' ||
      role === 'Client' || role === 'QAQC' || role === 'Safety'
   ) {
      return { role: 'View-Only User', trade: null, company: null };
   };

   if (role === 'WH Archi Coordinator') return { role: 'Coordinator', trade: 'ARCHI', company };
   if (role === 'WH C&S Design Engineer') return { role: 'Coordinator', trade: 'C&S', company };
   if (role === 'WH M&E Coordinator') return { role: 'Coordinator', trade: 'M&E', company };
   if (role === 'WH PRECAST Coordinator') return { role: 'Coordinator', trade: 'PRECAST', company };

   if (role === 'WH Archi Modeller') return { role: 'Modeller', trade: 'ARCHI', company };
   if (role === 'WH C&S Modeller') return { role: 'Modeller', trade: 'C&S', company };
   if (role === 'WH M&E Modeller') return { role: 'Modeller', trade: 'M&E', company };
   if (role === 'WH PRECAST Modeller') return { role: 'Modeller', trade: 'PRECAST', company };

   return { role, trade: null, company };
};