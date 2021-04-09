import { Button, DatePicker, Input } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import { colorType } from '../../constants';

const FormDateAutomation = ({ applyDateAutomation }) => {




    const onChangeNosOfDays = (header, e) => {
        setState({ ...state, [header]: e.target.value });
    };


    const [state, setState] = useState(getInitObj(arrHeaders));
    const [date, setdate] = useState(moment());

    const [defaultDate, setDefaultDate] = useState(null);



    const onClickCalculate = () => {
        setDefaultDate(addDatesCalculation(state, date, arrHeaders));
    };

    const onChangePickdate = (e) => {
        setdate(e);
    };


    return (
        <div style={{
            // height: '80vh',
            background: 'white',
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Date Automation</div>
            <div style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                marginBottom: 15
            }}>
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
            </div>
            <Button
                style={{ background: colorType.grey3 }}
                onClick={() => applyDateAutomation(defaultDate)}
                disabled={defaultDate === null ? true : false}
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
            // width: 300
        }}>
            <DatePicker
                onChange={onChangePickdate}
                format='DD/MM/YY'
                disabled={disabled}
                value={header === 'Construction Start' ? firstItemValue : defaultDate ? defaultDate[header] : moment()}
                style={{
                    marginRight: 10,
                    width: 100
                }}
            />

            {firstItem ? (
                <Input
                    defaultValue='7'
                    onChange={(e) => onChangeNosOfDays(header, e)}
                    type='number'
                    min='1'
                    style={{
                        width: 90
                    }}
                />
            ) : (
                    <Button onClick={onClickCalculate} style={{
                        width: 90,
                        background: colorType.grey3
                    }}>Calculate</Button>
                )}
            <div style={{ marginLeft: 15 }}>
                {header}
            </div>
        </div>
    );
};


export const arrHeaders = [
    'Model Start (T)',
    'Model Finish (T)',
    'Drawing Start (T)',
    'Drawing Finish (T)',
    'Drg To Consultant (T)',
    'Consultant Reply (T)',
    'Get Approval (T)',
    'Construction Issuance Date',
    'Construction Start',
].reverse();

const getInitObj = (arr) => {
    let obj = {};
    arr.forEach(dt => {
        obj[dt] = '7';
    });
    return obj
};


const addDatesCalculation = (state, e, arrHeaders) => {
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