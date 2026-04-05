import styled from "styled-components";

const StyledFormRow = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: ${(props) =>
    props.orientation === "vertical" ? "1fr" : "24rem 1fr 1.2fr"};
  gap: ${(props) => (props.orientation === "vertical" ? "0.8rem" : "2.4rem")};

  padding: 1.2rem 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }

  &:has(button) {
    display: flex;
    justify-content: ${(props) =>
      props.orientation === "vertical" ? "flex-start" : "flex-end"};
    gap: 1.2rem;
  }
`;

const Label = styled.label`
  font-weight: 500;
`;

const Error = styled.span`
  font-size: 1.4rem;
  color: var(--color-red-700);
`;

function FormRow({ label, error, children, orientation = "horizontal" }) {
  return (
    <StyledFormRow orientation={orientation}>
      {label && <Label htmlFor={children.props.id}>{label}</Label>}
      {/* 在 React 中，htmlFor属性对应的是原生HTML中的for属性。它的核心作用是将 <label>标签与一个特定的表单元素（如<input>）建立关联 */}
      {children}
      {error && <Error>{error}</Error>}
    </StyledFormRow>
  );
}

export default FormRow;
