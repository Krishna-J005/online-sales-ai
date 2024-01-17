import {
    CouponPropertiesMap, validationCheck, CouponPropertiesSet, FieldHeader, FlexContainer, FormGroup, FormLabel,
    FlexRowContainer, FormInput, MultiSelect,
} from './style'
// import ApiService from '../../utilities/apiService';

// import {GET_ALL_COUPON,GET_COUPON_BY_ID} from '../../constants/url'
import * as Yup from 'yup'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';


import {
    Formik,
    Form,
    FieldArray,
} from 'formik'
import Button from '@mui/material/Button';
import { useState, useEffect, useCallback } from 'react';

const getStoryPropertyValue = () => {
    const storyVal = {}
    Object.keys(CouponPropertiesSet).map((val) => {
        storyVal[val] = {}
        CouponPropertiesSet[val].forEach(item => prepareData(item, val, storyVal))
    })
    return storyVal;
}
const prepareData = (item, val, offerVal) => {
    if (!offerVal[val]) offerVal[val] = {}
    else if (item.type === 'subChildren') return offerVal[val][item.key] = [{
       key: "",
       value: "",
    }];
    else return offerVal[val][item.key] = ''
}
const CouponProperty = (props) => {
    const [formValues, setFormValues] = useState(null)
    const [validatedAll, setValidatedAll] = useState(null)
    const [pending, setPending]  = useState(true);
      const onSubmitSuccess = (message = "Coupon") => {
        
      };
    
      const onSubmitFail = (message = "Request Failed") => {
        
    };


    const validationSchemaCheck = useCallback(() => {
        return (setValidatedAll({ ...validationCheck }))
    }, [])

    useEffect(() => {
        validationSchemaCheck()
    }, [])

    const prepareEditData = (editData)=> {
        const {...rest} = editData;
        if(rest['extraInfoMap']) {
        rest['extraInfoMap'] = []
        editData['extraInfoMap'] && Object.keys(editData['extraInfoMap']).forEach((val) => {
          rest['extraInfoMap'].push({key: val, value:  editData['extraInfoMap'][val]})
        })
    }
    return rest;
}

    useEffect(()=> {
        if(!formValues && !props.editdata){
            setFormValues(getStoryPropertyValue())
            validationSchemaCheck()
            }
        else if(!formValues && props.editdata && Object.keys(props.edit).length >0) {
            let editData = prepareEditData(props.edit)
            let obj ={coupons: editData}
            setFormValues({...formValues,...obj})
            validationSchemaCheck()
              }
              setPending(false)
    },[])

    const getDerivedHtml = (item, itemName, index, formObj) => {
        let name = '', values = '', error = '', showError = ''
        return (
            <>
             <div style={{width: "100%"}}>
              <FieldHeader style={{width:'100%'}}>{item.label}</FieldHeader> 
              <FieldArray name='subComponent' render={arrayhelpers => (
                formObj?.values?.[itemName]?.[item['key']] ?
                    formObj?.values?.[itemName]?.[item['key']].map((val, ind) => {
                        return (
                            <FlexRowContainer>{
                                item.children.map((child,i) => {
                                    debugger
                                    name = `${itemName}.${item['key']}[${ind}][${child.key}]`
                                    error = formObj?.errors[itemName]?.[item.key]?.[ind]?.[child.key]
                                    values = formObj.values[itemName]?.[item.key]?.[ind]?.[child.key]
                                    showError = error==='Required' && formObj.touched?.[itemName]?.[item.key]?.[ind]?.[child.key]
                                    return(
                                        <>
                                    <FormGroup>
                                        <FormLabel required={item.validation[0] === 'required'}>{child.label}</FormLabel>
                                        <FormInput type={child.type} medium name={name}
                                            value={values}
                                            onBlur={(e) => formObj.handleBlur(e)}
                                            onChange={(e) => {
                                                formObj.setFieldValue(e.target.name, e.target.value)
                                            }}>
                                        </FormInput>
                                        {showError && (<div style={{ color: 'red', marginTop: '.5rem' }}>{error}</div>)}
                                    </FormGroup>
                                    
                                </>)
                                })
                                
                            }
                            </FlexRowContainer>)
                    }) : null )
                }
            /> 
             <Button variant="contained" color="secondary" onClick={(e) => { addInfo(e, item, itemName, formObj) }}
            style={{ margin: '10px', padding: '10px 15px', width: '20%' }}>Add ExtraInfo
        </Button> 
        </div>
            </>  
        )
    }

    const addInfo =(e, item, itemName, formObj) => {
        formObj.values[itemName][item['key']] = !formObj?.values?.[itemName]?.[item['key']] ? []: formObj?.values?.[itemName]?.[item['key']]
        formObj?.values?.[itemName]?.[item['key']].push({
            key: '',
            value: ''
        })

        setFormValues({...formObj?.values})
    }

    

const getDerivedInputHtml = (item, itemName, index, formObj) => {
    let name = `${itemName}.${item.key}`
        let values = `${formObj.values[itemName][item.key]}`
        let error = formObj.errors?.[itemName]?.[item['key']]
        let showError = error && (error === 'Required'|| error.length>0) && formObj.touched?.[itemName]?.[item['key']]

    return (
        <FormGroup>
            <FormLabel required={item.validation[0] === 'required'}>{item.label}</FormLabel>
            <FormInput type={item.type} medium name={name}
                value={values}
                onBlur={(e) => formObj.handleBlur(e)}
                onChange={(e) => formObj.setFieldValue(name, e.target.value)}
            ></FormInput>
            {showError && (<div style={{ color: 'red', marginTop: '.5rem' }}>{error}</div>)}
        </FormGroup>
    )
}

const handleSubmit = async (e, formObj ,formik) => {
    formik.validateForm().then(err => {
        if(Object.keys(err)?.length > 0 && Object.keys(err?.coupons)?.length>0) {
        formik.setTouched({ ...formik.touched, ...err });
        return;
        } else {
            couponSubmit(e,formObj, formik)
        }
})
}

const couponSubmit = async(e,formObj, formik) => {
    e.preventDefault();
    setPending(true)
        const obj = {}
        let payload = { ...formObj.coupons }
        const extraInfoMap = payload.extraInfoMap;
        if(payload?.['extraInfoMap']?.length > 0) {
            const obj = {"extraInfoMap": {}}
            payload?.['extraInfoMap']?.map(val => {
               if(val['key'] !== '') {
                obj['extraInfoMap'][val['key']] = val['value']
               }
             })
             payload['extraInfoMap'] = obj['extraInfoMap']
            }
            else if(payload?.['extraInfoMap']?.length === 0) {
                const d = {}
                payload['extraInfoMap']= d
            }
            console.log(payload)
            if(props.editdata && !props.copy)
            try {
                const data = {}
                console.log(data, "HandleSubmit response")
                payload.extraInfoMap = extraInfoMap;
                let obj = {coupons: payload}
                setFormValues({...obj})
                onSubmitSuccess('Coupon Updated')
                setPending(false)
            }
            catch(err) {
                console.log("erroMessage",err)
                onSubmitFail(err.userMessage)
                setPending(false);
            }
            else {
                try {
                    const data = {};
                    console.log(data, "HandleSubmit response")
                    onSubmitSuccess('Coupon Created')
                        setPending(false);
                        
                    setPending(false)
                }
                catch(err) {
                    console.log("erroMessage",err)
                    onSubmitFail(err.userMessage)
                    setPending(false);
                }
            }
}

const createFormHtml = (item, index, formik, itemName) => {

    if (item.type === 'text')
        return getDerivedInputHtml(item, itemName, index, formik)
    else if (item.type === 'subChildren')
        return getDerivedHtml(item, itemName, index, formik)
}

return (
    <>
      {
      pending ? 
      <>Loading</> :
        <Formik
            initialValues={formValues || getStoryPropertyValue()}
            validationSchema={Yup.object(validatedAll)}
            enableReinitialize
        >
            {
                formik => {
                    console.log("Formik", formik)
                    return (
                        <Form>
                            {Object.keys(CouponPropertiesSet).map((item, index) => {
                                return (
                                    <>
                                        <FieldHeader>{CouponPropertiesMap[item]}</FieldHeader>
                                        <FlexContainer key={`coupon${index}`}>
                                            {
                                                CouponPropertiesSet[item].map((items, ind) => {
                                                    return createFormHtml(items, ind, formik, item)
                                                })
                                            }
                                        </FlexContainer>
                                    </>
                                )
                            })
                            }
                           {  (<><div style={{ display: 'flex', justifyContent: 'end' }}>
                                        {(Object.keys(formik.errors).length > 0 && Object.keys(formik.touched).length > 0) && <div style={{ color: 'red', margin: '.5rem', fontWeight: 'bold' }}>Required field are Missing</div>}
                                    </div>
                                   
                                    <div style={{ display: 'flex', justifyContent: 'end' }}>
                                  
                                        <Button
                                            type="submit"
                                            color="primary"
                                            variant="contained"
                                            style={{ margin: '10px', padding: '10px 15px', width: '15%' }}
                                            onClick={(e) => { handleSubmit(e, formik.values ,formik) }}
                                        >
                                            Submit
                                        </Button>
                                    </div> </>
                           )}
                        </Form>
                    )
                }
            }

        </Formik> }
    </>
)
}

export default CouponProperty;