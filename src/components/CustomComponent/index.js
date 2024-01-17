import styled from "styled-components"
export const FlexContainer = styled.div`
   display:flex;
   flex-wrap: wrap;
`
export const FieldHeader = styled.div`
    padding: 0px 10px;
    font-size: 20px;
    margin-top: 10px;
    font-weight: bold;
`

export const SubHeader = styled.div`
    padding: 0px 8px;
    font-size: 16px;
    margin-top: 8px;
    font-weight: 500;
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
export const SingleSelect = styled.select`
      display: inline-block;
      border: 1px solid #ccc;
      padding: 4px;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 16px;
      width: 250px;
      height: 56px;
      &:invalid {
        color: #666666;
      }
      option:first-child{
        color: #cccccc;
      }
      option:not(:first-child){
        color: black;
        background: white;
      }
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
export const FormInput = styled.input.attrs(props => ({
    type: props.type,
    size: props.medium ? 8 : undefined,
    min: props.type === 'number' ? 0 : undefined
}))`
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
    padding: 0px 8px;
    width: 250px;
    height: 56px;
    border: 1px solid rgb(204, 204, 204);
    display: block;
    ::placeholder {
      color: rgb(204, 204, 204);
    }
`

export const RadioInput = styled.input.attrs(props => ({
    type: props.type,
    size: props.medium ? 8 : undefined,
    min: props.type === 'number' ? 0 : undefined
}))`
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
    padding: 0px 8px;
    width: 250px;
    height: 32px;
    border: 1px solid rgb(204, 204, 204);
    display: block;
    ::placeholder {
      color: rgb(204, 204, 204);
    }
`

export const CheckBoxInput = styled.input.attrs(props => ({
    type: props.type,
    size: props.medium ? 8 : undefined,
    min: props.type === 'number' ? 0 : undefined
}))`
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
    padding: 0px 8px;
    width: 250px;
    height: 32px;
    border: 1px solid rgb(204, 204, 204);
    display: block;
    ::placeholder {
      color: rgb(204, 204, 204);
    }
`

export const FormArea = styled.textarea.attrs(props => ({
    type: props.type,
    size: props.medium ? 8 : undefined,
    min: props.type === 'number' ? 0 : undefined,
    length: props.length ? props.length: 200
}))`
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
    padding: 8px 16px;
    width: 250px;
    height: 90px;
    border: 1px solid rgb(204, 204, 204);
    display: block;
    ::placeholder {
      color: rgb(204, 204, 204);
    }
`

export const FlexColumnWrapper = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;`

