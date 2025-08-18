import styled from 'styled-components';

/**
 * 收藏管理样式集合（styled-components）
 * 说明：将原组件中的内联样式统一迁移到样式文件，满足无内联样式规范
 */

export const Container = styled.div`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 600px;
`;

export const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const Tabs = styled.div`
  display: flex;
  gap: 4px;
`;

export const TabButton = styled.button<{ active?: boolean }>`
  padding: 4px 8px;
  border: 1px solid ${({ active }) => (active ? '#007bff' : '#ddd')};
  background-color: ${({ active }) => (active ? '#007bff' : 'white')};
  color: ${({ active }) => (active ? 'white' : '#666')};
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
`;

export const PrimaryButton = styled.button`
  padding: 6px 12px;
  border: none;
  background-color: #28a745;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
`;

export const Badge = styled.span`
  padding: 6px 12px;
  background-color: #e9ecef;
  border-radius: 4px;
  font-size: 12px;
  color: #495057;
`;

export const CreateFormWrapper = styled.div`
  padding: 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
`;

export const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #333;
`;

export const TextInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
`;

export const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  resize: vertical;
  min-height: 60px;
`;

export const FormActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const Button = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
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

export const Toolbar = styled.div`
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const Select = styled.select`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
`;

export const Flex1 = styled.div`
  flex: 1;
`;

export const Content = styled.div`
  flex: 1;
  overflow: auto;
`;

export const Section = styled.div`
  padding: 16px;
`;

export const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

export const Collections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CollectionCard = styled.div<{ selected?: boolean }>`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  background-color: ${({ selected }) => (selected ? '#f0f8ff' : 'white')};
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 8px;
`;

export const CardTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 2px;
`;

export const CardDesc = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

export const CardMeta = styled.div`
  font-size: 11px;
  color: #999;
`;

export const IconButton = styled.button<{ color?: string }>`
  padding: 4px;
  border: none;
  background-color: transparent;
  color: ${({ color }) => color || '#007bff'};
  cursor: pointer;
  font-size: 12px;
`;

export const PreviewRow = styled.div`
  display: flex;
  gap: 4px;
  overflow: hidden;
`;

export const Thumb = styled.div`
  width: 40px;
  height: 40px;
  background-color: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
`;

export const MoreThumb = styled.div`
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #666;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

export const AssetCard = styled.div<{ selected?: boolean }>`
  position: relative;
  background-color: white;
  border: ${({ selected }) => (selected ? '2px solid #007bff' : '1px solid #e0e0e0')};
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
`;

export const ThumbLarge = styled.div`
  width: 100%;
  height: 80px;
  background-color: #f8f9fa;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-bottom: 6px;
`;

export const AssetName = styled.div`
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 2px;
`;

export const CategoryText = styled.div`
  font-size: 9px;
  color: #666;
`;

export const SelectionIndicator = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background-color: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
`;

export const FavButton = styled.button`
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 10px;
`;

export const FooterBar = styled.div`
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  width: 90%;
  max-width: 1000px;
  max-height: 90%;
  position: relative;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: none;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const HiddenLabel = styled.span`
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
`;

export const ToolbarRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

export const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const OutlineButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
`;


