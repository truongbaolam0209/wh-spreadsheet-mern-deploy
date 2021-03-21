export const cellActiveStyle = {
    background: '#B0C4DE',
    border: '2px solid grey'
};

export const colorType = {
    yellow: '#fff200',
    dark: '#1e272e',
    grey0: '#ecf0f1',
    grey1: '#bdc3c7',
    grey2: '#636e72',
    grey3: '#dfe4ea',
    grey4: '#f1f2f6',
    red: '#b33939',
    green: '#009432',
    blue: '#0984e3',
    orange: '#cc8e35',
    purple: '#303952',
    tableBorderColor: '#A9A9A9',
    cellHighlighted: '#B0C4DE',
    primary: '#34495e',
    secondary: '#46607a',
    lockedCell: '#FDFFE6'
};



export const dimension = {
    tableBorder: '1px',
    headerHeight: 50,
    innerTableHeight: 800,
    cellIndexWidth: '45px',
    bodyTableRowHeight: 28,
    navBarHeight: '53.78px',
};


export const imgLink = {
    timeline: 'https://glcdn.githack.com/baoquylan/resource/-/raw/master/Image/timeline.JPG?fbclid=IwAR3BnkJWSQZMbxqLugNKGPc5ssPeu0aqBdvGZhdRLbIyYGSrpaQwYCioY94',
    btnText: 'https://glcdn.githack.com/baoquylan/resource/-/raw/master/Image/btn-down2.png?fbclid=IwAR0PFlzzsc85rk_98XnYx-3zuhJzvUS7Wen5kGUBxM6HGF2y1K1Gdn9eCAg',
    btnDate: 'https://glcdn.githack.com/baoquylan/resource/-/raw/master/Image/btn-calendar2.png?fbclid=IwAR23I7skpoZQ5of06o7ASoSbIUwaxgsmZczBOPFKTS0RiScaiH42_dCqRwg',
    btnFileUpload: 'https://glcdn.githack.com/baoquylan/resource/-/raw/master/Image/file.png?fbclid=IwAR1Qu9R2okGDvmauZzT97fMJkLALVunz4Vt2Ioqyx8CoQNzg_hnYvMEZyvY',
    btnProgress0: 'https://glcdn.githack.com/baoquylan/resource/-/raw/master/Image/none.png?fbclid=IwAR3p7WExSSO0kGI0w47R_0MAPNmTnkeqHYdQpXmYHrqc_sN9xpj34BwR09Q',
    btnProgress1: 'https://glcdn.githack.com/baoquylan/resource/-/raw/master/Image/quarter.png?fbclid=IwAR03L618oQ7R_Kl8M--1U3UHppxcO-haCmnly_P75YW8iNYutpQo_Tdz1Zw',
    btnProgress2: 'https://glcdn.githack.com/baoquylan/resource/-/raw/master/Image/half.png?fbclid=IwAR2XF9Kvv2InZFm1hVJJIBDJS6QsH7uzS7VrhaG3APao9cRKeRHZKS1OU-4',
    btnProgress3: 'https://glcdn.githack.com/baoquylan/resource/-/raw/master/Image/third.png?fbclid=IwAR1rhcGE7PF3xo6UuvquXaJCFo9XHnDJ87n8aVW6vwgxiY_PZJu4D67vspc',
    btnProgress4: 'https://glcdn.githack.com/baoquylan/resource/-/raw/master/Image/full.png?fbclid=IwAR2BvxI0PvgoY3_TO6RAbgBKEjEKO8AfYpdPI8Yyd9B7RwKIqI4NjFH0blY',
};





const colorTextCode = {
    yellow: '#fff200',
    dark: '#1e272e',
    grey0: '#ecf0f1',
    grey1: '#bdc3c7',
    grey2: '#636e72',
    grey3: '#dfe4ea',
    grey4: '#f1f2f6',
    red: '#b33939',
    green: '#009432',
    blue: '#0984e3',
    orange: '#cc8e35',
    orange2: '#ff6600',
    purple: '#303952',
    rose: '#e84118',
    black: 'black',
    pp: '#9b59b6',
    pp2: '#bf95d0',
    grey9: '#b3cccc',
 };
 
 
 
 export const colorTextRow = {
    'Approved with Comment, no submission Required': colorTextCode.green,
    'Approved for Construction': colorTextCode.blue,
    'Approved with comments, to Resubmit': colorTextCode.orange2,
    'Reject and resubmit': colorTextCode.red,
    'Revise In-Progress': colorTextCode.yellow,

    'Consultant reviewing': colorTextCode.grey2,
 
    'Not Started': colorTextCode.orange,
 
    '1st cut of drawing in-progress': colorTextCode.pp2,
    '1st cut of model in-progress': colorTextCode.pp,
    'Pending design': colorTextCode.grey9,
 };


// export const SERVER_URL = 'http://localhost:9000/api';
export const SERVER_URL = window.location.origin.includes('https://bim.wohhup.com') ? 'https://bim.wohhup.com/api' : 'http://localhost:8081/api'

