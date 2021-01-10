import { Card, Row } from 'antd';
import React from 'react';
import { colorType } from '../assets/constantDashboard';



const CardPanelProject = ({ children, title, projectsCount }) => {


    return (
        <Card
            title={title}
            style={{
                margin: 0, boxShadow: '5px 15px 24px 5px #d2dae2',
                border: 'none',
                paddingBottom: 20,
                marginBottom: 20,
                borderRadius: 20, overflow: 'hidden',
                height: projectsCount === 1 && window.innerHeight * 0.9
            }}
            bodyStyle={{
                margin: 'auto',
                padding: 0,
            }}
            headStyle={{
                backgroundColor: colorType.grey2,
                color: 'white',
                lineHeight: '15px'
            }}
        >
            <div style={{ margin: '20px' }}>
                <Row justify='space-around'>
                    {children}
                </Row>
            </div>
        </Card>
    );
};

export default CardPanelProject;
