



// export const SERVER_URL = 'http://localhost:9000/api';
export const SERVER_URL =  window.location.origin.includes('https://bim.wohhup.com') ?'https://bim.wohhup.com/api' : 'http://localhost:8081/api'





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
   orange2: '#ff6600',
   purple: '#303952',
   rose: '#e84118',
   black: 'black',
   pp: '#9b59b6',
   pp2: '#bf95d0',

   grey9: '#b3cccc',

};



export const pieChartColors2 = {
   'Approved with Comment, no submission Required': colorType.green,
   'Approved for Construction': colorType.blue,

   'Approved with comments, to Resubmit': colorType.orange2,
   'Reject and resubmit': colorType.red,
   'Revise In-Progress': colorType.yellow,

   'Consultant reviewing': colorType.grey2,

   'Not Started': colorType.orange,

   '1st cut of drawing in-progress': colorType.pp2,
   '1st cut of model in-progress': colorType.pp,
   'Pending design': colorType.grey9,





   // color resubmit chart
   'Approved in previous version but need resubmit': colorType.orange2,
   'Reject, to resubmit': colorType.red,




   'Consultant review and reply': colorType.blue,
   'Create update drawing': colorType.orange,
   'Create update model': colorType.green,
};


export const sizeType = {
   xs: 576,
   md: 768,
   lg: 992,
   xl: 1200
};


export const dataScheme = {
   projectsDummy: [
      { name: 'Sumang', year: 2012, delayConstruction: 998, delayApproval: 550, productivity: 0.75 },
      { name: 'Garden', year: 2013, delayConstruction: 1170, delayApproval: 600, productivity: 0.55 },
      { name: 'Jokoon', year: 2014, delayConstruction: 500, delayApproval: 750, productivity: 0.4 },
      { name: 'Kembangan', year: 2015, delayConstruction: 650, delayApproval: 900, productivity: 0.6 },
      { name: 'KCDE', year: 2016, delayConstruction: 800, delayApproval: 590, productivity: 0.75 },
      { name: 'Handy', year: 2017, delayConstruction: 750, delayApproval: 350, productivity: 0.85 },
      { name: 'Funan', year: 2018, delayConstruction: 300, delayApproval: 305, productivity: 0.7 },
      { name: 'Gul Circle', year: 2019, delayConstruction: 400, delayApproval: 415, productivity: 0.1 },
      { name: 'Changi T5', year: 2020, delayConstruction: 680, delayApproval: 435, productivity: 0.4 },
      { name: 'Dleedon', year: 2021, delayConstruction: 800, delayApproval: 395, productivity: 0.75 },
   ],
   overdueDummy: [
      { name: 'Late for construction 1/51', value: 5 },
      { name: 'Overdue date of submissions 49/51', value: 90 },
      { name: 'Overdue date of approval 35/51', value: 76 }
   ],
   revisionCounts: [
      { name: 'Rev 0', nos: 350 },
      { name: 'Rev A', nos: 211 },
      { name: 'Rev B', nos: 256 },
      { name: 'Rev C', nos: 58 },
      { name: 'Rev D', nos: 42 }
   ]
};



export const chartWidth = window.innerWidth >= sizeType.xl ? (window.innerWidth - 160) / 4 :
   window.innerWidth >= sizeType.md ? (window.innerWidth - 80) / 2 :
      window.innerWidth - 100;








