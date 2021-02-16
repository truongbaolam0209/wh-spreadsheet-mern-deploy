import { Button, Divider, Select } from 'antd';
import React, { useState } from 'react';
import ChartBarRecord from './ChartBarRecord';



const ChartBarRecordPanel = ({ data }) => {



   const [categoryArrayLeft, setCategoryArrayLeft] = useState(Object.keys(data));
   const [categoryArrayShown, setCategoryArrayShown] = useState([]);

   const addMoreCategory = (value) => {
      setCategoryArrayShown([...categoryArrayShown, value]);
      setCategoryArrayLeft(categoryArrayLeft.filter(ca => ca !== value));
   };


   const closeChart = (value) => {
      setCategoryArrayShown(categoryArrayShown.filter(ca => ca !== value));
      setCategoryArrayLeft([...categoryArrayLeft, value]);
   };


   const reportTypeArr = ['Daily report', 'Weekly report', 'Monthly report'];
   const [month, setMonth] = useState('09/20');
   const [reportType, setReportType] = useState('Daily report');


   
   return (
      <div style={{ margin: '0 auto' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', height: 120 }}>

            <div>
               <Select
                  defaultValue='Select ...'
                  style={{ width: 300, paddingBottom: 10 }}
                  onChange={(value) => addMoreCategory(value)}
               >
                  {categoryArrayLeft.map(cate => (
                     <Select.Option key={cate} value={cate}>{cate}</Select.Option>
                  ))}
               </Select>

               <div style={{ paddingBottom: 10 }}>
                  {reportTypeArr.map(item => (
                     <Button 
                        key={item} 
                        onClick={() => setReportType(item)} 
                        size='small'
                        style={{ marginRight: 10, background: item === reportType ? '#DCDCDC' : 'white' }}
                     >{item}</Button>
                  ))}
               </div>

               <div>
                  {reportType === 'Daily report' && (
                     <>
                        {['07/20', '08/20', '09/20', '10/20'].map(m => (
                           <Button
                              key={m}
                              size='small'
                              style={{ marginRight: 10 }}
                              onClick={() => setMonth(m)}
                           >{m}</Button>
                        ))}
                     </>
                  )}
               </div>
            </div>

            <div style={{ paddingRight: 20, fontSize: 20 }}>Experiment data</div>
            
         </div>

         <Divider style={{ margin: '5px 0 5px 0' }} />

         <div style={{ height: 0.7 * window.innerHeight, overflowY: 'scroll' }}>
            {categoryArrayShown.map(category => (
               <ChartBarRecord
                  key={category}
                  data={data}
                  category={category}
                  closeChart={closeChart}
                  reportType={reportType}
                  month={month}
               />
            ))}
         </div>
      </div>
   );
};

export default ChartBarRecordPanel;


