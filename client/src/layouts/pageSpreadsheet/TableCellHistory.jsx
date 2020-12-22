import { List } from 'antd';
import React from 'react';


const TableCellHistory = () => {

    const data = [
        { user: 'Anne', title: 'Modeller', content: 'Not Started', createdAt: '15/10/20 - 14:25 PM' },
        { user: 'Hannah', title: 'Coordinator In Charge', content: 'Consultant Reviewing', createdAt: '12/10/20 - 11:25 AM' },
        { user: 'Anne', title: 'Modeller', content: 'Reject And Resubmit', createdAt: '10/10/20 - 13:33 PM' },
    ];
    return (
        <div>
            <List
                size='small'
                header={null}
                footer={null}
                bordered
                dataSource={data}
                renderItem={item => (
                    <List.Item>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{`${item.user} - ${item.title}`}</div>
                            <div style={{ fontSize: 12, color: 'grey' }}>{item.createdAt}</div>
                            <div>{item.content}</div>
                        </div>

                    </List.Item>
                )}
            />
        </div>
    );
};

export default TableCellHistory;
