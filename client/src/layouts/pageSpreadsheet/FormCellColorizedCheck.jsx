import Axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { convertHistoryData } from '../../utils';
import ButtonStyle from './ButtonStyle';
import PanelCalendarDuration from './PanelCalendarDuration';




const FormCellColorizedCheck = ({ setCellHistoryArr }) => {

   const { state: stateProject } = useContext(ProjectContext);

   const { projectId, token } = stateProject.allDataOneSheet;
   const headersArr = stateProject.allDataOneSheet.publicSettings.headers;

   useEffect(() => {
      const fetchProjectHistory = async () => {
         try {
            const res = await Axios.get(`${SERVER_URL}/cell/history/`, { params: { token, projectId } });
            setHistoryData(res.data);
         } catch (err) {
            console.log(err);
         };
      };
      fetchProjectHistory();
   }, []);

   const [historyData, setHistoryData] = useState([]);

   const [dateRange, setDateRange] = useState(null);
   const onClickCheck = ({ start, end }) => {
      let filterCells = convertHistoryData(historyData).filter(cell => {
         let createdAt = moment(cell.createdAt).toDate();
         return createdAt >= start && createdAt <= end;
      });
      const cellArr = filterCells.map(ch => {
         const { row: rowId, headerKey } = ch;
         let headerText = headersArr.find(hd => hd.key === headerKey).text;
         return {
            rowId,
            header: headerText
         }
      });
      let unique = cellArr.reduce((res, itm) => {
         let result = res.find(item => JSON.stringify(item) == JSON.stringify(itm));
         if (!result) return res.concat(itm);
         return res;
      }, []);

      setCellHistoryArr(unique);
   };
   const checkCellWithinDates = (nos) => {
      const addDays = (date, days) => {
         let result = new Date(date);
         result.setDate(result.getDate() + days);
         return result;
      };
      let today = new Date();
      let dateBefore = addDays(today, nos);
      return {
         start: dateBefore,
         end: today
      };
   };


   return (
      <div style={{
         padding: 15
      }}>
         <div style={{ display: 'flex', marginBottom: 10 }}>
            <PanelCalendarDuration pickRangeDate={(e) => setDateRange(e)} />
            <ButtonStyle
               onClick={() => dateRange && onClickCheck({ start: dateRange[0], end: dateRange[1] })}
               marginLeft={5}
               name='Check Data Changed'
            />
         </div>
         <div style={{ display: 'flex', marginBottom: 20, width: '100%' }}>
            <ButtonStyle marginRight={5} name='Today'
               onClick={() => onClickCheck(checkCellWithinDates(-1))}
            />
            <ButtonStyle marginRight={5} name='Last 3 Days'
               onClick={() => onClickCheck(checkCellWithinDates(-3))}
            />
            <ButtonStyle marginRight={5} name='Last 7 Days'
               onClick={() => onClickCheck(checkCellWithinDates(-7))}
            />
            <ButtonStyle marginRight={5} name='Last 14 Days'
               onClick={() => onClickCheck(checkCellWithinDates(-14))}
            />
            <ButtonStyle marginRight={5} name='This Month'
               onClick={() => onClickCheck(checkCellWithinDates(-31))}
            />
         </div>
      </div>
   );
};

export default FormCellColorizedCheck;

