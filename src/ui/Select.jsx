import styled from "styled-components";

const StyledSelect = styled.select`
  font-size: 1.4rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid
    ${(props) =>
      props.type === "white"
        ? "var(--color-grey-100)"
        : "var(--color-grey-300)"};
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
`;

function Select({ options, value, onChange, ...props }) {
  return (
    <StyledSelect value={value} onChange={onChange} {...props}>
      {options.map((option) => (
        <option value={option.value} key={option.value}>
          {option.label}
        </option>
      ))}
    </StyledSelect>
  );
}
//<option> 中的 value 是选项的值，<Select> 组件中的 value 是当前选中的值
export default Select;

// - 用户点击了某个 <option> 。
// - onChange 被触发，它会接收到一个事件对象 e 。
// - 通过 e.target.value 拿到用户选中的那个 option 的 value 。
// - 随后，父组件通过这个值去修改 URL。
// - sortBy 的值改变，将新的值传回给 Select 的 value 属性，完成闭环。
