import { Icon } from 'antd';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { colorType, dimension } from '../../constants';




const SideBar = ({ closeSideBar, projectOnClick, sheetLoading }) => {

    const refSide = useRef()

    useEffect(() => {
        refSide.current.style.transform = 'translate(0, 0)';
    }, []);

    console.log(sheetLoading);
    
    const projectsArr = [
        'KCDE',
        'Sumang',
        'Funan',
        'Handy'
    ];

    return (
        <>
            <SideBarStyled ref={refSide}>

                <div style={{
                    width: 40,
                    height: '100vh',
                    background: colorType.primary,
                }}>
                </div>

                <div style={{
                    width: 250,
                    height: '100vh',
                    background: colorType.secondary,
                }}>
                    <div style={{ padding: 7, cursor: 'default', fontSize: 16 }}>PROJECT LIST</div>
                    {projectsArr.map(pr => (
                        <ProjectStyled key={pr} onClick={() => projectOnClick(pr)}>
                            <Icon
                                type='file'
                                style={{ transform: 'translate(0, 4px)', color: 'white' }}
                            />
                            <div style={{ color: 'white', marginLeft: 8 }}>
                                {pr}
                            </div>
                        </ProjectStyled>
                    ))}
                </div>
            </SideBarStyled>

            <div style={{
                position: 'fixed',
                top: dimension.navBarHeight,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 10000,
                background: 'black',
                opacity: 0.5,
                textAlign: 'center'
            }} onClick={closeSideBar}
            >
                {sheetLoading && (
                    <Icon type='loading' />
                )}
            </div>

        </>
    );
};

export default SideBar;


const SideBarStyled = styled.div`

    position: fixed;
    left: 0;
    top: ${dimension.navBarHeight};
    z-index: 10001;
    display: flex;
    transform: translate(-290px, 0);
    transition: 0.3s;
`;


const ProjectStyled = styled.div`
    padding: 10px;
    display: flex;
    cursor: pointer;

    &:hover {
        background-color: ${colorType.primary}
    }
    transition: 0.2s

`;