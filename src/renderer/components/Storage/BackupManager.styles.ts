import styled from 'styled-components';

export const Container = styled.div`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

export const Header = styled.div`
  padding: 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
`;

export const ButtonPrimary = styled.button<{ disabled?: boolean }>`
  padding: 6px 12px;
  border: none;
  background-color: ${({ disabled }) => (disabled ? '#6c757d' : '#007bff')};
  color: white;
  border-radius: 4px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-size: 12px;
`;

export const StatsGrid = styled.div`
  padding: 12px 16px;
  background-color: #e3f2fd;
  border-bottom: 1px solid #bbdefb;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
  font-size: 12px;
`;

export const StatItem = styled.div`
  text-align: center;
`;

export const StatTitle = styled.div<{ color?: string }>`
  font-weight: bold;
  color: ${({ color }) => color || '#1976d2'};
`;

export const StatValue = styled.div<{ size?: number }>`
  font-size: ${({ size }) => (size ? `${size}px` : '18px')};
  font-weight: bold;
`;

export const TabsBar = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

export const TabButton = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  background-color: ${({ active }) => (active ? '#f8f9fa' : 'transparent')};
  color: ${({ active }) => (active ? '#007bff' : '#666')};
  border-bottom: ${({ active }) => (active ? '2px solid #007bff' : 'none')};
  cursor: pointer;
  font-size: 13px;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
`;

export const Section = styled.div`
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
`;

export const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

export const Card = styled.div<{ borderColor?: string; bgColor?: string }>`
  border: 1px solid ${({ borderColor }) => borderColor || '#e0e0e0'};
  border-radius: 6px;
  padding: 12px;
  background-color: ${({ bgColor }) => bgColor || '#f8f9fa'};
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
`;

export const CardTitle = styled.div`
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 4px;
`;

export const CardMeta = styled.div`
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
`;

export const Tag = styled.span<{ color?: string }>`
  padding: 2px 6px;
  background-color: ${({ color }) => color || '#007bff'};
  color: white;
  border-radius: 10px;
  font-size: 9px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 4px;
`;

export const OutlineButton = styled.button<{ color?: string }>`
  padding: 4px 8px;
  border: 1px solid ${({ color }) => color || '#17a2b8'};
  background-color: white;
  color: ${({ color }) => color || '#17a2b8'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
`;

export const DangerButton = styled(OutlineButton)`
  border-color: #dc3545;
  color: #dc3545;
`;

export const SuccessButton = styled(OutlineButton)`
  border-color: #28a745;
  color: #28a745;
`;

export const PrimaryButton = styled(OutlineButton)`
  border-color: #007bff;
  color: #007bff;
`;

export const FormRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: bold;
`;

export const NumberInput = styled.input`
  width: 100px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
`;

export const TextInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background-color: #f8f9fa;
`;


