import { FormPropertiesMap, validationCheck, FormPropertiesSet } from './html'
import { FieldHeader, FlexContainer, FormGroup, FormLabel, FlexRowContainer, 
    FormInput, SingleSelect, FlexColumnWrapper } from '../CustomComponent/index'
import { Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Yup from 'yup'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import './style.css'

import {
    Formik,
    Form,
    FieldArray,
} from 'formik'
import Button from '@mui/material/Button';
import { useState, useEffect, useCallback } from 'react';

const prepareData = (item, val, offerVal) => {
    if (!offerVal[val]) offerVal[val] = {}
    else if (item.type === 'subChildren' && item.key == 'field')
        return offerVal[val][item.key] = [{
            label: '',
            key: '',
            type: '',
            placeholder: '',
            isRequired: true,
            validationType: '',
            optionList: [{
                key: "",
                value: "",
            }]
        }];
    return offerVal[val][item.key] = ''
}

const getFormValue = () => {
    const formVal = {}
    Object.keys(FormPropertiesSet).map((val) => {
        formVal[val] = {}
        FormPropertiesSet[val].forEach(item => prepareData(item, val, formVal))
    })
    return formVal;
}



function FormGenerator(props) {
    const typeList = [
        {label: 'Text Input', value: 'text'}, 
        {label: 'Number input', value: 'number' },
        {label: 'Text Area', value: 'text-area'},
        {label: 'DropDown', value: 'select'},
        {label: 'CheckBox', value: 'checkbox'},
        {label: 'Radio Button', value: 'radio'}
    ];

    const placeholderIncluded = ['text', 'text-area', 'number'];
    const validationList = ['Email', 'Mobile', 'Input Length', 'Min', 'Max'];
    const param = useParams()
    const navigate = useNavigate()
    const [formValues, setFormValues] = useState(null)
    const [validatedAll, setValidatedAll] = useState(null)
    const [pending, setPending] = useState(true);
    const [data, setData] = useState([])
    const validationSchemaCheck = useCallback(() => {
        return (setValidatedAll({ ...validationCheck }))
    }, [])



    useEffect(() => {
        validationSchemaCheck()
    }, [])

    useEffect(() => {
        const localData = localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : [];
        console.log(localData);
        setData(localData);
        if (!formValues && props.editData === false) {
            setFormValues(getFormValue())
            validationSchemaCheck()
        }
        else if ((!formValues && props.editData) || (!formValues && props.viewData)) {

            const val = localData.filter((curr, ind) => {
                return curr.formID === param.formID
            })
            const form = { ...val[0] }

            setFormValues({ ...formValues, form })
            validationSchemaCheck()
        }
        setPending(false)
    }, [])

    const addInfo = (e, item, itemName, formObj, isOptionsRequired = false, index) => {
        debugger
        if(isOptionsRequired){
            // formObj.values?.[itemName]?.[item['key'][index] = {
            //     ...formObj.values?.[itemName]?.[item['key'][index],
            //     optionList: [{
            //        label: 
            //     }]
            // }
        }
        else if (item.key == 'field') {
            formObj.values?.[itemName]?.[item['key']]?.push({
                label: '',
                key: '',
                type: '',
                placeholder: '',
                isRequired: true,
                validationType: '',
                optionList: [{
                    key: "",
                    value: "",
                }]
            })
        }
        setFormValues({ ...formObj?.values })
    }

    const deleteListRow = (e, item, itemName, formObj, ind) => {
        e.preventDefault();
        if(props.viewData) return;
        formObj?.values?.[itemName]?.[item.key].splice(ind, 1);
        setFormValues({ ...formObj?.values })

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

        console.log(payload)
        if (props.editData) {
            try {
                const filterData = data.filter(curr => curr.formID !== param.formID)
                setData([...filterData, payload])
                localStorage.setItem('data', JSON.stringify([...filterData, payload]));
                setFormValues({ ...formObj })
                // setPending(false)
                navigate('/')
            }
            catch (err) {
                console.log("erroMessage", err)
            }
            finally {
                setPending(false);
            }
        }
        else {
            try {
                payload.formID = 'FORM_' + (new Date().getTime());
                setData([...data, payload])
                localStorage.setItem('data', JSON.stringify([...data, payload]));
                console.log("HandleSubmit response")
                navigate('/')
                setPending(false);
            }
            catch (err) {
                console.log("erroMessage", err)
                setPending(false);
            }
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
                                typeList.map((val, id) => {
                                    return <option value={val} key={id}>{val}</option>
                                })
                            }
                        </>

                    }
                </SingleSelect>
                {showError && (<div style={{ color: 'red', marginTop: '.5rem' }}>{error}</div>)}
            </FormGroup>
        )
    }

    const getDerivedExtraInfo  = (item, itemName, index, formObj) => {
        let name = '', values = '', error = '', showError = ''
        return (
            <>
                <div style={{ width: "100%" }}>
                    <FieldHeader style={{ width: '100%' }}>{item.label}</FieldHeader>
                    <FieldArray name='subComponent' render={arrayhelpers => (
                        formObj?.values?.[itemName]?.[item['key']] ?
                            formObj?.values?.[itemName]?.[item['key']].map((val, ind) => {
                                return (
                                    <FlexRowContainer>{
                                        item.children.map((child, i) => {
                                            name = `${itemName}.${item['key']}[${ind}][${child.key}]`
                                            error = formObj?.errors[itemName]?.[item.key]?.[ind]?.[child.key]
                                            values = formObj.values[itemName]?.[item.key]?.[ind]?.[child.key]
                                            showError = error === 'Required' && formObj.touched?.[itemName]?.[item.key]?.[ind]?.[child.key]
                                            return (
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
                            }) : null)
                    }
                    />
                    <Button variant="contained" color="secondary" onClick={(e) => { addInfo(e, item, itemName, formObj) }}
                        style={{ margin: '10px', padding: '10px 15px', width: '20%' }}>Add ExtraInfo
                    </Button>
                </div>
            </>
        )
    }

    const createInput = (val, itemName, index, formObj, name, showError, error, values, items = 'templateDetails') => {
        return (<FormGroup>
            <FormLabel required={val.validation[0] === 'required'}>{val.label}</FormLabel>
            <FormInput type={val.type} medium name={name}
                value={values}
                placeholder={val.placeholder}
                onWheel={(e) => { if (val.type === 'number') e.target.blur() }}
                onBlur={(e) => formObj.setFieldTouched(name, true)}
                onChange={(e) => {
                    // console.log(e.target)
                    if (val.type === 'number') formObj.setFieldValue(name, +(e.target.value))
                    else formObj.setFieldValue(name, e.target.value)
                }}>
            </FormInput>
            {showError && (<div style={{ color: 'red', marginTop: '.5rem' }}>{error}</div>)}
        </FormGroup>)
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
                ></FormInput>
                {showError && (<div style={{ color: 'red', marginTop: '.5rem' }}>{error}</div>)}
            </FormGroup>
        )
    }

    const getDerivedHtml = (item, itemName, index, formObj) => {
        let name = '', values = '', error = '', showError = ''
        return (
            <div key={index}>
                <FieldHeader style={{ width: '100%' }}>{item.label}</FieldHeader>
                <FieldArray name='subComponent'
                    render={arrayhelpers => (
                        formObj?.values?.[itemName]?.[item['key']] ?
                            formObj?.values?.[itemName]?.[item['key']].map((val, ind) => {
                                return (
                                    <FlexRowContainer key={ind}>{
                                        item.children.map((child, i) => {
                                            name = `${itemName}.${item['key']}[${ind}][${child.key}]`
                                            error = formObj?.errors[itemName]?.[item.key]?.[ind]?.[child.key]
                                            values = formObj.values[itemName]?.[item.key]?.[ind]?.[child.key]
                                            showError = error?.length > 0 && formObj.touched?.[itemName]?.[item.key]?.[ind]?.[child.key]
                                            if(child.key !== 'optionList'){
                                                return (
                                                    <Fragment key={i}>
                                                        {
                                                            child.key !== 'placeholder' ?
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
                                                                                {child.key === 'isRequired' ?
                                                                                    <>
                                                                                        <option value={true}>True</option>
                                                                                        <option value={false}>False</option>

                                                                                    </>
                                                                                    :
                                                                                    (child.key === 'type' ? <>
                                                                                        {
                                                                                            typeList.map((val, id) => {
                                                                                                return <option value={val.value} key={val.value}>{val.label}</option>
                                                                                            })
                                                                                        }
                                                                                    </>
                                                                                        :
                                                                                        <>
                                                                                            {
                                                                                                validationList.map((val, id) => {
                                                                                                    return <option value={val} key={id}>{val}</option>
                                                                                                })
                                                                                            }
                                                                                        </>
                                                                                    )

                                                                                }
                                                                            </SingleSelect>
                                                                    }
                                                                    {showError && (<div style={{ color: 'red', marginTop: '.5rem' }}>{error}</div>)}
                                                                </FormGroup>
                                                                :

                                                                placeholderIncluded.includes(formObj.values[itemName]?.[item.key]?.[ind]?.['type']) &&
                                                                <FormGroup>
                                                                    <FormLabel required={item.validation[0] === 'required'}> {child.label}{child.validation[0] === 'required' && ' *'}</FormLabel>
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
                                                                </FormGroup>

                                                        }
                                                        {

                                                        }
                                                        {item.children.length - 1 === i &&
                                                            formObj.values[itemName]?.[item.key].length > 1 && <DeleteOutlineIcon className={`${props.viewData ? 'disable-btn' : 'active-btn'}`} onClick={(e) => deleteListRow(e, item, itemName, formObj, ind)} />
                                                        }
                                                    </Fragment>
                                                )
                                            }
                                            else{
                                                debugger
                                                return(child.children.map((grandChild, index) => {
                                                    name = `${itemName}.${item['key']}[${ind}][${child.key}][${index}][${grandChild.key}]`;
                                                    error = formObj?.errors[itemName]?.[item.key]?.[ind]?.[child.key]?.[index]?.[grandChild.key];
                                                    values = formObj.values[itemName]?.[item.key]?.[ind]?.[child.key]?.[index]?.[grandChild.key];
                                                    showError = error?.length > 0 && formObj.touched?.[itemName]?.[item.key]?.[ind]?.[child.key]?.[index]?.[grandChild.key];
                                                    return (
                                                        <Fragment key={i}>
                                                            <FormGroup>
                                                                <FormLabel required={grandChild.validation[0] === 'required'}>{grandChild.label} {grandChild.validation[0] === 'required' && ' *'}</FormLabel>
                                                                <FormInput type={grandChild.type} 
                                                                    medium 
                                                                    name={name}
                                                                    value={values}
                                                                    onBlur={(e) => formObj.handleBlur(e)}
                                                                    onChange={(e) => {
                                                                        formObj.setFieldValue(e.target.name, e.target.value)
                                                                    }}>
                                                                </FormInput>
                                                                {showError && (<div style={{ color: 'red', marginTop: '.5rem' }}>{error}</div>)}
                                                            </FormGroup>

                                                        </Fragment>
                                                    )
                                                })) 
                                            }   
                                        })

                                    }
                                    {formObj.values[itemName]?.[item.key]?.[ind]?.['type'] && !placeholderIncluded.includes(formObj.values[itemName]?.[item.key]?.[ind]?.['type']) &&
                                         <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={(e) => { addInfo(e, item, itemName, formObj) }}
                                            disabled={props.viewData === true}
                                            style={{ margin: '10px', padding: '8px 12px', width: '200px', textTransform: 'none' }}
                                        >
                                                Add Options
                                        </Button>
                                    }
                                    </FlexRowContainer>)
                            }) : null)
                    }
                />
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={(e) => { addInfo(e, item, itemName, formObj) }}
                    disabled={props.viewData === true}
                    style={{ margin: '10px', padding: '8px 12px', width: '200px', textTransform: 'none' }}
                >
                    Add Field
                </Button>
            </div>
        )
    }
    const createFormHtml = (item, index, formik, itemName) => {
        if (item.type === 'text')
            return getDerivedInputHtml(item, itemName, index, formik)
        // else if (item.type === 'select')
        //     return getDerivedSelectHtml(item, itemName, index, formik)
        else if (item.type === 'subChildren') {
            return getDerivedHtml(item, itemName, index, formik)
        }
    }

    return (
        <div className='form-container'>
            {
                !pending ?
                    <Formik
                        initialValues={formValues || getFormValue()}
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
                                                {/* {(Object.keys(formik.errors).length > 0 && Object.keys(formik.touched).length > 0) && <div style={{ color: 'red', margin: '.5rem', fontWeight: 'bold' }}>Required field are Missing</div>} */}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'end' }}>
                                                <Button
                                                    // disabled={props.viewData === true}
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

export default FormGenerator