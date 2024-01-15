import { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import FormComponent from './components/Form/index'
import FromGenerator from './components/FormGenerator/index'
import NotFound from './components/NotFound/index';
import Tables from './components/Table.js';
const rowsPerPageOptions = [10, 20, 50];

const columns = [
  { id: 'formID', label: 'Form ID', minWidth: 100 },
  { id: 'name', label: 'Form Name', minWidth: 100 },
  // { id: 'status', label: 'Status', minWidth: 90 },
  { id: 'actions', label: 'ACTIONS', minWidth: 200, },
];
const buttons = [
  { id: 'view', label: 'View', minWidth: 100, format: "button" },
  { id: 'form', label: 'Fill Form', minWidth: 100, format: "button" },
  { id: 'delete', label: 'Delete', minWidth: 100, format: "button" }
]
function App() {
  const location = useLocation()
  const [allFormData, setAllFormData] = useState([])
  const [rows, setRows] = useState([])


  useEffect(() => {
    const dataVal = JSON.parse(localStorage.getItem('data'))?.length > 0 ? JSON.parse(localStorage.getItem('data')) : [];

    const value = dataVal.map((curr, ind) => {
      const { city, imageUrl, videoUrl, audience, productList, channel, ...rest } = curr;
      return rest;
    })
    localStorage.setItem('data', JSON.stringify(dataVal))
    setAllFormData(value)
    setRows(value)
  }, [location])

  return (
    <div className="displayComponent">
      <div className="header">OnlineSales.AI</div>

      <Routes>
        <Route path="/" 
          element={ <Tables columns={columns} rowsPerPageOptions={rowsPerPageOptions} rows={rows} buttons={buttons} />}
        />
        <Route path="/fillForm/:formID" exact element={<FormComponent />} />
        <Route path="/viewForm/:formID" element={<FromGenerator viewData={true} />} />
        <Route path="/createForm" exact element={<FromGenerator/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;