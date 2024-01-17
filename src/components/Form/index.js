import { FormPropertiesMap } from './style'
import { FieldHeader, FlexContainer, FormGroup, FormLabel, FlexRowContainer, FormInput, SingleSelect, FormArea, CheckBoxInput, RadioInput } 
from '../CustomComponent/index'
import { Fragment } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import * as Yup from 'yup'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';


import {
    Formik,
    Form,
    FieldArray,
} from 'formik'
import Button from '@mui/material/Button';
import { useState, useEffect, useCallback } from 'react';

export const validationSchema = (FormPropertiesSet) => {
    let validate = {};
    const validateAll = {}
    Object.keys(FormPropertiesSet).forEach((val) => {
        FormPropertiesSet[val].forEach(item => {
            if ((item.validation.includes('required') && (item.type === 'text' || item.type === 'radio'))) {
                validate[item.key] = Yup.string().trim().nullable(true).required('Required')
            }
            else if (item.validation.includes('required') && item.type === 'checkbox'){
                validate[item.key] = Yup.array()
                    .min(1, 'Pick at least 1 ' + item.label)
                    .of(
                        Yup.string().trim().nullable(false).required('Required'),
                    )
            }
        })
        validateAll[val] = Yup.object(validate)
        validate = {}
    })
    return validateAll
}

const getFormValue = (FormPropertiesSet) => {
    const formValue = {}
    Object.keys(FormPropertiesSet).map((val) => {
        formValue[val] = {}
        FormPropertiesSet[val].forEach(item => prepareData(item, val, formValue))
    })
    return formValue;
}
const prepareData = (item, val, offerVal) => {
    if (!offerVal[val]) offerVal[val] = {}
    if (item.type === 'checkbox') return offerVal[val][item.key] = [];
    if (item.type === 'radio') return offerVal[val][item.key] = '';
    else if (item.type === 'number') return offerVal[val][item.key] = '';
    else return offerVal[val][item.key] = ''
}

const FormComponent = (props) => {
    const channelList = ['Email', 'Social Media', 'Website']
    const param = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const key = location.pathname.includes('/formData') ? 'formData' : location.pathname.includes('/fillForm') ? 'formData' : 'data';
    const [formValues, setFormValues] = useState(null)
    const [validatedAll, setValidatedAll] = useState(null)
    const [pending, setPending] = useState(true);
    const [data, setData] = useState([]);
    
    const getFormHTML = () => {
        const localData = localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : [];
        const val = localData.filter((curr, ind) => {
            return curr.formID === param.formID
        });
        
        const { name, formID, ...rest } = val[0];
        const prepareHTML = rest.field.map(curr => {
            const {isRequired, ...rest} = curr;
            rest.validation = [isRequired == true ? 'required': ''];
            return rest;
        })
        return { form: prepareHTML };
    }
    const FormPropertiesSet = getFormHTML();
    const validationCheck = validationSchema(FormPropertiesSet);
    const validationSchemaCheck = useCallback(() => {
        return (setValidatedAll({ ...validationCheck }))
    }, [])


    useEffect(() => {
        validationSchemaCheck()
    }, [])

    useEffect(() => {
        const localData = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
        setData(localData)
        if (!formValues && props.editData === false) {
            setFormValues(getFormValue(FormPropertiesSet))
            validationSchemaCheck()
        }
        else if ((!formValues && props.editData) || (!formValues && props.viewData)) {
            const val = localData.filter((curr, ind) => {
                return curr.formID == param.formID && curr.submitID == param.submitID
            })
            const form = { ...val[0] }

            setFormValues({ ...formValues, form })
            validationSchemaCheck()
        }
        setPending(false)
    }, [])



    const getDerivedHtml = (item, itemName, index, formObj) => {
        let name = '', values = '', error = '', showError = ''
        return (
            <div style={{ width: "100%" }} key={index}>
                <FieldHeader style={{ width: '100%' }}>{item.label}</FieldHeader>
                <FieldArray name='subComponent' render={arrayhelpers => (
                    formObj?.values?.[itemName]?.[item['key']] ?
                        formObj?.values?.[itemName]?.[item['key']].map((val, ind) => {
                            return (
                                <FlexRowContainer key={ind}>{
                                    item.children.map((child, i) => {
                                        name = `${itemName}.${item['key']}[${ind}][${child.key}]`
                                        error = formObj?.errors[itemName]?.[item.key]?.[ind]?.[child.key]
                                        values = formObj.values[itemName]?.[item.key]?.[ind]?.[child.key]
                                        showError = error?.length > 0 && formObj.touched?.[itemName]?.[item.key]?.[ind]?.[child.key]
                                        return (
                                            <Fragment key={i}>
                                                <FormGroup>
                                                    <FormLabel required={item.validation[0] === 'required'}>{child.label}{child.validation[0] === 'required' && ' *'}</FormLabel>
                                                    {
                                                        child.type !== 'select' ?

                                                            <FormInput type={child.type} medium name={name}
                                                                value={values}
                                                                onBlur={(e) => {
                                                                    if (item.type === 'text') formObj.setFieldValue(name, e.target.value.trim())
                                                                    formObj.handleBlur(e)
                                                                }
                                                                }
                                                                disabled={props.viewData === true}
                                                                onChange={(e) => {
                                                                    formObj.setFieldValue(e.target.name, e.target.value)
                                                                }}>
                                                            </FormInput>
                                                            :
                                                            <SingleSelect
                                                                name={name}
                                                                value={values}
                                                                onChange={e => {
                                                                    formObj.setFieldValue(e.target.name, e.target.value)
                                                                }
                                                                }
                                                                onBlur={(e) => {
                                                                    formObj.handleBlur(e)
                                                                }
                                                                }
                                                                disabled={props.viewData === true}
                                                                key={i}
                                                                id={`select_${child.key}`}
                                                                required
                                                            >
                                                                <option value="" disabled >Select {child.label}</option>
                                                                {child.key === 'gender' ?
                                                                    <>
                                                                        <option value={'Male'}>Male</option>
                                                                        <option value={'Female'}>Female</option>
                                                                        <option value={'Others'}>Others</option>
                                                                    </>
                                                                    :
                                                                    <>
                                                                        {
                                                                            channelList.map((val, id) => {
                                                                                return <option value={val} key={id}>{val}</option>
                                                                            })
                                                                        }
                                                                    </>

                                                                }
                                                            </SingleSelect>
                                                    }
                                                    {showError && (<div style={{ color: '#D50000', marginTop: '.5rem' }}>{error}</div>)}
                                                </FormGroup>
                                                {   item.children.length - 1 === i && 
                                                    formObj.values[itemName]?.[item.key].length > 1 && <DeleteOutlineIcon style={{ cursor: 'pointer', color: '#D50000', marginTop: '2.8rem' }} onClick={(e) => deleteListRow(e, item, itemName, formObj, ind)}/>
                                                }
                                            </Fragment>)
                                    })

                                }
                                </FlexRowContainer>)
                        }) : null)
                }
                />
                <Button variant="outlined" color="secondary" onClick={(e) => { addInfo(e, item, itemName, formObj) }}
                    disabled={props.viewData === true}
                    style={{ margin: '10px', padding: '8px 12px', width: '200px', textTransform: 'none' }}>
                    Add {item.key === 'productList' ? 'Products' : item.key}
                </Button>
            </div>
        )
    }



    const addInfo = (e, item, itemName, formObj) => {
        if (item.key == 'audience') {
            formObj.values?.[itemName]?.[item['key']]?.push({
                gender: '',
                minAge: 16,
                maxAge: 40,
            })
        }
        else if (item.key == 'channel') {
            formObj.values?.[itemName]?.[item['key']]?.push({
                src: '',
                message: '',
            })
        }
        else {
            formObj.values?.[itemName]?.[item['key']]?.push({
                productID: '',
                name: '',
                discount: 0,
                productImg: '',
                productUrl: '',
            })
        }
        setFormValues({ ...formObj?.values })
    }

    const deleteListRow = (e, item, itemName, formObj, ind) => {
        e.preventDefault();
        formObj?.values?.[itemName]?.[item.key].splice(ind, 1);
        setFormValues({ ...formObj?.values })

    }

    const getDerivedInputHtml = (item, itemName, index, formObj) => {
        let name = `${itemName}.${item.key}`
        let values = `${formObj.values?.[itemName]?.[item.key]}`
        let error = formObj.errors?.[itemName]?.[item['key']]
        let showError = error && (error === 'Required' || error.length > 0) && formObj.touched?.[itemName]?.[item['key']]
        return (
            <FormGroup key={index}>
                <FormLabel required={item.validation[0] === 'required'}>{item.label} {item.validation[0] === 'required' && ' *'}</FormLabel>
                <FormInput type={item.type} medium name={name}
                    value={values}
                    disabled={props.editData && item.key === 'formID' || props.viewData === true}
                    onBlur={(e) => {
                        if (item.type === 'text') formObj.setFieldValue(name, e.target.value.trim())
                        formObj.handleBlur(e)
                    }}
                    onChange={(e) => formObj.setFieldValue(name, e.target.value)}
                    placeholder={item.placeholder}
                ></FormInput>
                {showError && (<div style={{ color: '#d50000', marginTop: '.5rem' }}>{error}</div>)}
            </FormGroup>
        )
    }

    const getDerivedTextAreaHtml = (item, itemName, index, formObj) => {
        let name = `${itemName}.${item.key}`
        let values = `${formObj.values?.[itemName]?.[item.key]}`
        let error = formObj.errors?.[itemName]?.[item['key']]
        let showError = error && (error === 'Required' || error.length > 0) && formObj.touched?.[itemName]?.[item['key']]
        return (
            <FormGroup key={index}>
                <FormLabel required={item.validation[0] === 'required'}>{item.label} {item.validation[0] === 'required' && ' *'}</FormLabel>
                <FormArea type={item.type} medium name={name}
                    value={values}
                    disabled={props.editData && item.key === 'formID' || props.viewData === true}
                    onBlur={(e) => {
                        if (item.type === 'text') formObj.setFieldValue(name, e.target.value.trim())
                        formObj.handleBlur(e)
                    }}
                    onChange={(e) => formObj.setFieldValue(name, e.target.value)}
                    placeholder={item.placeholder}
                ></FormArea>
                {showError && (<div style={{ color: '#D50000', marginTop: '.5rem' }}>{error}</div>)}
            </FormGroup>
        )
    }

    const handleSubmit = async (e, formObj, formik) => {
        formik.validateForm().then(err => {
            if (Object.keys(err)?.length > 0 && Object.keys(err?.form)?.length > 0) {
                formik.setTouched({ ...formik.touched, ...err });
                return;
            } else {
                createForm(e, formObj, formik)
            }
        })
    }

    const handleCancel = async (e, formObj, formik) => {
        e.preventDefault();
        navigate('/')
    }
    const createForm = async (e, formObj, formik) => {
        e.preventDefault();
        setPending(true)
        let payload = { ...formObj.form }
        try {
            payload.formID = param.formID;
            payload.submitID = new Date().getTime();
            setData([...data, payload])
            localStorage.setItem('formData', JSON.stringify([...data, payload]));
            // console.log("HandleSubmit response")
            navigate('/formData')
            setPending(false);
        }
        catch (err) {
            console.log("erroMessage", err)
            setPending(false);
        }
    }

    const getDerivedSelectHtml = (item, itemName, index, formObj) => {
        let name = `${itemName}.${item.key}`
        let values = formObj?.values?.[itemName]?.[item['key']]
        let error = formObj?.errors?.[itemName]?.[item.key]
        let showError = error && error.length > 0 && formObj.touched?.[itemName]?.[item['key']]

        return (
            <FormGroup key={index}>
                <FormLabel required={item.validation[0] === 'required'}>{item.label} {item.validation[0] === 'required' && ' *'}</FormLabel>
                <SingleSelect
                    name={name}
                    value={values}
                    onChange={(e, value) => {
                        formObj.setFieldValue(name, e.target.value)
                    }
                    }
                    disabled={props.viewData === true}
                    onBlur={(e) => { formObj.handleBlur(e) }}
                    key={index}
                    id={`select_${item.key}`}
                    required
                >
                    <option value="" disabled >Select {item.label}</option>
                    {item.key === 'status' ?
                        <>
                            <option value={'Active'}>Active</option>
                            <option value={'Inactive'}>Inactive</option>
                        </>
                        :
                        <>
                            {
                                item.optionList.map(curr => curr[0]).map((val, id) => {
                                    return <option value={val.value} key={id}>{val.optionLabel}</option>
                                })
                            }
                        </>

                    }
                </SingleSelect>
                {showError && (<div style={{ color: '#D50000', marginTop: '.5rem' }}>{error}</div>)}
            </FormGroup>
        )
    }

    const getDerivedRadioHtml = (item, itemName, index, formObj) => {
        let name = `${itemName}.${item.key}`
        let values = `${formObj.values?.[itemName]?.[item.key]}`
        let error = formObj.errors?.[itemName]?.[item['key']]
        let showError = error && (error === 'Required' || error.length > 0) && formObj.touched?.[itemName]?.[item['key']]
        return (
            <FormGroup key={index}>
                <FormLabel required={item.validation[0] === 'required'}>{item.label} {item.validation[0] === 'required' && ' *'}</FormLabel>
                {
                    item.optionList.map(curr => curr[0]).map((current, id) => {
                        return (
                            <label key={id} style={{ display: 'flex', justifyContent:'space-between', alignItems: 'center', marginBottom: '8px'}}>
                                <RadioInput
                                    type='radio'
                                    value={current.value}
                                    checked={formObj.values?.[itemName]?.[item.key] === current.value}
                                    disabled={props.editData && item.key === 'formID' || props.viewData === true}
                                    onBlur={(e) => {
                                       formObj.handleBlur(e);
                                    }}
                                    onChange={(e) => formObj.setFieldValue(name, e.target.value)}
                                />
                                <label>
                                    {current.optionLabel}
                                </label>
                            </label>
                        )
                    })
                }
                {showError && (<div style={{ color: '#D50000', marginTop: '.5rem' }}>{error}</div>)}
            </FormGroup>
        )
    }

    const handleCheckBox = (item, itemName, index, formObj, event) => {
        if (event.target.checked) {
            formObj.values[itemName][item.key] = [...formObj.values?.[itemName]?.[item.key], event.target.value];
        } else {
            formObj.values[itemName][item.key] = formObj.values?.[itemName]?.[item.key].filter(curr => curr !== event.target.value)
        }
        setFormValues({ ...formObj?.values })
    }

    const getDerivedCheckBoxHtml = (item, itemName, index, formObj) => {
        let name = `${itemName}.${item.key}`
        let values = `${formObj.values?.[itemName]?.[item.key]}`
        let error = formObj.errors?.[itemName]?.[item['key']]
        let showError = error && (error === 'Required' || error.length > 0) && formObj.touched?.[itemName]?.[item['key']]
        return (
            <FormGroup key={index}>
                <FormLabel required={item.validation[0] === 'required'}>{item.label} {item.validation[0] === 'required' && ' *'}</FormLabel>
                {
                    item.optionList.map(curr => curr[0]).map((current, id) => {
                        return (
                            <label key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <CheckBoxInput
                                    type='checkbox'
                                    value={current.value}
                                    disabled={props.editData && item.key === 'formID' || props.viewData === true}
                                    onBlur={(e) => {
                                        formObj.handleBlur(e)
                                    }}
                                    onChange={(e) => handleCheckBox(item, itemName, index, formObj, e)}
                                />
                                <label>
                                {current.optionLabel}
                                </label>
                            </label>
                        )
                    })
                }
                {showError && (<div style={{ color: '#D50000', marginTop: '.5rem' }}>{error}</div>)}
            </FormGroup>
        )
    }

    const createFormHtml = (item, index, formik, itemName) => {
        if (item.type === 'text' || item.type === 'number')
            return getDerivedInputHtml(item, itemName, index, formik)
        else if (item.type === 'radio')
            return getDerivedRadioHtml(item, itemName, index, formik)
        else if (item.type === 'checkbox')
            return getDerivedCheckBoxHtml(item, itemName, index, formik)
        else if (item.type === 'text-area')
            return getDerivedTextAreaHtml(item, itemName, index, formik)
        else if (item.type === 'select')
            return getDerivedSelectHtml(item, itemName, index, formik)
        else if (item.type === 'subChildren')
            return getDerivedHtml(item, itemName, index, formik)
    }
    return (
        <div style={{ width: '96%', margin: '0 auto' }}>
            {
                !pending ?
                    <Formik
                        initialValues={formValues || getFormValue(FormPropertiesSet)}
                        validationSchema={Yup.object(validatedAll)}
                        enableReinitialize
                    >
                        {
                            formik => {
                                console.log("Formik", formik, FormPropertiesSet)
                                return (
                                    <Form>
                                        {Object.keys(FormPropertiesSet).map((item, index) => {
                                            return (
                                                <Fragment key={index}>
                                                    <FieldHeader>{FormPropertiesMap[item]}</FieldHeader>
                                                    <FlexContainer key={`coupon${index}`}>
                                                        {
                                                            FormPropertiesSet[item].map((items, ind) => {
                                                                return createFormHtml(items, ind, formik, item)
                                                            })
                                                        }
                                                    </FlexContainer>
                                                </Fragment>
                                            )
                                        })
                                        }
                                        {(<>
                                            <div style={{ display: 'flex', justifyContent: 'end' }}>
                                                {/* {(Object.keys(formik.errors).length > 0 && Object.keys(formik.touched).length > 0) && <div style={{ color: '#D50000', margin: '.5rem', fontWeight: 'bold' }}>Required field are Missing</div>} */}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'end' }}>
                                                <Button
                                                    disabled={props.viewData === true}
                                                    color="error"
                                                    variant="outlined"
                                                    style={{ margin: '10px', padding: '10px 15px', width: '15%', textTransform: 'none' }}
                                                    onClick={(e) => { handleCancel(e, formik.values, formik) }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    disabled={props.viewData === true}
                                                    type="submit"
                                                    color="primary"
                                                    variant="contained"
                                                    style={{ margin: '10px', padding: '10px 15px', width: '15%', textTransform: 'none' }}
                                                    onClick={(e) => { handleSubmit(e, formik.values, formik) }}
                                                >
                                                    Submit
                                                </Button>
                                            </div>
                                        </>)}
                                    </Form>
                                )
                            }
                        }
                    </Formik>
                    : null
            }
        </div>
    )
}

export default FormComponent;