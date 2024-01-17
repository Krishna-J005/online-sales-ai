import { FormPropertiesMap, validationCheck, FormPropertiesSet } from './html'
import {
    FieldHeader, FlexContainer, FormGroup, FormLabel, FlexRowContainer,
    FormInput, SingleSelect, FlexColumnWrapper, SubHeader
} from '../CustomComponent/index'
import { Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Yup from 'yup'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
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
    else if (item.type === 'subChildren')
        return offerVal[val][item.key] = [{
            label: '',
            key: '',
            type: '',
            placeholder: '',
            isRequired: true,
            validationType: '',
            optionList: [[{
                optionLabel: "",
                value: "",
            }],
            ]
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
        { label: 'Text Input', value: 'text' },
        { label: 'Number input', value: 'number' },
        { label: 'Text Area', value: 'text-area' },
        { label: 'DropDown', value: 'select' },
        { label: 'CheckBox', value: 'checkbox' },
        { label: 'Radio Button', value: 'radio' }
    ];

    const placeholderIncluded = ['text', 'text-area', 'number'];
    const optionListIncluded = ['select', 'checkbox', 'radio'];
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
        if (isOptionsRequired) {
            if(props.viewData) return;
            formObj.values?.[itemName]?.[item['key']][index].optionList.push(
                [{
                    optionLabel: "",
                    value: "",
                }]
            )
        }
        else if (item.key == 'field') {
            formObj.values?.[itemName]?.[item['key']]?.push({
                label: '',
                key: '',
                type: '',
                placeholder: '',
                isRequired: true,
                validationType: '',
                optionList: [[{
                    optionLabel: "",
                    value: "",
                }]]
            })
        }
        setFormValues({ ...formObj?.values })
    }

    const deleteListRow = (e, item, itemName, formObj, ind, isOptionsRequired = false, index) => {
        e.preventDefault();
        if (props.viewData) return;
        if (isOptionsRequired) {
            formObj.values?.[itemName]?.[item.key]?.[ind].optionList.splice(index,1);
        }
        else 
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

        // console.log(payload)
        try {
            payload.formID = 'FORM_' + (new Date().getTime());
            setData([...data, payload])
            localStorage.setItem('data', JSON.stringify([...data, payload]));
            console.log("HandleSubmit response")
            navigate('/')
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
                                typeList.map((val, id) => {
                                    return <option value={val} key={id}>{val}</option>
                                })
                            }
                        </>

                    }
                </SingleSelect>
                {showError && (<div className='error-msg'>{error}</div>)}
            </FormGroup>
        )
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
                {showError && (<div className='error-msg'>{error}</div>)}
            </FormGroup>
        )
    }

    const getDerivedOptionInfo = (item, itemName, index, formObj, child, ind, childIndex) => {
        let name = '', values = '', error = '', showError = '';
        return (
            <Fragment key={child.key}>
                <SubHeader className='full-width'>{item.children[childIndex].label}</SubHeader>
                <FieldArray name='subComponent' render={arrayhelpers => (
                    formObj?.values?.[itemName]?.[item['key']]?.[ind]?.[child.key].map((val, id) => {
                        return (
                            <div className='full-width'>
                                <FlexRowContainer>
                                    {
                                        Object.keys(val[0]).map((children, i) => {
                                            
                                            name = `${itemName}.${item['key']}.${[ind]}.${child.key}.${id}.0.${[children]}`
                                            error = formObj.errors[itemName]?.[item.key]?.[ind]?.[child.key]?.[id]?.[0]?.[children];
                                            values = formObj.values[itemName]?.[item.key]?.[ind]?.[child.key]?.[id]?.[0]?.[children];
                                            showError = error === 'Required' && formObj.touched?.[itemName]?.[item.key]?.[ind]?.[child.key]?.[id]?.[0]?.[children];
                                            return (
                                                <>
                                                    <FormGroup>
                                                        <FormLabel required={item.children[childIndex].children?.[i]?.validation?.[0] === 'required'}>{item.children[childIndex].children?.[i].label}</FormLabel>
                                                        <FormInput type={child.type} medium name={name}
                                                            value={values}
                                                            onBlur={(e) => formObj.handleBlur(e)}
                                                            onChange={(e) => {
                                                                formObj.setFieldValue(e.target.name, e.target.value)
                                                            }}>
                                                        </FormInput>
                                                        {showError && (<div className='error-msg'>{error}</div>)}
                                                    </FormGroup>

                                                </>)
                                        })

                                    }
                                    {!placeholderIncluded.includes(formObj.values[itemName]?.[item.key]?.[ind]?.['type']) &&
                                        formObj?.values?.[itemName]?.[item['key']]?.[ind]?.[child.key].length - 1 !== id &&
                                        <DeleteOutlineIcon fontSize="medium"
                                        onClick={(e) => { deleteListRow(e, item, itemName, formObj, ind, true, id) }}
                                            disabled={props.viewData === true}
                                            className={`${props.viewData ? 'disable-btn' : 'active-btn'}`}
                                        />
                                        
                                    }
                                    {!placeholderIncluded.includes(formObj.values[itemName]?.[item.key]?.[ind]?.['type']) &&
                                        formObj?.values?.[itemName]?.[item['key']]?.[ind]?.[child.key].length - 1 === id &&
                                        
                                            <AddCircleOutlineIcon fontSize="large" 
                                                onClick={(e) => { addInfo(e, item, itemName, formObj, true, ind) }}
                                                disabled={props.viewData === true} 
                                                className={`${props.viewData ? 'disable-btn' : 'add-btn'}`}
                                            />
                                    }
                                </FlexRowContainer>
                            </div>
                        )
                    })
                )
                }
                />
                
            </Fragment>
        )
    }

    const getDerivedHtml = (item, itemName, index, formObj) => {
        let name = '', values = '', error = '', showError = ''
        return (
            <div key={index}>
                <FieldHeader className='full-width'>{item.label}</FieldHeader>
                <FieldArray name='subComponent'
                    render={arrayhelpers => (
                        formObj?.values?.[itemName]?.[item['key']] ?
                            formObj?.values?.[itemName]?.[item['key']].map((val, ind) => {
                                return (
                                    <div className="border" key={ind}>
                                    <FlexRowContainer>{
                                        item.children.map((child, i) => {
                                            name = `${itemName}.${item['key']}[${ind}][${child.key}]`
                                            error = formObj?.errors[itemName]?.[item.key]?.[ind]?.[child.key]
                                            values = formObj.values[itemName]?.[item.key]?.[ind]?.[child.key]
                                            showError = error?.length > 0 && formObj.touched?.[itemName]?.[item.key]?.[ind]?.[child.key];
                                            if (child.key !== 'optionList') {
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
                                                                    {showError && (<div className='error-msg'>{error}</div>)}
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
                                                        {item.children.length - 3 === i &&
                                                            formObj.values[itemName]?.[item.key].length > 1 && <DeleteOutlineIcon fontSize="large" className={`${props.viewData ? 'disable-btn' : 'active-btn'}`} onClick={(e) => deleteListRow(e, item, itemName, formObj, ind)} />
                                                        }
                                                    </Fragment>
                                                )
                                            }
                                            else if (child.key == 'optionList' && optionListIncluded.includes(formObj.values[itemName]?.[item.key]?.[ind]?.['type'])) {
                                                
                                                return getDerivedOptionInfo(item, itemName, index, formObj, child, ind, i);
                                            }
                                        })

                                    }
                                    </FlexRowContainer>
                                </div>
                                )
                            })
                            : null)
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
                                console.log("Formik", formik.values.form.field[0])
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