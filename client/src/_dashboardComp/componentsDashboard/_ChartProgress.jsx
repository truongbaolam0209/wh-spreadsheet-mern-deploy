import { Modal, Progress } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../assets/constantDashboard';
import { getDrawingLateNow1 } from '../utils/functionDashboard';


const _ChartProgress = ({ data, projectName, openDrawingTable }) => {

    const { rowsAll, headers } = data;

    const drawingsLateSubmission = getDrawingLateNow1(rowsAll, 'Drg To Consultant');
    const drawingsLateApproval = getDrawingLateNow1(rowsAll, 'Get Approval');


    const lateForConstruction = projectName === 'Handy' ? 6 : projectName === 'Sumang' ? 15 : null;

    const dataInput = [
        {
            name: `Late for construction ${lateForConstruction}/${rowsAll.length}`,
            value: lateForConstruction
        },
        {
            name: `Overdue date of submission ${drawingsLateSubmission.length}/${rowsAll.length}`,
            value: drawingsLateSubmission.length
        },
        {
            name: `Overdue date of approval ${drawingsLateApproval.length}/${rowsAll.length}`,
            value: drawingsLateApproval.length
        }
    ];


    const progressBarClick = (name) => {
        let dwgs;
        let category;
        if (name.includes('construction')) {
            dwgs = [];
            category = 'Late for construction';
        } else if (name.includes('submission')) {
            dwgs = drawingsLateSubmission;
            category = 'Overdue date of submission';
        } else if (name.includes('approval')) {
            dwgs = drawingsLateApproval;
            category = 'Overdue date of approval';
        };

        openDrawingTable(
            projectName,
            { type: 'Overdue Drawings', category: category },
            dwgs,
            headers
        );
    };

    const [modalShown, setModalShown] = useState(false);
    const drawingStatusTableOnClose = () => {
        setModalShown(false);
    };



    return (
        <>
            <div style={{ width: '80%', margin: '25px auto' }}>

                {dataInput.map(item => (
                    <Container key={item.name} onClick={() => progressBarClick(item.name)}>
                        <span>{item.name}</span>
                        <Progress
                            trailColor='#eee'
                            strokeColor={colorType.red}
                            percent={Math.round(item.value / rowsAll.length * 100)}
                            style={{ paddingBottom: 29 }}
                        />
                    </Container>
                ))}
            </div>


            <Modal
                title={'xxx'}
                centered
                visible={modalShown}
                onOk={drawingStatusTableOnClose}
                onCancel={drawingStatusTableOnClose}
            >
                <h1>{`Total drawing x}`}</h1>
                <h2>{`Overdue date of approval x`}</h2>
            </Modal>
        </>

    );
};

export default _ChartProgress;

const Container = styled.div`
    :hover {
        cursor: pointer;
        span {
            color: #b33939;
            font-weight: bold;
        }
    }


`;

