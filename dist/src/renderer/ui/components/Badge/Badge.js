import { jsx as _jsx } from "react/jsx-runtime";
import styled, { css } from 'styled-components';
const getVariantStyles = (variant) => {
    switch (variant) {
        case 'primary':
            return css `
        background-color: ${({ theme }) => theme.colors.primary};
        color: white;
      `;
        case 'success':
            return css `
        background-color: ${({ theme }) => theme.colors.success};
        color: white;
      `;
        case 'warning':
            return css `
        background-color: ${({ theme }) => theme.colors.warning};
        color: white;
      `;
        case 'error':
            return css `
        background-color: ${({ theme }) => theme.colors.error};
        color: white;
      `;
        case 'info':
            return css `
        background-color: ${({ theme }) => theme.colors.info};
        color: white;
      `;
        default:
            return css `
        background-color: ${({ theme }) => theme.colors.surface};
        color: ${({ theme }) => theme.colors.text.primary};
        border: 1px solid ${({ theme }) => theme.colors.border.default};
      `;
    }
};
const getSizeStyles = (size, dot) => {
    if (dot) {
        switch (size) {
            case 'sm':
                return css `
          width: 6px;
          height: 6px;
        `;
            case 'md':
                return css `
          width: 8px;
          height: 8px;
        `;
            case 'lg':
                return css `
          width: 10px;
          height: 10px;
        `;
            default:
                return css ``;
        }
    }
    else {
        switch (size) {
            case 'sm':
                return css `
          padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
          font-size: ${({ theme }) => theme.typography.fontSize.xs};
        `;
            case 'md':
                return css `
          padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
          font-size: ${({ theme }) => theme.typography.fontSize.sm};
        `;
            case 'lg':
                return css `
          padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
          font-size: ${({ theme }) => theme.typography.fontSize.base};
        `;
            default:
                return css ``;
        }
    }
};
const StyledBadge = styled.span `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1;
  
  border-radius: ${({ theme }) => theme.borderRadius.full};
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size, $dot }) => getSizeStyles($size, $dot)}
  
  ${({ $dot }) => $dot && css `
    border-radius: 50%;
    padding: 0;
  `}
`;
export const Badge = ({ variant = 'secondary', size = 'md', dot = false, children, className, }) => {
    return (_jsx(StyledBadge, { "$variant": variant, "$size": size, "$dot": dot, className: className, children: !dot && children }));
};
//# sourceMappingURL=Badge.js.map