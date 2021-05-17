import { Icon } from 'antd';
import React from 'react';
import styled from 'styled-components';


const LoadingIcon = () => {
   
   return (
      <SpinStyled>
         <Icon type='loading' style={{ fontSize: 40, textAlign: 'center', margin: 'auto' }} />
      </SpinStyled>
   );
};

export default LoadingIcon;


const SpinStyled = styled.div`
   background: rgba(0, 0, 0, 0.05);
   /* background: red; */
   opacity: 0.7;
   position: fixed;
   top: 0;
   left: 0;
   width: ${`${window.innerWidth}px`};
   height: ${`${window.innerHeight}px`};
   display: flex;
   justify-content: center;
   z-index: 1000;
`;