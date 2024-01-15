import * as Yup from 'yup'

export const Form_HTML = [
{
    label: 'Form Name',
    type: 'text',
    key: 'name',
    validation: ['required'],
},
{
    label: 'Add Field',
    type: 'subChildren',
    key: 'field',
    validation: ['required'],
    children: [
        {
            label: 'Label',
            type: 'text',
            placeholder: 'Enter label',
            key: 'label',
            validation: ['required']
        }, {
            label: 'Key',
            type: 'text',
            key: 'key',
            validation: ['required']
        },  {
            label: 'Is Required Field',
            type: 'select',
            key: 'isRequired',
            validation: ['required']
        }, {
            label: 'Type',
            type: 'select',
            key: 'type',
            validation: ['required']
        }, {
            label: 'Placeholder',
            type: 'text',
            placeholder: 'Enter placeholder',
            key: 'placeholder',
            validation: ['']
        },
        // {
        //     label: 'Validation Type',
        //     type: 'select',
        //     key: 'validationType',
        //     validation: ['']
        // }
        {
            label: 'Option',
            type: 'subChildrenObj',
            html: 'input',
            key: 'optionList',
            validation: ['required'],
            children: [{
                label: 'Label',
                type: 'text',
                html: 'input',
                key: 'key',
                validation: ['required']
            }, {
                label: 'Value',
                type: 'text',
                html: 'input',
                key: 'value',
                validation: ['required']
            }]
        }
        
    ]
}]

export const validationSchema = () => {
    let validate = {};
    const validateAll = {}
    Object.keys(FormPropertiesSet).forEach((val) => {
        FormPropertiesSet[val].forEach(item => {
            if ((item.type === 'text' || item.type === 'select') && item.validation.includes('required')) {
                validate[item.key] = Yup.string().trim().nullable(true).required('Required')
            }
            else if (item.type === 'subChildren' && item.validation.includes('required')) {
                validate[item.key] = Yup.lazy(val => Yup.array()
                    .of(
                        Yup.object().shape({
                            label: Yup.string().trim().nullable(false).required('Required'),
                            key: Yup.string().trim().nullable(false).required('Required'),
                            type: Yup.string().trim().nullable(false).required('Required'),
                            placeholder: Yup.string().trim().nullable(false).required('Required'),
                            isRequired: Yup.string().trim().nullable(false).required('Required'),
                            // validationType: Yup.string().trim().nullable(false).required('Required'),
                        }))
                )
            }
        })
        validateAll[val] = Yup.object(validate)
        validate = {}
    })
    return validateAll
}

export const FormPropertiesMap = {
    form: 'Create your own custom Form'
}

export const FormPropertiesSet = {
    form: Form_HTML
}

export const validationCheck = validationSchema();