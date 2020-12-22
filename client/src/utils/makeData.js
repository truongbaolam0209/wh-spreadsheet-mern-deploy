import { mongoObjectId } from '.';



const range = len => {
    const arr = []
    for (let i = 0; i < len; i++) {
        arr.push(i)
    }
    return arr
}

const newPerson = () => {

    return {
        // 'Level': namor.generate({ words: 1, numbers: 0 }),
        'Level': '',
        'RFA Ref': '',
        'Drawing Number': 'DRAWING NUMBER CATEGORY',
        'Use For': '',
        'Unit/CJ': '',
        'Drawing Name': '',
        'Block/Zone': '',
        'Drg Type': '',
        'Coordinator In Charge': '',
        'Modeller': '',
        'Model Start (T)': '',
        'Model Start (A)': '',
        'Model Finish (T)': '',
        'Model Finish (A)': '',
        'Model Progress': '',
        'Drawing Start (T)': '',
        'Drawing Start (A)': '',
        'Drawing Finish (T)': '',
        'Drawing Finish (A)': '',
        'Drawing Progress': '',
        'Drg To Consultant (T)': '',
        'Drg To Consultant (A)': '',
        'Consultant Reply (T)': '',
        'Consultant Reply (A)': '',
        'Get Approval (T)': '',
        'Get Approval (A)': '',
        'Construction Issuance Date': '',
        'Construction Start': '',
        'Rev': '',
        'Status': '',
        'Remark': '',
        id: mongoObjectId(),
        parentId: null,
        _rowLevel: 0
    }
}

export default function makeData(...lens) {
    const makeDataLevel = (depth = 0) => {
        const len = lens[depth]
        return range(len).map(d => {
            return {
                ...newPerson(),
                // subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
            }
        })
    }

    return makeDataLevel()
}











const newPerson2 = () => {

    return {
        // 'Level': namor.generate({ words: 1, numbers: 0 }),
        'Level': '',
        'RFA Ref': '',
        'Drawing Number': 'DRAWING NUMBER CATEGORY',
        'Use For': '',
        'Unit/CJ': '',
        'Drawing Name': '',
        'Block/Zone': '',
        'Drg Type': '',
        'Coordinator In Charge': '',
        'Modeller': '',
        'Model Start (T)': '',
        'Model Start (A)': '',
        'Model Finish (T)': '',
        'Model Finish (A)': '',
        'Model Progress': '',
        'Drawing Start (T)': '',
        'Drawing Start (A)': '',
        'Drawing Finish (T)': '',
        'Drawing Finish (A)': '',
        'Drawing Progress': '',
        'Drg To Consultant (T)': '',
        'Drg To Consultant (A)': '',
        'Consultant Reply (T)': '',
        'Consultant Reply (A)': '',
        'Get Approval (T)': '',
        'Get Approval (A)': '',
        'Construction Issuance Date': '',
        'Construction Start': '',
        'Rev': '',
        'Status': '',
        'Remark': '',
        _id: mongoObjectId(),
        _parentId: null,
        _rowLevel: 0
    }
}
export function makeData2(...lens) {
    const makeDataLevel = (depth = 0) => {
        const len = lens[depth]
        return range(len).map(d => {
            return {
                ...newPerson2(),
            }
        })
    }

    return makeDataLevel()
}
