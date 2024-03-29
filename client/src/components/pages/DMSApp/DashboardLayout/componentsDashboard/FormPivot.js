import { Button, Divider, Modal, Select } from 'antd';
import React, { useState } from 'react';
import { colorType } from '../assets/constantDashboard';
import ChartBarRecordPanel from './ChartBarRecordPanel';



const FormPivot = ({ projectName, data, openDrawingTable, dataRecordedDummy, projectId }) => {

   const { panel, dataInfo: { headers, rows: rowsAll } } = data;


   const [columnsHeaderSorted, setColumnsHeaderSorted] = useState(null);


   const [titleLeft, setTitleLeft] = useState(headers.filter(x => {
      return !x.includes('(A)') &&
         !x.includes('(T)') &&
         x !== 'Model Progress' &&
         x !== 'Drawing' &&
         x !== 'Drawing Progress';
   }));


   const [value, setValue] = useState('Select an option...');
   const [chartRecord, setChartRecord] = useState(false);
   const [modalConfirm, setModalConfirm] = useState(false);


   const onChange = value => {
      setValue('Select an option...');
      setTitleLeft(titleLeft.filter(title => title !== value));
      setColumnsHeaderSorted([...columnsHeaderSorted || [], value]);
   };


   const onResetHandle = () => {
      setColumnsHeaderSorted(null);
      setTitleLeft(headers);
   };


   const onRemoveCategory = (e) => {
      const btnName = e.target.previousSibling.previousSibling.innerText;
      setColumnsHeaderSorted(columnsHeaderSorted.filter(x => x !== btnName));
      setTitleLeft([...titleLeft, btnName]);
   };


   const sortedTableOpen = () => {
      if (!columnsHeaderSorted) {
         openDrawingTable({
            projectId,
            panel,
            type: 'Pivot Table All',
         });
      } else {
         setModalConfirm(true);
      }
   };


   const confirmShowSelected = (isShowSelectedOnly) => {
      openDrawingTable({
         projectId,
         panel,
         type: 'Pivot Table Group',
         isShowSelectedOnly,
         headersGroup: columnsHeaderSorted
      });
   };


   return (
      <div style={{ marginTop: '10px', padding: '20px' }}>
         {columnsHeaderSorted && columnsHeaderSorted.map(cl => (
            <div key={cl} style={{ display: 'flex', width: '100%', margin: '10px auto', padding: 5, border: `1px solid ${colorType.grey1}`, borderRadius: 3 }}>
               <span style={{ marginRight: 5 }}>{cl}</span>
               <Divider type='vertical' style={{ height: 21 }} />
               <span
                  style={{
                     marginRight: 15,
                     color: colorType.red,
                     cursor: 'pointer',
                     textAlign: 'center'
                  }}
                  onClick={onRemoveCategory}
               >X</span>
            </div>
         ))}

         <Select
            value={value}
            showSearch
            style={{ width: '100%', margin: '0 auto', display: 'table' }}
            placeholder='Select a title'
            optionFilterProp='children'
            onChange={onChange}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
         >
            {titleLeft.map(cl => (
               <Select.Option value={cl} key={cl}>{cl}</Select.Option>
            ))}
         </Select>

         <div style={{ display: 'flex', paddingBottom: '15px' }}>
            <Button
               style={{ background: colorType.grey0, width: '100%', margin: '10px auto' }}
               onClick={sortedTableOpen}
            >Sorted table</Button>

            <Button
               style={{ background: colorType.grey0, width: '100%', margin: '10px auto' }}
               onClick={onResetHandle}
            >Reset</Button>
         </div>

         <Divider type='horizontal' style={{ padding: '3px 0' }} />

         <div style={{ fontSize: '18px', fontWeight: 'bold', width: '100%', textAlign: 'center', paddingBottom: '10px' }}>Chart report</div>
         <Button
            style={{ background: colorType.grey4, width: '100%' }}
            onClick={() => setChartRecord(true)}
            disabled={true}
         >Chart Report (Experiment)</Button>


         <Modal
            title={`Record ${projectName}`}
            visible={chartRecord}
            onCancel={() => setChartRecord(false)}
            width={0.9 * window.innerWidth}
            footer={null}
            bodyStyle={{ padding: 15 }}
         >
            <ChartBarRecordPanel
               data={dataRecordedDummy}
            />
         </Modal>

         <Modal
            title='Do you want to show all columns or selected one?'
            visible={modalConfirm}
            onCancel={() => setModalConfirm(false)}
            footer={null}
         >
            <Button onClick={() => {
               confirmShowSelected(true);
               setModalConfirm(false);
            }}
               style={{ margin: 15 }}
            >Show selected only</Button>

            <Button onClick={() => {
               confirmShowSelected(false);
               setModalConfirm(false);
            }}>Show all</Button>

         </Modal>

      </div>
   );
};

export default FormPivot;



