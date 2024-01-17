import { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import FormComponent from './components/Form/index'
import FormGenerator from './components/FormGenerator/index'
import Coupon from './components/couponProperties/index'
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

const formDataColumns = [
  { id: 'formID', label: 'Form ID', minWidth: 100 },
  { id: 'name', label: 'Form Name', minWidth: 100 },
  // { id: 'status', label: 'Status', minWidth: 90 },
  { id: 'actions', label: 'ACTIONS', minWidth: 200, },
];
const formDataButtons = [
  { id: 'view', label: 'View', minWidth: 100, format: "button" },
  { id: 'delete', label: 'Delete', minWidth: 100, format: "button" }
]
function App() {
  const location = useLocation();
  const [allFormData, setAllFormData] = useState([])
  const [rows, setRows] = useState([])
  const key = location.pathname === '/formData' ? 'formData' : 'data';

  useEffect(() => {

    const dataVal = JSON.parse(localStorage.getItem(key))?.length > 0 ? JSON.parse(localStorage.getItem(key)) : [];

    const value = dataVal.map((curr, ind) => {
      const { ...rest } = curr;
      return rest;
    })
    // localStorage.setItem(key, JSON.stringify(dataVal))
    setAllFormData(value);
    setRows(value)
  }, [location])

  return (
    <div className="displayComponent">
      <div className="header">OnlineSales.AI</div>

      <Routes>
        <Route path="/" 
          element={ <Tables columns={columns} rowsPerPageOptions={rowsPerPageOptions} rows={rows} buttons={buttons} createButton={true}/>}
        />
        <Route path="/formData"
          element={
            <Tables columns={formDataColumns} rowsPerPageOptions={rowsPerPageOptions} rows={rows} buttons={formDataButtons} />
          }
        />
        <Route path="/formData/viewForm/:formID/:submitID" element={<FormComponent viewData={true} />} />
        <Route path="/fillForm/:formID" exact element={<FormComponent />} />
        <Route path="/viewForm/:formID" element={<FormGenerator viewData={true} />} />
        <Route path="/createForm" exact element={<FormGenerator/>} />
        <Route path="/coupon" exact element={<Coupon />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;