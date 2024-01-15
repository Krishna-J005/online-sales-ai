import styled from "styled-components"
import * as Yup from 'yup'

export const Coupon_Properties = [{
  label: 'Code',
  type: 'text',
  html: 'input',
  placeholder: 'Code Name',
  key: 'code',
  validation: ['required']
}, {
  label: 'Coupon Message',
  type: 'text',
  html: 'input',
  key: 'couponAppliedMessage',
  validation: ['required']
}, 
{
  label: 'Extra Info Map',
  type: 'subChildren',
  html: 'input',
  key: 'extraInfoMap',
  validation: ['required'],
  children: [{
    label: 'Key',
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

export const FormInput = styled.input.attrs(props => ({
  type: props.type,
  size: props.medium ? 8 : undefined,
  min: props.type === 'number' ? 0 : undefined
}))`
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
    width: 250px;
    height: 42px;
    border: 1px solid rgb(204, 204, 204);
    display: block;
    ::placeholder {
      color: rgb(204, 204, 204);
    }
  `

export const FlexContainer = styled.div`
   display:flex;
   flex-wrap: wrap;
`
export const FormGroup = styled.div`
  display:flex;
  flex-direction:column;
  margin:10px 16px;
`
export const FlexRowContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`
export const FieldHeader = styled.div`
   
    padding: 0px 10px;
    font-size: 20px;
    margin-top: 10px;
    font-weight: bold;
`
export const FormLabel = styled.label`
    width: 100%;
    margin-bottom: 5px;
    font-size: 0.8rem;
    color: #666;
    font-weight: bold;
    text-align: left;
    ${props => {
    if (props.required) return `
      ::after {
        content: "*";
        color: red;
        font-size: 12px;}
      `
  }}
    
`

export const validationSchema = () => {
  let validate = {};
  const validateAll = {}
  Object.keys(CouponPropertiesSet).map((val) => {

    CouponPropertiesSet[val].forEach(item => {
      if (item.type === 'text' && item.validation.includes('required')) {
        validate[item.key] = Yup.string().trim().nullable(false).required('Required')
      }
      else if(item.type === 'subChildren' && item.validation.includes('required')){
        validate[item.key] = Yup.lazy(val => Yup.array()
                  .of(
                    Yup.object().shape({
                      key: Yup.string().trim().nullable(false).required('Required'),
                      value: Yup.string().trim().nullable(false).required('Required'),
                    })
        ))
      }

    })
    validateAll[val] = Yup.object(validate)
    validate = {}
  })
  return validateAll
}

export const CouponPropertiesMap = {
  coupons: 'Coupon Properties'
}

export const CouponPropertiesSet = {
  coupons: Coupon_Properties
}

export const validationCheck = validationSchema();