import { Card, Col } from 'antd';
import React from 'react';
import styled from 'styled-components';



const CardPanel = ({ children, title, headColor }) => {


   return (
      <Col style={{ padding: '0 15px' }} xs={{ span: 24 }} md={{ span: 12 }} xl={{ span: 6 }}>
         <CardStyled
            title={title}
            style={{
               // margin: 0, boxShadow: '5px 15px 24px 5px #d2dae2',
               // border: 'none',
               paddingBottom: 20,
               marginBottom: 20,
               // borderRadius: 20, 
               overflow: 'hidden'
            }}
            bodyStyle={{
               margin: 'auto',
               padding: 0
            }}
            headStyle={{
               backgroundColor: headColor,
               color: 'white',
               lineHeight: '15px',
            }}
         >
            {children}
         </CardStyled>
      </Col>
   );
};


export default CardPanel;



const CardStyled = styled(Card)`

   .ant-card-head {
      /* height: 250px; */
      min-height: 25px;
      padding: 10px;
      margin: 0;
   }
   .ant-card-head-wrapper {
      height: 15px;
      padding: 0;
      margin: 0;
   }
`;