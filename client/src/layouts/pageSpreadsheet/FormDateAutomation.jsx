import { Button, DatePicker, Input } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';

const FormDateAutomation = ({ applyDateAutomation }) => {




    const onChangeNosOfDays = (header, e) => {
        setState({ ...state, [header]: e.target.value });
    };


    const [state, setState] = useState(getInitObj(arrHeaders));
    const [date, setdate] = useState(moment());

    const [defaultDate, setDefaultDate] = useState(null);



    const onClickCalculate = () => {
        setDefaultDate(ttttttttttt(state, date, arrHeaders));
    };

    const onChangePickdate = (e) => {
        setdate(e);
    };


    return (
        <div>
            
            {arrHeaders.map((hd, i) => (
                <DatePickerComp
                    key={hd}
                    header={hd}
                    disabled={!(i === 0)}
                    firstItem={!(i === 0)}
                    firstItemValue={date}
                    onChangeNosOfDays={onChangeNosOfDays}
                    onClickCalculate={onClickCalculate}
                    onChangePickdate={onChangePickdate}
      
                    defaultDate={defaultDate}

                />
            ))}
            <Button 
            onClick={() => applyDateAutomation(defaultDate)} 
            style={{ width: 6 }}
            >Assign Date</Button>
        </div>
    );
};


export default FormDateAutomation;




const DatePickerComp = ({ 
    header, 
    disabled, 
    firstItem, 
    onChangeNosOfDays, 
    onClickCalculate,
    onChangePickdate,
    defaultDate,
    firstItemValue
}) => {

    return (
        <div style={{
            display: 'flex',
            marginBottom: 10,
            width: '50vw'
        }}>
            <DatePicker
                onChange={onChangePickdate}
                format='DD/MM/YY'
                disabled={disabled}
                value={header === 'Construction Start' ? firstItemValue : defaultDate ? defaultDate[header] : moment()}
                style={{
                    marginRight: 10
                }}
            />

            {firstItem ? (
                <Input
                    defaultValue='5'
                    onChange={(e) => onChangeNosOfDays(header, e)}
                    type='number'
                    min='1'
                    style={{
                        width: 60
                    }}
                />
            ) : (
                <Button onClick={onClickCalculate} style={{
                    width: 60
                }}>CAL</Button>
            )}
            <div style={{ marginLeft: 15 }}>
                {header}
            </div>
        </div>
    );
};


export const arrHeaders = [
    'Model Start (T)',
    'Model Start (A)',
    'Model Finish (T)',
    'Model Finish (A)',
    'Drawing Start (T)',
    'Drawing Start (A)',
    'Drawing Finish (T)',
    'Drawing Finish (A)',
    'Drg To Consultant (T)',
    'Drg To Consultant (A)',
    'Consultant Reply (T)',
    'Consultant Reply (A)',
    'Get Approval (T)',
    'Get Approval (A)',
    'Construction Issuance Date',
    'Construction Start',
].reverse();

const getInitObj = (arr) => {
    let obj = {};
    arr.forEach(dt => {
        obj[dt] = '5';
    });
    return obj
};


const ttttttttttt = (state, e, arrHeaders) => {
    let obj = {};
    let days = 0;
    arrHeaders.forEach((hd, i) => {
        if (i === 0) {
            obj[hd] = e;

        } else {
            let daysMinus = parseInt(state[hd]) + days;
            days += parseInt(state[hd]);
            obj[hd] = moment(e).add(daysMinus * (-1), 'days');
        };
    })
    return obj;
};