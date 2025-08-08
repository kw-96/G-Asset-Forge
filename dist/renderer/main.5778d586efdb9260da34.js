(()=>{"use strict";var e,t,o,r={5828:(e,t,o)=>{var r=o(4848),i=o(6540),n=o(5338),s=o(3829);const a="#818cf8",l="#6366f1",d="#4f46e5",c="#ffffff",h="#e5e5e5",p="#d4d4d4",g="#a3a3a3",m="#737373",u="#404040",x="#171717",f={50:"#f0fdf4",500:"#22c55e",600:"#16a34a"},y={50:"#fffbeb",500:"#f59e0b",600:"#d97706"},b={50:"#fef2f2",500:"#ef4444",600:"#dc2626"},$={50:"#eff6ff",500:"#3b82f6",600:"#2563eb"},v={fontFamily:{sans:["-apple-system","BlinkMacSystemFont",'"Segoe UI"',"Roboto",'"Helvetica Neue"',"Arial","sans-serif"].join(", "),mono:['"SF Mono"',"Monaco",'"Cascadia Code"','"Roboto Mono"',"Consolas",'"Liberation Mono"','"Courier New"',"monospace"].join(", ")},fontSize:{xs:"12px",sm:"14px",base:"16px",lg:"18px",xl:"20px","2xl":"24px","3xl":"30px","4xl":"36px"},fontWeight:{normal:"400",medium:"500",semibold:"600",bold:"700"},lineHeight:{tight:"1.25",normal:"1.5",relaxed:"1.75"}},w={colors:{primary:l,secondary:d,accent:a,success:f[500],warning:y[500],error:b[500],info:$[500],background:"#fafbfc",surface:"#ffffff",overlay:"rgba(15, 23, 42, 0.6)",text:{primary:x,secondary:u,tertiary:m,disabled:g,inverse:c},border:{default:h,focus:l,hover:p},shadow:{small:"0 1px 2px 0 rgba(0, 0, 0, 0.05)",medium:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",large:"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"},canvas:{background:"#f8fafc",grid:"#e2e8f0",selection:"#6366f1",selectionBg:"rgba(99, 102, 241, 0.1)",guide:"#f59e0b",background:"#f8fafc"}},spacing:{xs:"4px",sm:"8px",md:"16px",lg:"24px",xl:"32px","2xl":"48px","3xl":"64px"},typography:{fontFamily:{primary:v.fontFamily.sans,mono:v.fontFamily.mono},fontSize:v.fontSize,fontWeight:v.fontWeight,lineHeight:v.lineHeight},borderRadius:{none:"0px",sm:"2px",base:"4px",md:"6px",lg:"8px",xl:"12px","2xl":"16px",full:"9999px"},shadows:{xs:"0 1px 2px 0 rgba(0, 0, 0, 0.05)",sm:"0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",base:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",md:"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",lg:"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",xl:"0 25px 50px -12px rgba(0, 0, 0, 0.25)",inner:"inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)"},animation:{duration:{fast:"150ms",normal:"250ms",slow:"350ms"},easing:{ease:"cubic-bezier(0.4, 0, 0.2, 1)",easeIn:"cubic-bezier(0.4, 0, 1, 1)",easeOut:"cubic-bezier(0, 0, 0.2, 1)",easeInOut:"cubic-bezier(0.4, 0, 0.2, 1)"}},zIndex:{hide:-1,auto:"auto",base:0,docked:10,dropdown:1e3,sticky:1100,banner:1200,overlay:1300,modal:1400,popover:1500,skipLink:1600,toast:1700,tooltip:1800}},j={...w,colors:{...w.colors,background:"#0f172a",surface:"#1e293b",overlay:"rgba(0, 0, 0, 0.8)",text:{primary:"#f8fafc",secondary:"#cbd5e1",tertiary:"#94a3b8",disabled:"#64748b",inverse:"#0f172a"},border:{default:"#334155",focus:a,hover:"#475569"},shadow:{small:"0 1px 2px 0 rgba(0, 0, 0, 0.3)",medium:"0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",large:"0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)"},canvas:{background:"#1e293b",grid:"#334155",selection:"#6366f1",selectionBg:"rgba(99, 102, 241, 0.15)",guide:"#f59e0b"}}},k=(0,i.createContext)(void 0),z=({children:e})=>{const[t,o]=(0,i.useState)("light"),n="light"===t?w:j,a={theme:n,mode:t,toggleTheme:()=>{o(e=>"light"===e?"dark":"light")},setTheme:e=>{o(e)}};return(0,r.jsx)(k.Provider,{value:a,children:(0,r.jsx)(s.NP,{theme:n,children:e})})},A=s.DU`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: ${({theme:e})=>e.typography.fontFamily.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({theme:e})=>e.colors.background};
    color: ${({theme:e})=>e.colors.text.primary};
    font-size: ${({theme:e})=>e.typography.fontSize.base};
    line-height: ${({theme:e})=>e.typography.lineHeight.normal};
    overflow: hidden;
  }

  #root {
    width: 100vw;
    height: 100vh;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({theme:e})=>e.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({theme:e})=>e.colors.border.default};
    border-radius: ${({theme:e})=>e.borderRadius.sm};
    
    &:hover {
      background: ${({theme:e})=>e.colors.border.hover};
    }
  }

  ::-webkit-scrollbar-corner {
    background: ${({theme:e})=>e.colors.background};
  }

  /* 选择文本样式 */
  ::selection {
    background-color: ${({theme:e})=>e.colors.primary}40;
    color: ${({theme:e})=>e.colors.text.primary};
  }

  /* 焦点样式重置 */
  *:focus {
    outline: none;
  }

  /* 按钮重置 */
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
    
    &:disabled {
      cursor: not-allowed;
    }
  }

  /* 输入框重置 */
  input, textarea, select {
    border: none;
    outline: none;
    font-family: inherit;
  }

  /* 链接重置 */
  a {
    text-decoration: none;
    color: ${({theme:e})=>e.colors.primary};
    
    &:hover {
      text-decoration: underline;
    }
  }

  /* 列表重置 */
  ul, ol {
    list-style: none;
  }

  /* 标题重置 */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({theme:e})=>e.typography.fontWeight.normal};
  }

  /* 表单重置 */
  fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  /* 代码样式 */
  code, pre {
    font-family: ${({theme:e})=>e.typography.fontFamily.mono};
  }

  /* 工具类 */
  .visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  .no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* 应用布局 - 增强视觉层次 */
  .app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: ${({theme:e})=>e.colors.background};
    backdrop-filter: blur(8px);
  }

  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    gap: 1px; /* 添加微妙的分隔 */
  }

  .canvas-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: ${({theme:e})=>e.colors.canvas.background};
    position: relative;
    border-radius: ${({theme:e})=>e.borderRadius.lg};
    margin: ${({theme:e})=>e.spacing.xs};
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* 工具栏样式增强 */
  .toolbar {
    background: ${({theme:e})=>e.colors.surface};
    border-bottom: 1px solid ${({theme:e})=>e.colors.border.default};
    backdrop-filter: blur(12px);
    box-shadow: ${({theme:e})=>e.shadows.sm};
  }

  /* 侧边栏样式增强 */
  .sidebar {
    background: ${({theme:e})=>e.colors.surface};
    border-right: 1px solid ${({theme:e})=>e.colors.border.default};
    backdrop-filter: blur(12px);
    box-shadow: ${({theme:e})=>e.shadows.sm};
  }

  /* 属性面板样式增强 */
  .properties-panel {
    background: ${({theme:e})=>e.colors.surface};
    border-left: 1px solid ${({theme:e})=>e.colors.border.default};
    backdrop-filter: blur(12px);
    box-shadow: ${({theme:e})=>e.shadows.sm};
  }

  /* 动画工具类 */
  .fade-in {
    animation: fadeIn ${({theme:e})=>e.animation.duration.fast} ${({theme:e})=>e.animation.easing.easeOut};
  }

  .slide-in-right {
    animation: slideInRight ${({theme:e})=>e.animation.duration.normal} ${({theme:e})=>e.animation.easing.easeOut};
  }

  .slide-in-left {
    animation: slideInLeft ${({theme:e})=>e.animation.duration.normal} ${({theme:e})=>e.animation.easing.easeOut};
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @keyframes slideInLeft {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  /* 加载屏幕样式 */
  #loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({theme:e})=>e.colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${({theme:e})=>e.zIndex.modal};
    font-size: ${({theme:e})=>e.typography.fontSize.sm};
    color: ${({theme:e})=>e.colors.text.secondary};
  }
`,S=s.Ay.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({theme:e})=>e.spacing.xs};
  
  font-family: ${({theme:e})=>e.typography.fontFamily.primary};
  font-weight: ${({theme:e})=>e.typography.fontWeight.medium};
  line-height: 1;
  
  border-radius: ${({theme:e})=>e.borderRadius.md};
  cursor: pointer;
  transition: all ${({theme:e})=>e.animation.duration.fast} ${({theme:e})=>e.animation.easing.ease};
  
  ${({$variant:e})=>(e=>{switch(e){case"primary":return s.AH`
        background: linear-gradient(135deg, ${({theme:e})=>e.colors.primary} 0%, ${({theme:e})=>e.colors.secondary} 100%);
        color: white;
        border: 1px solid ${({theme:e})=>e.colors.primary};
        box-shadow: ${({theme:e})=>e.shadows.sm};
        
        &:hover:not(:disabled) {
          background: linear-gradient(135deg, ${({theme:e})=>e.colors.secondary} 0%, ${({theme:e})=>e.colors.primary} 100%);
          transform: translateY(-1px);
          box-shadow: ${({theme:e})=>e.shadows.md};
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: ${({theme:e})=>e.shadows.sm};
        }
      `;case"secondary":return s.AH`
        background: ${({theme:e})=>e.colors.surface};
        color: ${({theme:e})=>e.colors.text.primary};
        border: 1px solid ${({theme:e})=>e.colors.border.default};
        box-shadow: ${({theme:e})=>e.shadows.sm};
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.background};
          border-color: ${({theme:e})=>e.colors.border.hover};
          transform: translateY(-1px);
          box-shadow: ${({theme:e})=>e.shadows.md};
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;case"outline":return s.AH`
        background: transparent;
        color: ${({theme:e})=>e.colors.primary};
        border: 1px solid ${({theme:e})=>e.colors.primary};
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.primary}15;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${({theme:e})=>e.colors.primary}25;
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;case"ghost":return s.AH`
        background: transparent;
        color: ${({theme:e})=>e.colors.text.primary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.surface};
          border-color: ${({theme:e})=>e.colors.border.default};
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;case"danger":return s.AH`
        background: linear-gradient(135deg, ${({theme:e})=>e.colors.error} 0%, #dc2626 100%);
        color: white;
        border: 1px solid ${({theme:e})=>e.colors.error};
        box-shadow: ${({theme:e})=>e.shadows.sm};
        
        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #dc2626 0%, ${({theme:e})=>e.colors.error} 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${({theme:e})=>e.colors.error}25;
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;default:return s.AH``}})(e)}
  ${({$size:e})=>(e=>{switch(e){case"xs":return s.AH`
        height: 28px;
        padding: 0 ${({theme:e})=>e.spacing.sm};
        font-size: ${({theme:e})=>e.typography.fontSize.xs};
      `;case"sm":return s.AH`
        height: 32px;
        padding: 0 ${({theme:e})=>e.spacing.md};
        font-size: ${({theme:e})=>e.typography.fontSize.sm};
      `;case"md":return s.AH`
        height: 40px;
        padding: 0 ${({theme:e})=>e.spacing.lg};
        font-size: ${({theme:e})=>e.typography.fontSize.base};
      `;case"lg":return s.AH`
        height: 48px;
        padding: 0 ${({theme:e})=>e.spacing.xl};
        font-size: ${({theme:e})=>e.typography.fontSize.lg};
      `;default:return s.AH``}})(e)}
  
  ${({$fullWidth:e})=>e&&s.AH`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${({theme:e})=>e.colors.primary};
    outline-offset: 2px;
  }
`,C=s.Ay.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`,L=s.Ay.span`
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({$position:e})=>"right"===e&&s.AH`
    order: 1;
  `}
`,I=i.forwardRef(({variant:e="primary",size:t="md",loading:o=!1,icon:i,iconPosition:n="left",fullWidth:s=!1,disabled:a,children:l,...d},c)=>(0,r.jsxs)(S,{ref:c,disabled:a||o,$variant:e,$size:t,$fullWidth:s,$loading:o,...d,children:[o&&(0,r.jsx)(C,{}),i&&"left"===n&&(0,r.jsx)(L,{$position:n,children:i}),l,i&&"right"===n&&(0,r.jsx)(L,{$position:n,children:i})]}));I.displayName="Button";const E=s.Ay.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  border-radius: ${({theme:e})=>e.borderRadius.md};
  cursor: pointer;
  transition: all ${({theme:e})=>e.animation.duration.fast} ${({theme:e})=>e.animation.easing.ease};
  
  ${({$variant:e})=>(e=>{switch(e){case"primary":return s.AH`
        background: ${({theme:e})=>e.colors.primary};
        color: white;
        border: 1px solid ${({theme:e})=>e.colors.primary};
        
        &:hover:not(:disabled) {
          opacity: 0.9;
        }
      `;case"ghost":return s.AH`
        background: transparent;
        color: ${({theme:e})=>e.colors.text.secondary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.surface};
          color: ${({theme:e})=>e.colors.text.primary};
        }
      `;case"danger":return s.AH`
        background: transparent;
        color: ${({theme:e})=>e.colors.error};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.error}10;
        }
      `;default:return s.AH`
        background: ${({theme:e})=>e.colors.surface};
        color: ${({theme:e})=>e.colors.text.primary};
        border: 1px solid ${({theme:e})=>e.colors.border.default};
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.border.hover};
        }
      `}})(e)}
  ${({$size:e})=>(e=>{switch(e){case"xs":return s.AH`
        width: 24px;
        height: 24px;
        
        svg {
          width: 12px;
          height: 12px;
        }
      `;case"sm":return s.AH`
        width: 32px;
        height: 32px;
        
        svg {
          width: 16px;
          height: 16px;
        }
      `;case"md":return s.AH`
        width: 40px;
        height: 40px;
        
        svg {
          width: 20px;
          height: 20px;
        }
      `;case"lg":return s.AH`
        width: 48px;
        height: 48px;
        
        svg {
          width: 24px;
          height: 24px;
        }
      `;default:return s.AH``}})(e)}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${({theme:e})=>e.colors.primary};
    outline-offset: 2px;
  }
  
  svg {
    flex-shrink: 0;
  }
`,P=s.Ay.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`,H=i.forwardRef(({variant:e="default",size:t="md",icon:o,loading:i=!1,disabled:n,...s},a)=>(0,r.jsx)(E,{ref:a,$variant:e,$size:t,disabled:n||i,...s,children:i?(0,r.jsx)(P,{}):o}));H.displayName="IconButton";var T=o(2354);const R=s.i7`
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,U=s.i7`
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`,M=s.i7`
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,O=s.i7`
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`,W=(0,s.Ay)(T.UC)`
  min-width: 160px;
  background: ${({theme:e})=>e.colors.background};
  border: 1px solid ${({theme:e})=>e.colors.border.default};
  border-radius: ${({theme:e})=>e.borderRadius.md};
  padding: ${({theme:e})=>e.spacing.xs};
  box-shadow: ${({theme:e})=>e.shadows.lg};
  z-index: ${({theme:e})=>e.zIndex.dropdown};
  
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  
  &[data-state='open'][data-side='top'] {
    animation-name: ${M};
  }
  &[data-state='open'][data-side='right'] {
    animation-name: ${O};
  }
  &[data-state='open'][data-side='bottom'] {
    animation-name: ${R};
  }
  &[data-state='open'][data-side='left'] {
    animation-name: ${U};
  }
`,N=(0,s.Ay)(T.q7)`
  display: flex;
  align-items: center;
  padding: ${({theme:e})=>e.spacing.sm} ${({theme:e})=>e.spacing.md};
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  font-family: ${({theme:e})=>e.typography.fontFamily.primary};
  color: ${({theme:e,$destructive:t})=>t?e.colors.error:e.colors.text.primary};
  border-radius: ${({theme:e})=>e.borderRadius.sm};
  cursor: pointer;
  user-select: none;
  outline: none;
  
  &:hover,
  &[data-highlighted] {
    background: ${({theme:e,$destructive:t})=>t?`${e.colors.error}10`:e.colors.surface};
  }
  
  &[data-disabled] {
    color: ${({theme:e})=>e.colors.text.disabled};
    cursor: not-allowed;
    
    &:hover {
      background: transparent;
    }
  }
`,D=((0,s.Ay)(T.wv)`
  height: 1px;
  background: ${({theme:e})=>e.colors.border.default};
  margin: ${({theme:e})=>e.spacing.xs} 0;
`,({trigger:e,children:t,align:o="start",side:i="bottom"})=>(0,r.jsxs)(T.bL,{children:[(0,r.jsx)(T.l9,{asChild:!0,children:e}),(0,r.jsx)(T.ZL,{children:(0,r.jsx)(W,{align:o,side:i,sideOffset:4,children:t})})]})),Y=({children:e,onSelect:t,disabled:o=!1,destructive:i=!1})=>(0,r.jsx)(N,{onSelect:t||(()=>{}),disabled:o,$destructive:i,children:e}),F=s.Ay.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  font-family: ${({theme:e})=>e.typography.fontFamily.primary};
  font-weight: ${({theme:e})=>e.typography.fontWeight.medium};
  line-height: 1;
  
  border-radius: ${({theme:e})=>e.borderRadius.full};
  
  ${({$variant:e})=>(e=>{switch(e){case"primary":return s.AH`
        background-color: ${({theme:e})=>e.colors.primary};
        color: white;
      `;case"success":return s.AH`
        background-color: ${({theme:e})=>e.colors.success};
        color: white;
      `;case"warning":return s.AH`
        background-color: ${({theme:e})=>e.colors.warning};
        color: white;
      `;case"error":return s.AH`
        background-color: ${({theme:e})=>e.colors.error};
        color: white;
      `;case"info":return s.AH`
        background-color: ${({theme:e})=>e.colors.info};
        color: white;
      `;default:return s.AH`
        background-color: ${({theme:e})=>e.colors.surface};
        color: ${({theme:e})=>e.colors.text.primary};
        border: 1px solid ${({theme:e})=>e.colors.border.default};
      `}})(e)}
  ${({$size:e,$dot:t})=>((e,t)=>{if(t)switch(e){case"sm":return s.AH`
          width: 6px;
          height: 6px;
        `;case"md":return s.AH`
          width: 8px;
          height: 8px;
        `;case"lg":return s.AH`
          width: 10px;
          height: 10px;
        `;default:return s.AH``}else switch(e){case"sm":return s.AH`
          padding: ${({theme:e})=>e.spacing.xs} ${({theme:e})=>e.spacing.sm};
          font-size: ${({theme:e})=>e.typography.fontSize.xs};
        `;case"md":return s.AH`
          padding: ${({theme:e})=>e.spacing.xs} ${({theme:e})=>e.spacing.md};
          font-size: ${({theme:e})=>e.typography.fontSize.sm};
        `;case"lg":return s.AH`
          padding: ${({theme:e})=>e.spacing.sm} ${({theme:e})=>e.spacing.lg};
          font-size: ${({theme:e})=>e.typography.fontSize.base};
        `;default:return s.AH``}})(e,t)}
  
  ${({$dot:e})=>e&&s.AH`
    border-radius: 50%;
    padding: 0;
  `}
`,V=({variant:e="secondary",size:t="md",dot:o=!1,children:i,className:n})=>(0,r.jsx)(F,{$variant:e,$size:t,$dot:o,className:n,children:!o&&i}),X=s.Ay.div`
  height: 48px;
  background: ${({theme:e})=>e.colors.surface};
  border-bottom: 1px solid ${({theme:e})=>e.colors.border.default};
  display: flex;
  align-items: center;
  padding: 0 ${({theme:e})=>e.spacing.md};
  backdrop-filter: blur(12px);
  box-shadow: ${({theme:e})=>e.shadows.sm};
`,B=s.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.sm};
`,_=s.Ay.div`
  width: 1px;
  height: 24px;
  background: ${({theme:e})=>e.colors.border.default};
  margin: 0 ${({theme:e})=>e.spacing.sm};
`,G=s.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.sm};
  margin-right: ${({theme:e})=>e.spacing.lg};
`,J=s.Ay.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, ${({theme:e})=>e.colors.primary}, ${({theme:e})=>e.colors.accent});
  border-radius: ${({theme:e})=>e.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({theme:e})=>e.typography.fontWeight.bold};
  font-size: 16px;
`,Z=s.Ay.span`
  font-weight: ${({theme:e})=>e.typography.fontWeight.semibold};
  color: ${({theme:e})=>e.colors.text.primary};
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
`,K=s.Ay.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.lg};
`,q=s.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.sm};
`,Q=s.Ay.span`
  font-weight: ${({theme:e})=>e.typography.fontWeight.medium};
  color: ${({theme:e})=>e.colors.text.primary};
`,ee=s.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.xs};
  background: ${({theme:e})=>e.colors.background};
  border: 1px solid ${({theme:e})=>e.colors.border.default};
  border-radius: ${({theme:e})=>e.borderRadius.md};
  padding: ${({theme:e})=>e.spacing.xs};
`,te=s.Ay.span`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  color: ${({theme:e})=>e.colors.text.primary};
  min-width: 40px;
  text-align: center;
`,oe=({onToggleLeftPanel:e,onToggleRightPanel:t,leftPanelCollapsed:o,rightPanelCollapsed:i})=>{const n=e=>{console.log("File action:",e)},s=e=>{console.log("Edit action:",e)},a=e=>{console.log("Zoom change:",e)};return(0,r.jsxs)(X,{children:[(0,r.jsxs)(B,{children:[(0,r.jsxs)(G,{children:[(0,r.jsx)(J,{children:"G"}),(0,r.jsx)(Z,{children:"G-Asset Forge"})]}),(0,r.jsxs)(D,{trigger:(0,r.jsx)(I,{variant:"ghost",size:"sm",children:"文件"}),children:[(0,r.jsx)(Y,{onSelect:()=>n("new"),children:"🆕 新建项目"}),(0,r.jsx)(Y,{onSelect:()=>n("open"),children:"📁 打开项目"}),(0,r.jsx)(Y,{onSelect:()=>n("save"),children:"💾 保存项目"}),(0,r.jsx)(Y,{onSelect:()=>n("export"),children:"📤 导出图像"})]}),(0,r.jsxs)(D,{trigger:(0,r.jsx)(I,{variant:"ghost",size:"sm",children:"编辑"}),children:[(0,r.jsx)(Y,{onSelect:()=>s("undo"),children:"↶ 撤销"}),(0,r.jsx)(Y,{onSelect:()=>s("redo"),children:"↷ 重做"}),(0,r.jsx)(Y,{onSelect:()=>s("copy"),children:"📋 复制"}),(0,r.jsx)(Y,{onSelect:()=>s("paste"),children:"📄 粘贴"})]}),(0,r.jsx)(_,{}),(0,r.jsx)(H,{variant:"ghost",size:"sm",icon:o?"▶️":"◀️",onClick:e})]}),(0,r.jsxs)(K,{children:[(0,r.jsxs)(q,{children:[(0,r.jsx)(Q,{children:"未命名项目"}),(0,r.jsx)(V,{variant:"success",size:"sm",children:"已保存"})]}),(0,r.jsxs)(ee,{children:[(0,r.jsx)(H,{variant:"ghost",size:"xs",icon:"➖",onClick:()=>a(-10)}),(0,r.jsx)(te,{children:"100%"}),(0,r.jsx)(H,{variant:"ghost",size:"xs",icon:"➕",onClick:()=>a(10)})]})]}),(0,r.jsxs)(B,{children:[(0,r.jsx)(H,{variant:"ghost",size:"sm",icon:"🎨",onClick:()=>console.log("Switch to design mode")}),(0,r.jsx)(H,{variant:"ghost",size:"sm",icon:"📱",onClick:()=>console.log("Switch to H5 mode")}),(0,r.jsx)(_,{}),(0,r.jsx)(H,{variant:"ghost",size:"sm",icon:i?"◀️":"▶️",onClick:t}),(0,r.jsxs)(D,{trigger:(0,r.jsx)(H,{variant:"ghost",size:"sm",icon:"⚙️"}),children:[(0,r.jsx)(Y,{children:"🌙 切换主题"}),(0,r.jsx)(Y,{children:"🔧 偏好设置"}),(0,r.jsx)(Y,{children:"❓ 帮助"}),(0,r.jsx)(Y,{children:"ℹ️ 关于"})]})]})]})},re=s.Ay.div`
  position: relative;
  display: inline-block;
  
  &:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
  }
`,ie=s.Ay.div`
  position: absolute;
  z-index: 9999;
  padding: 6px 8px;
  background: #1a202c;
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  
  /* 添加小箭头 */
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 4px solid transparent;
  }
  
  ${({$side:e})=>{switch(e){case"top":return"\n          bottom: calc(100% + 8px);\n          left: 50%;\n          transform: translateX(-50%);\n          \n          &::after {\n            top: 100%;\n            left: 50%;\n            transform: translateX(-50%);\n            border-top-color: #1a202c;\n          }\n        ";case"right":return"\n          left: calc(100% + 8px);\n          top: 50%;\n          transform: translateY(-50%);\n          \n          &::after {\n            right: 100%;\n            top: 50%;\n            transform: translateY(-50%);\n            border-right-color: #1a202c;\n          }\n        ";case"bottom":return"\n          top: calc(100% + 8px);\n          left: 50%;\n          transform: translateX(-50%);\n          \n          &::after {\n            bottom: 100%;\n            left: 50%;\n            transform: translateX(-50%);\n            border-bottom-color: #1a202c;\n          }\n        ";case"left":return"\n          right: calc(100% + 8px);\n          top: 50%;\n          transform: translateY(-50%);\n          \n          &::after {\n            left: 100%;\n            top: 50%;\n            transform: translateY(-50%);\n            border-left-color: #1a202c;\n          }\n        ";default:return""}}}
`,ne=({content:e,children:t,side:o="top",disabled:i=!1})=>i?(0,r.jsx)(r.Fragment,{children:t}):(0,r.jsxs)(re,{children:[t,(0,r.jsx)(ie,{$side:o,className:"tooltip-content",children:e})]}),se=s.Ay.div`
  width: 60px;
  height: 100%;
  background: ${({theme:e})=>e.colors.surface};
  border-right: 1px solid ${({theme:e})=>e.colors.border.default};
  display: flex;
  flex-direction: column;
  padding: ${({theme:e})=>e.spacing.sm} ${({theme:e})=>e.spacing.xs};
  gap: ${({theme:e})=>e.spacing.xs};
`,ae=s.Ay.div`
  display: flex;
  flex-direction: column;
  gap: ${({theme:e})=>e.spacing.xs};
`,le=s.Ay.div`
  height: 1px;
  background: ${({theme:e})=>e.colors.border.default};
  margin: ${({theme:e})=>e.spacing.sm} 0;
`,de=(0,s.Ay)(H)`
  width: 44px;
  height: 44px;
  background: ${({theme:e,$active:t})=>t?e.colors.primary:"transparent"};
  color: ${({theme:e,$active:t})=>t?"white":e.colors.text.primary};
  border: 1px solid ${({theme:e,$active:t})=>t?e.colors.primary:"transparent"};
  
  &:hover {
    background: ${({theme:e,$active:t})=>t?e.colors.primary:e.colors.surface};
    border-color: ${({theme:e})=>e.colors.border.hover};
  }
`,ce=s.Ay.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: ${({theme:e})=>e.spacing.xs};
`,he=({activePanel:e,onSwitchPanel:t})=>{const[o,n]=i.useState("select");return(0,r.jsxs)(se,{children:[(0,r.jsx)(ae,{children:[{id:"select",icon:"🔍",name:"选择工具",shortcut:"V"},{id:"text",icon:"📝",name:"文本工具",shortcut:"T"},{id:"image",icon:"🖼️",name:"图片工具",shortcut:"I"},{id:"shape",icon:"⬜",name:"形状工具",shortcut:"R"},{id:"brush",icon:"🖌️",name:"画笔工具",shortcut:"B"},{id:"crop",icon:"✂️",name:"裁剪工具",shortcut:"C"}].map(e=>(0,r.jsx)(ne,{content:`${e.name} (${e.shortcut})`,side:"right",children:(0,r.jsx)(de,{$active:o===e.id,icon:e.icon,onClick:()=>{return t=e.id,n(t),void console.log("Selected tool:",t);var t}})},e.id))}),(0,r.jsx)(le,{}),(0,r.jsxs)(ce,{children:[(0,r.jsx)(ne,{content:"图层面板",side:"right",children:(0,r.jsx)(de,{$active:"layers"===e,icon:"📋",onClick:()=>t("layers")})}),(0,r.jsx)(ne,{content:"素材库",side:"right",children:(0,r.jsx)(de,{$active:"assets"===e,icon:"🎨",onClick:()=>t("assets")})})]})]})},pe=s.Ay.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({theme:e})=>e.colors.canvas.background};
  position: relative;
  overflow: hidden;
`,ge=s.Ay.div`
  height: 40px;
  background: ${({theme:e})=>e.colors.surface};
  border-bottom: 1px solid ${({theme:e})=>e.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({theme:e})=>e.spacing.md};
  backdrop-filter: blur(8px);
`,me=s.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.sm};
`,ue=s.Ay.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: ${({theme:e})=>e.colors.canvas.background};
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  /* 动态网格背景 - 跟随视口移动 */
  ${({$showGrid:e,theme:t,$gridSize:o,$panX:r,$panY:i,$zoom:n})=>e?`\n    background-image: \n      linear-gradient(${t.colors.canvas.grid} 1px, transparent 1px),\n      linear-gradient(90deg, ${t.colors.canvas.grid} 1px, transparent 1px);\n    background-size: ${o*n}px ${o*n}px;\n    background-position: ${r}px ${i}px;\n  `:""}
`,xe=s.Ay.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translate(${({$panX:e})=>e}px, ${({$panY:e})=>e}px) scale(${({$zoom:e})=>e});
  transform-origin: 0 0;
  pointer-events: none;
`,fe=s.Ay.div`
  position: absolute;
  left: ${({$x:e})=>e}px;
  top: ${({$y:e})=>e}px;
  width: ${({$width:e})=>e}px;
  height: ${({$height:e})=>e}px;
  pointer-events: auto;
  cursor: pointer;
  
  ${({$selected:e,theme:t})=>e?`\n    outline: 2px solid ${t.colors.primary};\n    outline-offset: 2px;\n  `:""}
`,ye=s.Ay.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: ${({theme:e})=>e.colors.text.secondary};
  pointer-events: none;
  z-index: 1;
`,be=s.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({theme:e})=>e.spacing.md};
  margin-top: ${({theme:e})=>e.spacing.lg};
  max-width: 600px;
`,$e=s.Ay.div`
  background: ${({theme:e})=>e.colors.surface};
  border: 1px solid ${({theme:e})=>e.colors.border.default};
  border-radius: ${({theme:e})=>e.borderRadius.md};
  padding: ${({theme:e})=>e.spacing.md};
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({theme:e})=>e.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${({theme:e})=>e.shadows.md};
  }
`,ve=s.Ay.div`
  position: absolute;
  top: ${({theme:e})=>e.spacing.lg};
  right: ${({theme:e})=>e.spacing.lg};
  width: 200px;
  height: 150px;
  background: ${({theme:e})=>e.colors.surface};
  border: 1px solid ${({theme:e})=>e.colors.border.default};
  border-radius: ${({theme:e})=>e.borderRadius.md};
  opacity: ${({$visible:e})=>e?1:0};
  pointer-events: ${({$visible:e})=>e?"auto":"none"};
  transition: opacity 0.3s ease;
  z-index: ${({theme:e})=>e.zIndex.overlay};
`,we=s.Ay.div`
  position: absolute;
  left: ${({$x:e})=>e}%;
  top: ${({$y:e})=>e}%;
  width: ${({$width:e})=>e}%;
  height: ${({$height:e})=>e}%;
  border: 2px solid ${({theme:e})=>e.colors.primary};
  background: ${({theme:e})=>e.colors.primary}20;
  cursor: move;
`,je=s.Ay.div`
  position: absolute;
  bottom: ${({theme:e})=>e.spacing.lg};
  right: ${({theme:e})=>e.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({theme:e})=>e.spacing.sm};
  z-index: ${({theme:e})=>e.zIndex.overlay};
`,ke=s.Ay.div`
  background: ${({theme:e})=>e.colors.surface};
  border: 1px solid ${({theme:e})=>e.colors.border.default};
  border-radius: ${({theme:e})=>e.borderRadius.md};
  padding: ${({theme:e})=>e.spacing.xs};
  display: flex;
  flex-direction: column;
  gap: ${({theme:e})=>e.spacing.xs};
  backdrop-filter: blur(12px);
  box-shadow: ${({theme:e})=>e.shadows.md};
`,ze=s.Ay.div`
  padding: ${({theme:e})=>e.spacing.xs} ${({theme:e})=>e.spacing.sm};
  font-size: ${({theme:e})=>e.typography.fontSize.xs};
  color: ${({theme:e})=>e.colors.text.primary};
  text-align: center;
  min-width: 50px;
`,Ae=s.Ay.div`
  background: ${({theme:e})=>e.colors.surface};
  border: 1px solid ${({theme:e})=>e.colors.border.default};
  border-radius: ${({theme:e})=>e.borderRadius.md};
  padding: ${({theme:e})=>e.spacing.xs};
  display: flex;
  gap: ${({theme:e})=>e.spacing.xs};
  backdrop-filter: blur(12px);
  box-shadow: ${({theme:e})=>e.shadows.md};
`,Se=(0,s.Ay)(I)`
  background: ${({theme:e,$active:t})=>t?e.colors.primary:"transparent"};
  color: ${({theme:e,$active:t})=>t?"white":e.colors.text.primary};
  border: 1px solid ${({theme:e,$active:t})=>t?e.colors.primary:"transparent"};
`,Ce=s.Ay.div`
  position: absolute;
  top: ${({theme:e})=>e.spacing.lg};
  left: ${({theme:e})=>e.spacing.lg};
  display: flex;
  gap: ${({theme:e})=>e.spacing.sm};
  z-index: ${({theme:e})=>e.zIndex.overlay};
`,Le=()=>{const[e,t]=(0,i.useState)({x:0,y:0,zoom:1}),[o,n]=(0,i.useState)(!1),[s,a]=(0,i.useState)("design"),[l,d]=(0,i.useState)(!0),[c]=(0,i.useState)(20),[h,p]=(0,i.useState)(!1),[g,m]=(0,i.useState)(!0),[u]=(0,i.useState)([]),[x,f]=(0,i.useState)([]),[y,b]=(0,i.useState)(null),[$,v]=(0,i.useState)(!1),[w,j]=(0,i.useState)({width:800,height:600}),[k,z]=(0,i.useState)(!1),[A,S]=(0,i.useState)({x:0,y:0}),[C,L]=(0,i.useState)({x:0,y:0}),[E,P]=(0,i.useState)(!1),[T,R]=(0,i.useState)(null),[U,M]=(0,i.useState)({x:0,y:0}),O=(0,i.useRef)(null),W=(0,i.useCallback)((e,o)=>{t(t=>{const r=Math.max(.1,Math.min(5,t.zoom+.1*e));if(o){const e=r/Math.max(t.zoom,.01);return{...t,x:o.x-(o.x-t.x)*e,y:o.y-(o.y-t.y)*e,zoom:r}}return{...t,zoom:r}})},[]),N=(0,i.useCallback)(()=>{if(0===x.length)return void t({x:0,y:0,zoom:1});const e=x.reduce((e,t)=>{const o=t.worldX,r=t.worldY,i=t.worldX+t.width,n=t.worldY+t.height;return{left:Math.min(e.left,o),top:Math.min(e.top,r),right:Math.max(e.right,i),bottom:Math.max(e.bottom,n)}},{left:1/0,top:1/0,right:-1/0,bottom:-1/0});if(!O.current)return;const o=O.current.getBoundingClientRect(),r=e.right-e.left,i=e.bottom-e.top,n=.8*o.width/r,s=.8*o.height/i,a=Math.min(n,s,2),l=(e.left+e.right)/2,d=(e.top+e.bottom)/2,c=o.width/2-l*a,h=o.height/2-d*a;t({x:c,y:h,zoom:a})},[x]),D=(0,i.useCallback)(t=>{0===t.button&&(z(!0),S({x:t.clientX,y:t.clientY}),L({x:e.x,y:e.y}))},[e.x,e.y]),Y=(0,i.useCallback)((e,t)=>{if(0!==t.button)return;t.stopPropagation(),t.preventDefault(),b(e),P(!0),R(e);const o=O.current?.getBoundingClientRect();o&&M({x:t.clientX-o.left,y:t.clientY-o.top})},[]),F=(0,i.useCallback)(()=>{P(!1),R(null),M({x:0,y:0})},[]),X=(0,i.useCallback)(o=>{try{if(E&&T){const t=O.current?.getBoundingClientRect();if(!t)return;const r=o.clientX-t.left,i=o.clientY-t.top,n=r-U.x,s=i-U.y,a=Math.max(e.zoom,.01),l=n/a,d=s/a;return f(t=>t.map(t=>{if(t.id===T){let o=t.worldX+l,r=t.worldY+d;if(h||g){let i={x:(o+t.width/2)*e.zoom+e.x,y:(r+t.height/2)*e.zoom+e.y};if(g&&u.length>0){const t=5;u.forEach(o=>{const r=o.position*e.zoom+("vertical"===o.type?e.x:e.y);Math.abs(("vertical"===o.type?i.x:i.y)-r)<t&&("vertical"===o.type?i.x=r:i.y=r)})}if(h){const t=Math.max(e.zoom,.01),o={x:(i.x-e.x)/t,y:(i.y-e.y)/t},r={x:Math.round(o.x/c)*c,y:Math.round(o.y/c)*c};i={x:r.x*t+e.x,y:r.y*t+e.y}}const n=Math.max(e.zoom,.01);o=(i.x-e.x)/n-t.width/2,r=(i.y-e.y)/n-t.height/2}return{...t,worldX:o,worldY:r}}return t})),void M({x:r,y:i})}if(!k)return;const r=o.clientX-A.x,i=o.clientY-A.y;t(e=>({...e,x:C.x+r,y:C.y+i}))}catch(e){console.error("Error in handleMouseMove:",e)}},[k,E,A,C,T,U,e,h,g,u,c]),B=(0,i.useCallback)(()=>{z(!1),F()},[F]),_=(0,i.useCallback)(e=>{e.preventDefault();const t=e.deltaY>0?-.1:.1,o=O.current?.getBoundingClientRect();if(!o)return;const r=e.clientX-o.left,i=e.clientY-o.top;W(t,{x:r,y:i})},[W]),G=(0,i.useCallback)(()=>{N()},[N]),J=(0,i.useCallback)(t=>{try{const o=O.current?.getBoundingClientRect();if(!o)return;const r=o.width/2,i=o.height/2,n=Math.max(e.zoom,.01),s={x:(r-e.x)/n-t.width/2,y:(i-e.y)/n-t.height/2};let a={x:r,y:i};if(g&&u.length>0){const t=5;u.forEach(o=>{const r=o.position*e.zoom+("vertical"===o.type?e.x:e.y);Math.abs(("vertical"===o.type?a.x:a.y)-r)<t&&("vertical"===o.type?a.x=r:a.y=r)})}if(h){const t=Math.max(e.zoom,.01),o={x:(a.x-e.x)/t,y:(a.y-e.y)/t},r={x:Math.round(o.x/c)*c,y:Math.round(o.y/c)*c};a={x:r.x*t+e.x,y:r.y*t+e.y}}const l={x:(a.x-e.x)/n-t.width/2,y:(a.y-e.y)/n-t.height/2},d={id:`template-${Date.now()}`,type:"template",worldX:h||g?l.x:s.x,worldY:h||g?l.y:s.y,width:t.width,height:t.height,content:t.name};f(e=>[...e,d]),b(d.id)}catch(e){console.error("Error in handleCreateTemplate:",e)}},[e,h,g,u,c]),Z=(0,i.useCallback)((e,t)=>{t.stopPropagation(),b(e)},[]);(0,i.useEffect)(()=>{v(e.zoom<.3)},[e.zoom]),(0,i.useEffect)(()=>{const e=()=>{if(O.current){const e=O.current.getBoundingClientRect();j({width:e.width,height:e.height})}};e();const t=()=>{e()};return window.addEventListener("resize",t),()=>window.removeEventListener("resize",t)},[]);const K=(0,i.useMemo)(()=>{try{return x.filter(t=>{if(!t||"number"!=typeof t.worldX||"number"!=typeof t.worldY||"number"!=typeof t.width||"number"!=typeof t.height)return!1;const o=Math.max(e.zoom,.01),r=t.worldX*o+e.x,i=t.worldY*o+e.y,n=r+t.width*o,s=i+t.height*o;return!!(isFinite(r)&&isFinite(i)&&isFinite(n)&&isFinite(s))&&!(n<0||r>w.width||s<0||i>w.height)})}catch(e){return console.error("Error calculating visible objects:",e),[]}},[x,e,w]);return(0,i.useEffect)(()=>{const e=e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement))if(e.ctrlKey||e.metaKey)switch(e.key){case"=":case"+":e.preventDefault(),W(1);break;case"-":e.preventDefault(),W(-1);break;case"0":e.preventDefault(),t({x:0,y:0,zoom:1});break;case"1":e.preventDefault(),N();break;case"2":e.preventDefault(),t(e=>({...e,zoom:1}))}else switch(e.key){case"g":e.preventDefault(),d(e=>!e);break;case"r":e.preventDefault(),m(e=>!e);break;case"h":e.preventDefault(),t({x:0,y:0,zoom:1})}};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[W,N]),(0,i.useEffect)(()=>{const e=e=>{console.error("Canvas workspace error:",e),n(!0)};return window.addEventListener("error",e),()=>window.removeEventListener("error",e)},[]),o?(0,r.jsx)(pe,{children:(0,r.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:"16px"},children:[(0,r.jsx)("div",{style:{fontSize:"48px"},children:"⚠️"}),(0,r.jsx)("h2",{children:"画布加载出错"}),(0,r.jsx)("p",{children:"请刷新页面重试"}),(0,r.jsx)(I,{onClick:()=>n(!1),children:"重试"})]})}):(0,r.jsxs)(pe,{children:[(0,r.jsxs)(ge,{children:[(0,r.jsxs)(me,{children:[(0,r.jsx)(I,{variant:"ghost",size:"sm",onClick:N,children:"🎯 适应内容"}),(0,r.jsx)(H,{variant:l?"primary":"ghost",size:"sm",icon:"⊞",onClick:()=>d(!l),title:"显示/隐藏网格"}),(0,r.jsx)(H,{variant:h?"primary":"ghost",size:"sm",icon:"🧲",onClick:()=>p(!h),title:"网格对齐"}),(0,r.jsx)(H,{variant:g?"primary":"ghost",size:"sm",icon:"📏",onClick:()=>m(!g),title:"显示/隐藏参考线"}),(0,r.jsx)(I,{variant:"ghost",size:"sm",onClick:()=>t({x:0,y:0,zoom:1}),children:"🏠 重置视图"})]}),(0,r.jsxs)(me,{children:[(0,r.jsx)(I,{variant:"outline",size:"sm",children:"📋 复制"}),(0,r.jsx)(I,{variant:"primary",size:"sm",onClick:()=>{console.log("Export infinite canvas")},children:"📤 导出"})]})]}),(0,r.jsxs)(ue,{ref:O,$showGrid:l,$gridSize:c,$panX:e.x,$panY:e.y,$zoom:e.zoom,onMouseDown:D,onMouseMove:X,onMouseUp:B,onMouseLeave:B,onWheel:_,onDoubleClick:G,children:[(0,r.jsx)(xe,{$panX:e.x,$panY:e.y,$zoom:e.zoom,children:x.map(e=>(0,r.jsx)(fe,{$x:e.worldX,$y:e.worldY,$width:e.width,$height:e.height,$selected:e.id===y,onClick:t=>Z(e.id,t),onMouseDown:t=>Y(e.id,t),children:"template"===e.type&&(0,r.jsxs)("div",{style:{width:"100%",height:"100%",background:"white",border:"2px dashed #ccc",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",color:"#666",flexDirection:"column",gap:"8px"},children:[(0,r.jsx)("div",{style:{fontSize:"24px"},children:"📄"}),(0,r.jsx)("div",{children:e.content}),(0,r.jsxs)("div",{style:{fontSize:"12px",opacity:.7},children:[e.width," × ",e.height]})]})},e.id))}),0===x.length&&(0,r.jsxs)(ye,{children:[(0,r.jsx)("div",{style:{fontSize:"48px",marginBottom:"16px"},children:"🎨"}),(0,r.jsx)("h2",{style:{margin:"0 0 8px 0",fontSize:"24px"},children:"欢迎使用无限画布"}),(0,r.jsx)("p",{style:{margin:"0 0 24px 0",fontSize:"16px",opacity:.8},children:"选择模板开始创作，或使用工具在任意位置添加内容"}),(0,r.jsx)(be,{children:[{id:"mobile",name:"移动端",width:375,height:667,category:"mobile",emoji:"📱"},{id:"tablet",name:"平板",width:768,height:1024,category:"mobile",emoji:"📱"},{id:"desktop",name:"桌面",width:1920,height:1080,category:"desktop",emoji:"🖥️"},{id:"icon",name:"游戏图标",width:256,height:256,category:"game",emoji:"🎮"},{id:"button",name:"按钮",width:200,height:60,category:"game",emoji:"🔘"},{id:"banner",name:"横幅",width:728,height:90,category:"social",emoji:"🎯"}].map(e=>(0,r.jsxs)($e,{onClick:()=>J(e),children:[(0,r.jsx)("div",{style:{fontSize:"32px",marginBottom:"8px"},children:e.emoji}),(0,r.jsx)("div",{style:{fontSize:"14px",fontWeight:"bold",marginBottom:"4px"},children:e.name}),(0,r.jsxs)("div",{style:{fontSize:"12px",opacity:.7},children:[e.width," × ",e.height]})]},e.id))})]}),(0,r.jsxs)(ve,{$visible:$,children:[(0,r.jsx)("div",{style:{padding:"8px",fontSize:"12px",fontWeight:"bold",borderBottom:"1px solid #eee",background:"#f5f5f5"},children:"画布概览"}),(0,r.jsxs)("div",{style:{position:"relative",flex:1,margin:"8px"},children:[x.map(e=>(0,r.jsx)("div",{style:{position:"absolute",left:(e.worldX+2e3)/40+"px",top:(e.worldY+1500)/40+"px",width:e.width/40+"px",height:e.height/40+"px",background:"#007acc",borderRadius:"2px",opacity:.7}},e.id)),(0,r.jsx)(we,{$x:50,$y:50,$width:20,$height:15})]})]}),(0,r.jsxs)(Ce,{children:[(0,r.jsxs)(V,{variant:"secondary",size:"sm",children:["缩放: ",Math.round(100*e.zoom),"%"]}),(0,r.jsx)(V,{variant:"info",size:"sm",children:"design"===s?"设计模式":"H5模式"}),(0,r.jsxs)(V,{variant:"secondary",size:"sm",children:["对象: ",x.length," / 可见: ",K.length]}),(0,r.jsxs)(V,{variant:"secondary",size:"sm",children:["位置: (",Math.round(-e.x/Math.max(e.zoom,.01)),", ",Math.round(-e.y/Math.max(e.zoom,.01)),")"]}),!1]}),(0,r.jsxs)(je,{children:[(0,r.jsxs)(Ae,{children:[(0,r.jsx)(Se,{$active:"design"===s,variant:"ghost",size:"sm",onClick:()=>a("design"),children:"🎨"}),(0,r.jsx)(Se,{$active:"h5"===s,variant:"ghost",size:"sm",onClick:()=>a("h5"),children:"📱"})]}),(0,r.jsxs)(ke,{children:[(0,r.jsx)(H,{variant:"ghost",size:"sm",icon:"➕",onClick:()=>W(1)}),(0,r.jsxs)(ze,{children:[Math.round(100*e.zoom),"%"]}),(0,r.jsx)(H,{variant:"ghost",size:"sm",icon:"➖",onClick:()=>W(-1)}),(0,r.jsx)(H,{variant:"ghost",size:"sm",icon:"⊡",onClick:N})]})]})]})]})},Ie=s.Ay.div`
  display: flex;
  flex-direction: column;
  gap: ${({theme:e})=>e.spacing.xs};
  
  ${({$fullWidth:e})=>e&&s.AH`
    width: 100%;
  `}
`,Ee=s.Ay.label`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  font-weight: ${({theme:e})=>e.typography.fontWeight.medium};
  color: ${({theme:e})=>e.colors.text.primary};
`,Pe=s.Ay.div`
  position: relative;
  display: flex;
  align-items: center;
`,He=s.Ay.input`
  width: 100%;
  border-radius: ${({theme:e})=>e.borderRadius.md};
  font-family: ${({theme:e})=>e.typography.fontFamily.primary};
  color: ${({theme:e})=>e.colors.text.primary};
  transition: all ${({theme:e})=>e.animation.duration.fast} ${({theme:e})=>e.animation.easing.ease};
  
  ${({$size:e})=>(e=>{switch(e){case"sm":return s.AH`
        height: 32px;
        padding: 0 ${({theme:e})=>e.spacing.sm};
        font-size: ${({theme:e})=>e.typography.fontSize.sm};
      `;case"md":return s.AH`
        height: 40px;
        padding: 0 ${({theme:e})=>e.spacing.md};
        font-size: ${({theme:e})=>e.typography.fontSize.base};
      `;case"lg":return s.AH`
        height: 48px;
        padding: 0 ${({theme:e})=>e.spacing.lg};
        font-size: ${({theme:e})=>e.typography.fontSize.lg};
      `;default:return s.AH``}})(e)}
  ${({$variant:e})=>"filled"===e?s.AH`
        background: ${({theme:e})=>e.colors.surface};
        border: 1px solid transparent;
        
        &:focus {
          background: ${({theme:e})=>e.colors.background};
          border-color: ${({theme:e})=>e.colors.border.focus};
        }
      `:s.AH`
        background: ${({theme:e})=>e.colors.background};
        border: 1px solid ${({theme:e})=>e.colors.border.default};
        
        &:hover:not(:disabled) {
          border-color: ${({theme:e})=>e.colors.border.hover};
        }
        
        &:focus {
          border-color: ${({theme:e})=>e.colors.border.focus};
        }
      `}
  
  ${({$hasLeftIcon:e,theme:t})=>e&&s.AH`
    padding-left: calc(${t.spacing.lg} + 20px);
  `}
  
  ${({$hasRightIcon:e,theme:t})=>e&&s.AH`
    padding-right: calc(${t.spacing.lg} + 20px);
  `}
  
  ${({$error:e,theme:t})=>e&&s.AH`
    border-color: ${t.colors.error};
    
    &:focus {
      border-color: ${t.colors.error};
      box-shadow: 0 0 0 3px ${t.colors.error}20;
    }
  `}
  
  &:focus {
    outline: none;
    border-color: ${({theme:e})=>e.colors.border.focus};
    box-shadow: 0 0 0 3px ${({theme:e})=>e.colors.border.focus}20, 
                ${({theme:e})=>e.shadows.sm};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({theme:e})=>e.colors.surface};
  }
  
  &::placeholder {
    color: ${({theme:e})=>e.colors.text.tertiary};
  }
`,Te=s.Ay.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({theme:e})=>e.colors.text.secondary};
  pointer-events: none;
  
  ${({$position:e,theme:t})=>"left"===e?s.AH`
    left: ${t.spacing.md};
  `:s.AH`
    right: ${t.spacing.md};
  `}
`,Re=s.Ay.div`
  font-size: ${({theme:e})=>e.typography.fontSize.xs};
  color: ${({$error:e,theme:t})=>e?t.colors.error:t.colors.text.secondary};
`,Ue=(0,i.forwardRef)(({size:e="md",variant:t="default",error:o=!1,helperText:i,label:n,leftIcon:s,rightIcon:a,fullWidth:l=!1,...d},c)=>(0,r.jsxs)(Ie,{$fullWidth:l,children:[n&&(0,r.jsx)(Ee,{children:n}),(0,r.jsxs)(Pe,{children:[s&&(0,r.jsx)(Te,{$position:"left",children:s}),(0,r.jsx)(He,{ref:c,$size:e,$variant:t,$error:o,$hasLeftIcon:!!s,$hasRightIcon:!!a,...d}),a&&(0,r.jsx)(Te,{$position:"right",children:a})]}),i&&(0,r.jsx)(Re,{$error:o,children:i})]}));Ue.displayName="Input";var Me=o(1378);const Oe=s.Ay.div`
  display: flex;
  flex-direction: column;
  gap: ${({theme:e})=>e.spacing.xs};
`,We=s.Ay.label`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  font-weight: ${({theme:e})=>e.typography.fontWeight.medium};
  color: ${({theme:e})=>e.colors.text.primary};
`,Ne=(0,s.Ay)(Me.bL)`
  position: relative;
  display: flex;
  align-items: center;
  user-select: none;
  touch-action: none;
  width: 100%;
  height: 20px;
  
  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,De=(0,s.Ay)(Me.CC)`
  background: ${({theme:e})=>e.colors.surface};
  position: relative;
  flex-grow: 1;
  height: 4px;
  border-radius: ${({theme:e})=>e.borderRadius.full};
`,Ye=(0,s.Ay)(Me.Q6)`
  position: absolute;
  background: ${({theme:e})=>e.colors.primary};
  border-radius: ${({theme:e})=>e.borderRadius.full};
  height: 100%;
`,Fe=(0,s.Ay)(Me.zi)`
  display: block;
  width: 16px;
  height: 16px;
  background: ${({theme:e})=>e.colors.primary};
  border: 2px solid ${({theme:e})=>e.colors.background};
  border-radius: ${({theme:e})=>e.borderRadius.full};
  box-shadow: ${({theme:e})=>e.shadows.sm};
  transition: all ${({theme:e})=>e.animation.duration.fast} ${({theme:e})=>e.animation.easing.ease};
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({theme:e})=>e.colors.primary}40;
  }
  
  &[data-disabled] {
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
  }
`,Ve=({value:e,onValueChange:t,min:o=0,max:i=100,step:n=1,disabled:s=!1,label:a,className:l})=>(0,r.jsxs)(Oe,{className:l,children:[a&&(0,r.jsx)(We,{children:a}),(0,r.jsxs)(Ne,{value:e,onValueChange:t,min:o,max:i,step:n,disabled:s,children:[(0,r.jsx)(De,{children:(0,r.jsx)(Ye,{})}),(0,r.jsx)(Fe,{})]})]});var Xe=o(9014);const Be=s.Ay.div`
  display: flex;
  align-items: flex-start;
  gap: ${({theme:e})=>e.spacing.sm};
`,_e=s.Ay.div`
  display: flex;
  flex-direction: column;
  gap: ${({theme:e})=>e.spacing.xs};
  flex: 1;
`,Ge=s.Ay.label`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  font-weight: ${({theme:e})=>e.typography.fontWeight.medium};
  color: ${({theme:e})=>e.colors.text.primary};
  cursor: pointer;
  
  &[data-disabled] {
    color: ${({theme:e})=>e.colors.text.disabled};
    cursor: not-allowed;
  }
`,Je=s.Ay.p`
  margin: 0;
  font-size: ${({theme:e})=>e.typography.fontSize.xs};
  color: ${({theme:e})=>e.colors.text.secondary};
  
  &[data-disabled] {
    color: ${({theme:e})=>e.colors.text.disabled};
  }
`,Ze=(0,s.Ay)(Xe.bL)`
  width: 44px;
  height: 24px;
  background: ${({theme:e,$checked:t})=>t?e.colors.primary:e.colors.surface};
  border: 1px solid ${({theme:e,$checked:t})=>t?e.colors.primary:e.colors.border.default};
  border-radius: ${({theme:e})=>e.borderRadius.full};
  position: relative;
  cursor: pointer;
  transition: all ${({theme:e})=>e.animation.duration.fast} ${({theme:e})=>e.animation.easing.ease};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({theme:e})=>e.colors.primary}40;
  }
  
  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not([data-disabled]) {
    background: ${({theme:e,$checked:t})=>t?e.colors.primary:e.colors.border.hover};
  }
`,Ke=(0,s.Ay)(Xe.zi)`
  display: block;
  width: 18px;
  height: 18px;
  background: ${({theme:e})=>e.colors.background};
  border-radius: ${({theme:e})=>e.borderRadius.full};
  box-shadow: ${({theme:e})=>e.shadows.sm};
  transition: transform ${({theme:e})=>e.animation.duration.fast} ${({theme:e})=>e.animation.easing.ease};
  transform: translateX(2px);
  will-change: transform;
  
  &[data-state='checked'] {
    transform: translateX(22px);
  }
`,qe=s.Ay.div`
  display: flex;
  align-items: center;
  margin-top: 2px; /* 对齐文本基线 */
`,Qe=({checked:e,onCheckedChange:t,disabled:o=!1,label:i,description:n,className:s})=>(0,r.jsxs)(Be,{className:s,children:[(0,r.jsx)(qe,{children:(0,r.jsx)(Ze,{checked:e,onCheckedChange:t,disabled:o,$checked:e,children:(0,r.jsx)(Ke,{})})}),(i||n)&&(0,r.jsxs)(_e,{children:[i&&(0,r.jsx)(Ge,{"data-disabled":o?"":void 0,children:i}),n&&(0,r.jsx)(Je,{"data-disabled":o?"":void 0,children:n})]})]}),et=s.Ay.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({theme:e})=>e.colors.background};
  overflow-y: auto;
`,tt=s.Ay.div`
  border-bottom: 1px solid ${({theme:e})=>e.colors.border.default};
  background: ${({theme:e})=>e.colors.surface};
`,ot=s.Ay.div`
  padding: ${({theme:e})=>e.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: ${({theme:e})=>e.colors.background};
  }
`,rt=s.Ay.h4`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  font-weight: ${({theme:e})=>e.typography.fontWeight.semibold};
  color: ${({theme:e})=>e.colors.text.primary};
  margin: 0;
`,it=s.Ay.div`
  padding: ${({theme:e})=>e.spacing.md};
  padding-top: 0;
  display: ${({$collapsed:e})=>e?"none":"block"};
`,nt=s.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.sm};
  margin-bottom: ${({theme:e})=>e.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`,st=s.Ay.label`
  font-size: ${({theme:e})=>e.typography.fontSize.xs};
  color: ${({theme:e})=>e.colors.text.secondary};
  min-width: 60px;
  flex-shrink: 0;
`,at=s.Ay.div`
  flex: 1;
`,lt=s.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.sm};
`,dt=s.Ay.div`
  width: 32px;
  height: 32px;
  border-radius: ${({theme:e})=>e.borderRadius.sm};
  background: ${({$color:e})=>e};
  border: 1px solid ${({theme:e})=>e.colors.border.default};
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: scale(1.05);
  }
`,ct=s.Ay.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${({theme:e})=>e.spacing.xs};
  margin-top: ${({theme:e})=>e.spacing.sm};
`,ht=s.Ay.div`
  width: 24px;
  height: 24px;
  border-radius: ${({theme:e})=>e.borderRadius.sm};
  background: ${({$color:e})=>e};
  border: 1px solid ${({theme:e})=>e.colors.border.default};
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }
`,pt=s.Ay.div`
  padding: ${({theme:e})=>e.spacing["3xl"]};
  text-align: center;
  color: ${({theme:e})=>e.colors.text.secondary};
`,gt=s.Ay.div`
  font-size: 48px;
  margin-bottom: ${({theme:e})=>e.spacing.lg};
`,mt=()=>{const[e]=(0,i.useState)("select"),[t]=(0,i.useState)(null),[o,n]=(0,i.useState)([]),[s,a]=(0,i.useState)({position:{x:100,y:100},size:{width:200,height:100},rotation:0,opacity:100,fillColor:"#6366f1",strokeColor:"#000000",strokeWidth:1,borderRadius:0,fontSize:16,fontWeight:400,textAlign:"left",visible:!0,locked:!1}),l=e=>{n(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e])},d=(e,t)=>{a(o=>({...o,[e]:t}))},c=(e,t,o)=>{a(r=>({...r,[e]:{...r[e],[t]:o}}))};return t||"select"!==e?(0,r.jsxs)(et,{children:[(0,r.jsxs)(tt,{children:[(0,r.jsxs)(ot,{onClick:()=>l("transform"),children:[(0,r.jsx)(rt,{children:"变换"}),(0,r.jsx)(H,{variant:"ghost",size:"xs",icon:o.includes("transform")?"▶️":"🔽"})]}),(0,r.jsxs)(it,{$collapsed:o.includes("transform"),children:[(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"位置"}),(0,r.jsx)(at,{children:(0,r.jsxs)("div",{style:{display:"flex",gap:"8px"},children:[(0,r.jsx)(Ue,{size:"sm",value:s.position.x,onChange:e=>c("position","x",Number(e.target.value)),placeholder:"X"}),(0,r.jsx)(Ue,{size:"sm",value:s.position.y,onChange:e=>c("position","y",Number(e.target.value)),placeholder:"Y"})]})})]}),(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"尺寸"}),(0,r.jsx)(at,{children:(0,r.jsxs)("div",{style:{display:"flex",gap:"8px"},children:[(0,r.jsx)(Ue,{size:"sm",value:s.size.width,onChange:e=>c("size","width",Number(e.target.value)),placeholder:"宽"}),(0,r.jsx)(Ue,{size:"sm",value:s.size.height,onChange:e=>c("size","height",Number(e.target.value)),placeholder:"高"})]})})]}),(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"旋转"}),(0,r.jsx)(at,{children:(0,r.jsx)(Ve,{value:[s.rotation],onValueChange:e=>d("rotation",e[0]),min:0,max:360})})]}),(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"透明度"}),(0,r.jsx)(at,{children:(0,r.jsx)(Ve,{value:[s.opacity],onValueChange:e=>d("opacity",e[0]),min:0,max:100})})]})]})]}),(0,r.jsxs)(tt,{children:[(0,r.jsxs)(ot,{onClick:()=>l("appearance"),children:[(0,r.jsx)(rt,{children:"外观"}),(0,r.jsx)(H,{variant:"ghost",size:"xs",icon:o.includes("appearance")?"▶️":"🔽"})]}),(0,r.jsxs)(it,{$collapsed:o.includes("appearance"),children:[(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"填充"}),(0,r.jsxs)(at,{children:[(0,r.jsxs)(lt,{children:[(0,r.jsx)(dt,{$color:s.fillColor}),(0,r.jsx)(Ue,{size:"sm",value:s.fillColor,onChange:e=>d("fillColor",e.target.value)})]}),(0,r.jsx)(ct,{children:["#6366f1","#8b5cf6","#ec4899","#ef4444","#f59e0b","#10b981","#06b6d4","#64748b","#000000","#ffffff","#f3f4f6","#1f2937"].map(e=>(0,r.jsx)(ht,{$color:e,onClick:()=>d("fillColor",e)},e))})]})]}),(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"描边"}),(0,r.jsx)(at,{children:(0,r.jsxs)(lt,{children:[(0,r.jsx)(dt,{$color:s.strokeColor}),(0,r.jsx)(Ue,{size:"sm",value:s.strokeColor,onChange:e=>d("strokeColor",e.target.value)})]})})]}),(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"描边宽度"}),(0,r.jsx)(at,{children:(0,r.jsx)(Ve,{value:[s.strokeWidth],onValueChange:e=>d("strokeWidth",e[0]),min:0,max:10})})]}),(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"圆角"}),(0,r.jsx)(at,{children:(0,r.jsx)(Ve,{value:[s.borderRadius],onValueChange:e=>d("borderRadius",e[0]),min:0,max:50})})]})]})]}),"text"===e&&(0,r.jsxs)(tt,{children:[(0,r.jsxs)(ot,{onClick:()=>l("text"),children:[(0,r.jsx)(rt,{children:"文本"}),(0,r.jsx)(H,{variant:"ghost",size:"xs",icon:o.includes("text")?"▶️":"🔽"})]}),(0,r.jsxs)(it,{$collapsed:o.includes("text"),children:[(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"字体大小"}),(0,r.jsx)(at,{children:(0,r.jsx)(Ve,{value:[s.fontSize],onValueChange:e=>d("fontSize",e[0]),min:8,max:72})})]}),(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"字重"}),(0,r.jsx)(at,{children:(0,r.jsx)(Ve,{value:[s.fontWeight],onValueChange:e=>d("fontWeight",e[0]),min:100,max:900,step:100})})]}),(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"对齐"}),(0,r.jsx)(at,{children:(0,r.jsxs)("div",{style:{display:"flex",gap:"4px"},children:[(0,r.jsx)(H,{variant:"left"===s.textAlign?"primary":"ghost",size:"sm",icon:"⬅️",onClick:()=>d("textAlign","left")}),(0,r.jsx)(H,{variant:"center"===s.textAlign?"primary":"ghost",size:"sm",icon:"↔️",onClick:()=>d("textAlign","center")}),(0,r.jsx)(H,{variant:"right"===s.textAlign?"primary":"ghost",size:"sm",icon:"➡️",onClick:()=>d("textAlign","right")})]})})]})]})]}),(0,r.jsxs)(tt,{children:[(0,r.jsxs)(ot,{onClick:()=>l("layer"),children:[(0,r.jsx)(rt,{children:"图层"}),(0,r.jsx)(H,{variant:"ghost",size:"xs",icon:o.includes("layer")?"▶️":"🔽"})]}),(0,r.jsxs)(it,{$collapsed:o.includes("layer"),children:[(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"可见"}),(0,r.jsx)(at,{children:(0,r.jsx)(Qe,{checked:s.visible,onCheckedChange:e=>d("visible",e)})})]}),(0,r.jsxs)(nt,{children:[(0,r.jsx)(st,{children:"锁定"}),(0,r.jsx)(at,{children:(0,r.jsx)(Qe,{checked:s.locked,onCheckedChange:e=>d("locked",e)})})]})]})]})]}):(0,r.jsx)(et,{children:(0,r.jsxs)(pt,{children:[(0,r.jsx)(gt,{children:"🎯"}),(0,r.jsx)("div",{children:"选择对象以编辑属性"})]})})},ut=e=>{switch(e){case"success":return s.AH`${({theme:e})=>e.colors.success}`;case"warning":return s.AH`${({theme:e})=>e.colors.warning}`;case"error":return s.AH`${({theme:e})=>e.colors.error}`;default:return s.AH`${({theme:e})=>e.colors.primary}`}},xt=(s.Ay.div`
  display: flex;
  flex-direction: column;
  gap: ${({theme:e})=>e.spacing.xs};
`,s.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,s.Ay.span`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  font-weight: ${({theme:e})=>e.typography.fontWeight.medium};
  color: ${({theme:e})=>e.colors.text.primary};
`,s.Ay.span`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  color: ${({theme:e})=>e.colors.text.secondary};
`,s.Ay.div`
  width: 100%;
  background: ${({theme:e})=>e.colors.surface};
  border: 1px solid ${({theme:e})=>e.colors.border.default}40;
  border-radius: ${({theme:e})=>e.borderRadius.full};
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  
  ${({$size:e})=>(e=>{switch(e){case"sm":return s.AH`
        height: 4px;
      `;case"md":return s.AH`
        height: 6px;
      `;case"lg":return s.AH`
        height: 8px;
      `;default:return s.AH``}})(e)}
`,s.i7`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`),ft=(s.Ay.div`
  height: 100%;
  background: linear-gradient(90deg, ${({$variant:e})=>ut(e)}, ${({$variant:e})=>ut(e)}dd);
  border-radius: ${({theme:e})=>e.borderRadius.full};
  transition: width ${({theme:e})=>e.animation.duration.normal} ${({theme:e})=>e.animation.easing.ease};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    border-radius: inherit;
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  ${({$indeterminate:e,$value:t})=>e?s.AH`
          width: 50%;
          animation: ${xt} 1.5s ease-in-out infinite;
        `:s.AH`
          width: ${t}%;
        `}
`,s.Ay.div`
  height: 24px;
  background: ${({theme:e})=>e.colors.surface};
  border-top: 1px solid ${({theme:e})=>e.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({theme:e})=>e.spacing.md};
  font-size: ${({theme:e})=>e.typography.fontSize.xs};
  color: ${({theme:e})=>e.colors.text.secondary};
`),yt=s.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.md};
`,bt=s.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.xs};
`,$t=s.Ay.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({theme:e,$level:t})=>{switch(t){case"good":return e.colors.success;case"warning":return e.colors.warning;case"error":return e.colors.error;default:return e.colors.text.disabled}}};
`,vt=s.Ay.div`
  width: 1px;
  height: 16px;
  background: ${({theme:e})=>e.colors.border.default};
`,wt=(s.Ay.div`
  width: 120px;
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.xs};
`,()=>{const e=(e,t)=>e<=t[0]?"good":e<=t[1]?"warning":"error",t=e(85,[100,200]),o=e(15,[30,60]);return(0,r.jsxs)(ft,{children:[(0,r.jsxs)(yt,{children:[(0,r.jsxs)(bt,{children:[(0,r.jsx)(V,{variant:"success",size:"sm",children:"就绪"}),(0,r.jsx)("span",{children:"选择工具开始创作"})]}),(0,r.jsx)(vt,{}),(0,r.jsx)(bt,{children:(0,r.jsx)("span",{children:"画布: 800×600"})}),(0,r.jsx)(bt,{children:(0,r.jsx)("span",{children:"缩放: 100%"})}),(0,r.jsx)(vt,{}),(0,r.jsx)(bt,{children:(0,r.jsx)("span",{children:"图层: 3"})}),(0,r.jsx)(bt,{children:(0,r.jsx)("span",{children:"选中: 1"})})]}),(0,r.jsxs)(yt,{children:[!1,(0,r.jsxs)(bt,{children:[(0,r.jsx)($t,{$level:t}),(0,r.jsxs)("span",{children:["内存: ",85,"MB"]})]}),(0,r.jsxs)(bt,{children:[(0,r.jsx)($t,{$level:"good"}),(0,r.jsxs)("span",{children:["FPS: ",60]})]}),(0,r.jsxs)(bt,{children:[(0,r.jsx)($t,{$level:o}),(0,r.jsxs)("span",{children:["CPU: ",15,"%"]})]}),(0,r.jsx)(vt,{}),(0,r.jsx)(bt,{children:(0,r.jsx)("span",{children:"Ctrl+Z 撤销 | Ctrl+Y 重做 | V 选择"})}),(0,r.jsx)(vt,{}),(0,r.jsxs)(bt,{children:[(0,r.jsx)($t,{$level:"good"}),(0,r.jsx)("span",{children:"在线"})]}),(0,r.jsx)(H,{variant:"ghost",size:"xs",icon:"🌙",onClick:()=>console.log("Toggle theme")})]})]})}),jt=s.Ay.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({theme:e})=>e.colors.background};
`,kt=s.Ay.div`
  padding: ${({theme:e})=>e.spacing.md};
  border-bottom: 1px solid ${({theme:e})=>e.colors.border.default};
  background: ${({theme:e})=>e.colors.surface};
`,zt=s.Ay.h3`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  font-weight: ${({theme:e})=>e.typography.fontWeight.semibold};
  color: ${({theme:e})=>e.colors.text.primary};
  margin: 0 0 ${({theme:e})=>e.spacing.sm} 0;
`,At=(0,s.Ay)(Ue)`
  margin-bottom: ${({theme:e})=>e.spacing.sm};
`,St=s.Ay.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({theme:e})=>e.spacing.sm};
`,Ct=s.Ay.div`
  display: flex;
  align-items: center;
  padding: ${({theme:e})=>e.spacing.xs} ${({theme:e})=>e.spacing.sm};
  padding-left: ${({$level:e,theme:t})=>`calc(${t.spacing.sm} + ${20*e}px)`};
  margin-bottom: 1px;
  border-radius: ${({theme:e})=>e.borderRadius.sm};
  cursor: pointer;
  background: ${({theme:e,$selected:t})=>t?e.colors.primary+"20":"transparent"};
  border: 1px solid ${({theme:e,$selected:t})=>t?e.colors.primary:"transparent"};
  
  &:hover {
    background: ${({theme:e,$selected:t})=>t?e.colors.primary+"30":e.colors.surface};
  }
`,Lt=s.Ay.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({theme:e})=>e.spacing.xs};
  cursor: pointer;
  transform: ${({$expanded:e})=>e?"rotate(90deg)":"rotate(0deg)"};
  transition: transform ${({theme:e})=>e.animation.duration.fast};
`,It=s.Ay.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({theme:e})=>e.spacing.xs};
  font-size: 12px;
`,Et=s.Ay.span`
  flex: 1;
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  color: ${({theme:e})=>e.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`,Pt=s.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.xs};
  opacity: 0;
  transition: opacity ${({theme:e})=>e.animation.duration.fast};
  
  ${Ct}:hover & {
    opacity: 1;
  }
`,Ht=s.Ay.div`
  padding: ${({theme:e})=>e.spacing.sm};
  border-top: 1px solid ${({theme:e})=>e.colors.border.default};
  background: ${({theme:e})=>e.colors.surface};
  display: flex;
  gap: ${({theme:e})=>e.spacing.xs};
`,Tt=()=>{const[e,t]=(0,i.useState)(""),[o,n]=(0,i.useState)(["layer-1"]),[s,a]=(0,i.useState)([{id:"group-1",name:"游戏UI组",type:"group",visible:!0,locked:!1,expanded:!0,children:[{id:"layer-1",name:"主按钮",type:"shape",visible:!0,locked:!1},{id:"layer-2",name:"按钮文字",type:"text",visible:!0,locked:!1}]},{id:"layer-3",name:"背景图片",type:"image",visible:!0,locked:!1},{id:"layer-4",name:"装饰元素",type:"brush",visible:!1,locked:!0}]),l=e=>{switch(e){case"group":return"📁";case"text":return"📝";case"image":return"🖼️";case"shape":return"⬜";case"brush":return"🖌️";default:return"📄"}},d=(e,t=0)=>{const c=o.includes(e.id);return(0,r.jsxs)(i.Fragment,{children:[(0,r.jsxs)(Ct,{$level:t,$selected:c,onClick:t=>((e,t=!1)=>{n(t?t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]:[e])})(e.id,t.ctrlKey||t.metaKey),children:[e.children&&(0,r.jsx)(Lt,{$expanded:e.expanded||!1,onClick:t=>{t.stopPropagation(),(e=>{const t=o=>o.map(o=>o.id===e?{...o,expanded:!o.expanded}:o.children?{...o,children:t(o.children)}:o);a(t(s))})(e.id)},children:"▶"}),(0,r.jsx)(It,{children:l(e.type)}),(0,r.jsx)(Et,{children:e.name}),(0,r.jsxs)(Pt,{children:[(0,r.jsx)(H,{variant:"ghost",size:"xs",icon:e.visible?"👁️":"🙈",onClick:t=>{t.stopPropagation(),(e=>{const t=o=>o.map(o=>o.id===e?{...o,visible:!o.visible}:o.children?{...o,children:t(o.children)}:o);a(t(s))})(e.id)}}),(0,r.jsx)(H,{variant:"ghost",size:"xs",icon:e.locked?"🔒":"🔓",onClick:t=>{t.stopPropagation(),(e=>{const t=o=>o.map(o=>o.id===e?{...o,locked:!o.locked}:o.children?{...o,children:t(o.children)}:o);a(t(s))})(e.id)}})]})]}),e.children&&e.expanded&&e.children.map(e=>d(e,t+1))]},e.id)},c=s.filter(t=>t.name.toLowerCase().includes(e.toLowerCase()));return(0,r.jsxs)(jt,{children:[(0,r.jsxs)(kt,{children:[(0,r.jsx)(zt,{children:"图层"}),(0,r.jsx)(At,{placeholder:"搜索图层...",value:e,onChange:e=>t(e.target.value),size:"sm"})]}),(0,r.jsx)(St,{children:c.map(e=>d(e))}),(0,r.jsxs)(Ht,{children:[(0,r.jsx)(I,{variant:"ghost",size:"sm",fullWidth:!0,children:"➕ 添加图层"}),(0,r.jsx)(H,{variant:"ghost",size:"sm",icon:"🗑️",disabled:0===o.length})]})]})},Rt=s.Ay.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({theme:e})=>e.colors.background};
`,Ut=s.Ay.div`
  padding: ${({theme:e})=>e.spacing.md};
  border-bottom: 1px solid ${({theme:e})=>e.colors.border.default};
  background: ${({theme:e})=>e.colors.surface};
`,Mt=s.Ay.h3`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  font-weight: ${({theme:e})=>e.typography.fontWeight.semibold};
  color: ${({theme:e})=>e.colors.text.primary};
  margin: 0 0 ${({theme:e})=>e.spacing.sm} 0;
`,Ot=s.Ay.div`
  display: flex;
  gap: ${({theme:e})=>e.spacing.xs};
  margin-bottom: ${({theme:e})=>e.spacing.sm};
`,Wt=s.Ay.div`
  display: flex;
  gap: ${({theme:e})=>e.spacing.xs};
  margin-bottom: ${({theme:e})=>e.spacing.sm};
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    display: none;
  }
`,Nt=s.Ay.button`
  padding: ${({theme:e})=>e.spacing.xs} ${({theme:e})=>e.spacing.sm};
  border: 1px solid ${({theme:e,$active:t})=>t?e.colors.primary:e.colors.border.default};
  background: ${({theme:e,$active:t})=>t?e.colors.primary+"20":e.colors.surface};
  color: ${({theme:e,$active:t})=>t?e.colors.primary:e.colors.text.secondary};
  border-radius: ${({theme:e})=>e.borderRadius.md};
  font-size: ${({theme:e})=>e.typography.fontSize.xs};
  white-space: nowrap;
  cursor: pointer;
  transition: all ${({theme:e})=>e.animation.duration.fast};
  
  &:hover {
    border-color: ${({theme:e})=>e.colors.primary};
    color: ${({theme:e})=>e.colors.primary};
  }
`,Dt=s.Ay.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({theme:e})=>e.spacing.sm};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: ${({theme:e})=>e.spacing.sm};
  align-content: start;
`,Yt=s.Ay.div`
  aspect-ratio: 1;
  border: 1px solid ${({theme:e})=>e.colors.border.default};
  border-radius: ${({theme:e})=>e.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all ${({theme:e})=>e.animation.duration.fast};
  background: ${({theme:e})=>e.colors.surface};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({theme:e})=>e.shadows.md};
    border-color: ${({theme:e})=>e.colors.primary};
  }
`,Ft=s.Ay.div`
  width: 100%;
  height: 70%;
  background: ${({$bgColor:e,theme:t})=>e||t.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: relative;
`,Vt=s.Ay.div`
  height: 30%;
  padding: ${({theme:e})=>e.spacing.xs};
  display: flex;
  flex-direction: column;
  justify-content: center;
`,Xt=s.Ay.div`
  font-size: ${({theme:e})=>e.typography.fontSize.xs};
  color: ${({theme:e})=>e.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`,Bt=s.Ay.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity ${({theme:e})=>e.animation.duration.fast};
  
  ${Yt}:hover & {
    opacity: 1;
  }
`,_t=(0,s.Ay)(H)`
  position: absolute;
  top: ${({theme:e})=>e.spacing.xs};
  right: ${({theme:e})=>e.spacing.xs};
  background: rgba(0, 0, 0, 0.5);
  color: white;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`,Gt=s.Ay.div`
  padding: ${({theme:e})=>e.spacing.sm};
  border-top: 1px solid ${({theme:e})=>e.colors.border.default};
  background: ${({theme:e})=>e.colors.surface};
  display: flex;
  gap: ${({theme:e})=>e.spacing.xs};
`,Jt=s.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme:e})=>e.spacing.sm};
`,Zt=()=>{const[e,t]=(0,i.useState)(""),[o,n]=(0,i.useState)("all"),[,s]=(0,i.useState)("name"),a=[{id:"1",name:"科幻背景1",category:"backgrounds",thumbnail:"🌌",size:"1920x1080",format:"PNG",tags:["科幻","太空","蓝色"],favorite:!0},{id:"2",name:"主按钮",category:"ui-elements",thumbnail:"🔘",size:"200x60",format:"PNG",tags:["按钮","UI","蓝色"],favorite:!1},{id:"3",name:"战士角色",category:"characters",thumbnail:"⚔️",size:"256x256",format:"PNG",tags:["角色","战士","像素"],favorite:!0},{id:"4",name:"设置图标",category:"icons",thumbnail:"⚙️",size:"64x64",format:"SVG",tags:["图标","设置","齿轮"],favorite:!1},{id:"5",name:"爆炸特效",category:"effects",thumbnail:"💥",size:"128x128",format:"PNG",tags:["特效","爆炸","动画"],favorite:!1}],l=a.filter(t=>{const r=t.name.toLowerCase().includes(e.toLowerCase())||t.tags.some(t=>t.toLowerCase().includes(e.toLowerCase())),i="all"===o||t.category===o;return r&&i});return(0,r.jsxs)(Rt,{children:[(0,r.jsxs)(Ut,{children:[(0,r.jsx)(Mt,{children:"素材库"}),(0,r.jsxs)(Ot,{children:[(0,r.jsx)(Ue,{placeholder:"搜索素材...",value:e,onChange:e=>t(e.target.value),size:"sm"}),(0,r.jsxs)(D,{trigger:(0,r.jsx)(H,{variant:"ghost",size:"sm",icon:"🔽"}),children:[(0,r.jsx)(Y,{onSelect:()=>s("name"),children:"按名称排序"}),(0,r.jsx)(Y,{onSelect:()=>s("date"),children:"按日期排序"}),(0,r.jsx)(Y,{onSelect:()=>s("size"),children:"按大小排序"})]})]}),(0,r.jsx)(Wt,{children:[{id:"all",name:"全部",count:52},{id:"backgrounds",name:"背景",count:10},{id:"characters",name:"角色",count:5},{id:"ui-elements",name:"UI元素",count:20},{id:"icons",name:"图标",count:15},{id:"effects",name:"特效",count:8}].map(e=>(0,r.jsxs)(Nt,{$active:o===e.id,onClick:()=>n(e.id),children:[e.name," (",e.count,")"]},e.id))}),(0,r.jsxs)(Jt,{children:[(0,r.jsxs)("span",{style:{fontSize:"12px",color:"var(--text-secondary)"},children:[l.length," 个素材"]}),(0,r.jsxs)(V,{variant:"info",size:"sm",children:[a.filter(e=>e.favorite).length," 收藏"]})]})]}),(0,r.jsx)(Dt,{children:l.map(e=>(0,r.jsxs)(Yt,{onClick:()=>(e=>{console.log("Asset clicked:",e)})(e),children:[(0,r.jsx)(Ft,{children:e.thumbnail}),(0,r.jsx)(Vt,{children:(0,r.jsx)(Xt,{children:e.name})}),(0,r.jsx)(_t,{variant:"ghost",size:"xs",icon:e.favorite?"❤️":"🤍",onClick:t=>{var o;t.stopPropagation(),o=e.id,console.log("Toggle favorite:",o)}}),(0,r.jsx)(Bt,{children:(0,r.jsx)(I,{variant:"primary",size:"sm",children:"使用"})})]},e.id))}),(0,r.jsxs)(Gt,{children:[(0,r.jsx)(I,{variant:"outline",size:"sm",onClick:()=>{console.log("Upload asset")},children:"📤 上传素材"}),(0,r.jsx)(I,{variant:"ghost",size:"sm",children:"📁 管理分类"})]})]})},Kt=s.Ay.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: ${({theme:e})=>e.colors.background};
  overflow: hidden;
`,qt=s.Ay.div`
  flex-shrink: 0;
  z-index: ${({theme:e})=>e.zIndex.banner};
`,Qt=s.Ay.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`,eo=s.Ay.div`
  display: flex;
  flex-shrink: 0;
  width: ${({$collapsed:e})=>e?"60px":"280px"};
  transition: width ${({theme:e})=>e.animation.duration.normal} ${({theme:e})=>e.animation.easing.ease};
  background: ${({theme:e})=>e.colors.surface};
  border-right: 1px solid ${({theme:e})=>e.colors.border.default};
  z-index: ${({theme:e})=>e.zIndex.docked};
`,to=s.Ay.div`
  width: 60px;
  background: ${({theme:e})=>e.colors.surface};
  border-right: 1px solid ${({theme:e})=>e.colors.border.default};
  flex-shrink: 0;
`,oo=s.Ay.div`
  flex: 1;
  background: ${({theme:e})=>e.colors.background};
  display: ${({$collapsed:e})=>e?"none":"block"};
`,ro=s.Ay.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`,io=s.Ay.div`
  width: ${({$collapsed:e})=>e?"0px":"320px"};
  flex-shrink: 0;
  background: ${({theme:e})=>e.colors.surface};
  border-left: 1px solid ${({theme:e})=>e.colors.border.default};
  transition: width ${({theme:e})=>e.animation.duration.normal} ${({theme:e})=>e.animation.easing.ease};
  overflow: hidden;
  z-index: ${({theme:e})=>e.zIndex.docked};
`,no=s.Ay.div`
  flex-shrink: 0;
  z-index: ${({theme:e})=>e.zIndex.sticky};
`,so=()=>{const[e,t]=(0,i.useState)(!1),[o,n]=(0,i.useState)(!1),[s,a]=(0,i.useState)("layers");return(0,r.jsxs)(Kt,{children:[(0,r.jsx)(qt,{children:(0,r.jsx)(oe,{onToggleLeftPanel:()=>{t(!e)},onToggleRightPanel:()=>{n(!o)},leftPanelCollapsed:e,rightPanelCollapsed:o})}),(0,r.jsxs)(Qt,{children:[(0,r.jsxs)(eo,{$collapsed:e,children:[(0,r.jsx)(to,{children:(0,r.jsx)(he,{activePanel:s,onSwitchPanel:o=>{a(o),e&&t(!1)}})}),(0,r.jsx)(oo,{$collapsed:e,children:"layers"===s?(0,r.jsx)(Tt,{}):(0,r.jsx)(Zt,{})})]}),(0,r.jsx)(ro,{children:(0,r.jsx)(Le,{})}),(0,r.jsx)(io,{$collapsed:o,children:(0,r.jsx)(mt,{})})]}),(0,r.jsx)(no,{children:(0,r.jsx)(wt,{})})]})},ao=s.Ay.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({theme:e})=>e.colors.background} 0%, ${({theme:e})=>e.colors.surface} 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, ${({theme:e})=>e.colors.primary}15 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, ${({theme:e})=>e.colors.accent}15 0%, transparent 50%);
    pointer-events: none;
  }
`,lo=s.Ay.div`
  max-width: 800px;
  width: 90%;
  position: relative;
  z-index: 1;
`,co=s.Ay.div`
  text-align: center;
  margin-bottom: ${({theme:e})=>e.spacing["3xl"]};
`,ho=s.Ay.h1`
  font-size: ${({theme:e})=>e.typography.fontSize["4xl"]};
  font-weight: ${({theme:e})=>e.typography.fontWeight.bold};
  color: ${({theme:e})=>e.colors.text.primary};
  margin-bottom: ${({theme:e})=>e.spacing.md};
  
  // &::after {
  //   content: '';
  //   display: block;
  //   width: 80px;
  //   height: 4px;
  //   background: linear-gradient(90deg, ${({theme:e})=>e.colors.primary}, ${({theme:e})=>e.colors.accent});
  //   margin: ${({theme:e})=>e.spacing.lg} auto 0;
  //   border-radius: 2px;
  // }
`,po=s.Ay.p`
  font-size: ${({theme:e})=>e.typography.fontSize.lg};
  color: ${({theme:e})=>e.colors.text.secondary};
  margin-bottom: ${({theme:e})=>e.spacing.xl};
`,go=s.Ay.div`
  display: flex;
  justify-content: center;
  gap: ${({theme:e})=>e.spacing.lg};
`,mo=({onComplete:e})=>{const[t]=(0,i.useState)("new-project");return(0,r.jsx)(ao,{children:(0,r.jsxs)(lo,{children:[(0,r.jsxs)(co,{children:[(0,r.jsx)(ho,{children:"G-Asset Forge"}),(0,r.jsx)(po,{children:"快速、批量、标准化的渠道投放素材生产"})]}),(0,r.jsx)(go,{children:(0,r.jsx)(I,{variant:"primary",onClick:()=>{switch(localStorage.setItem("g-asset-forge-used","true"),t){case"tutorial":console.log("Starting tutorial mode");break;case"template":console.log("Opening template selection")}e()},children:"开始使用"})})]})})};var uo=o(7282),xo=o(7134);class fo{constructor(e={}){this.initializationPromise=null,this.timeoutId=null,this.options={maxRetries:e.maxRetries??3,timeout:e.timeout??1e4,enableLogging:e.enableLogging??!0},this.state={status:"idle",startTime:null,completedTime:null,error:null,retryCount:0}}static getInstance(e){return fo.instance||(fo.instance=new fo(e)),fo.instance}getState(){return{...this.state}}get isInitialized(){return"completed"===this.state.status}get isInitializing(){return"initializing"===this.state.status}get hasFailed(){return"failed"===this.state.status}async initializeOnce(e){if("completed"!==this.state.status){if("initializing"===this.state.status&&this.initializationPromise)return this.log("应用正在初始化中，等待完成..."),this.initializationPromise;if("failed"===this.state.status){if(this.state.retryCount>=this.options.maxRetries)throw new Error(`初始化失败，已达到最大重试次数 (${this.options.maxRetries})`);this.log(`初始化失败，准备重试 (${this.state.retryCount+1}/${this.options.maxRetries})`)}return this.initializationPromise=this.performInitialization(e),this.initializationPromise}this.log("应用已经初始化完成，跳过重复初始化")}async performInitialization(e){try{this.updateState({status:"initializing",startTime:Date.now(),error:null}),this.log("开始应用初始化..."),this.setupTimeout(),await e(),this.clearTimeout(),this.updateState({status:"completed",completedTime:Date.now()});const t=this.state.completedTime-this.state.startTime;this.log(`应用初始化完成，耗时: ${t}ms`)}catch(e){throw this.clearTimeout(),this.state.retryCount++,this.updateState({status:"failed",error:e instanceof Error?e:new Error(String(e))}),this.log(`应用初始化失败: ${e instanceof Error?e.message:String(e)}`),e}}setupTimeout(){this.timeoutId=setTimeout(()=>{const e=new Error(`初始化超时 (${this.options.timeout}ms)`);this.updateState({status:"failed",error:e}),this.log(`初始化超时: ${this.options.timeout}ms`)},this.options.timeout)}clearTimeout(){this.timeoutId&&(clearTimeout(this.timeoutId),this.timeoutId=null)}updateState(e){this.state={...this.state,...e}}reset(){this.clearTimeout(),this.initializationPromise=null,this.state={status:"idle",startTime:null,completedTime:null,error:null,retryCount:0},this.log("初始化管理器已重置")}async forceReinitialize(e){return this.log("强制重新初始化..."),this.reset(),this.initializeOnce(e)}getStats(){const e=this.state.startTime&&this.state.completedTime?this.state.completedTime-this.state.startTime:null;return{isInitialized:this.isInitialized,isInitializing:this.isInitializing,hasFailed:this.hasFailed,duration:e,retryCount:this.state.retryCount,error:this.state.error?.message||null}}log(e){this.options.enableLogging&&console.log(`[InitializationManager] ${e}`)}destroy(){this.clearTimeout(),this.initializationPromise=null,fo.instance=null}}fo.instance=null;const yo=fo.getInstance(),bo=new class{constructor(e={}){this.updateHistory=[],this.suspiciousPatterns=[],this.warningCallbacks=[],this.options={maxHistorySize:e.maxHistorySize??100,rapidUpdateThreshold:e.rapidUpdateThreshold??10,rapidUpdateWindow:e.rapidUpdateWindow??1e3,circularDependencyDepth:e.circularDependencyDepth??5,enableStackTrace:e.enableStackTrace??!1,enableLogging:e.enableLogging??!0}}validateStateUpdate(e,t,o,r){if(this.isValueEqual(t,o))return this.log(`状态路径 ${e} 的值没有变化，建议跳过更新`),!1;const i={timestamp:Date.now(),statePath:e,prevValue:this.cloneValue(t),nextValue:this.cloneValue(o),componentName:r,stackTrace:this.options.enableStackTrace?this.getStackTrace():void 0};return this.recordUpdate(i),this.detectSuspiciousPatterns(),!0}detectInfiniteLoop(e){const t=e||this.updateHistory;if(t.length<3)return!1;const o=t.slice(-10),r=new Map;for(const e of o){const t=r.get(e.statePath)||0;r.set(e.statePath,t+1)}for(const[e,t]of r)if(t>=this.options.rapidUpdateThreshold)return this.log(`检测到潜在无限循环: ${e} 在短时间内更新了 ${t} 次`),!0;return!1}logSuspiciousUpdates(e){0!==e.length&&(this.log("=== 可疑状态更新报告 ==="),e.forEach((e,t)=>{this.log(`${t+1}. ${e.statePath} (${e.componentName||"Unknown"})`),this.log(`   时间: ${new Date(e.timestamp).toISOString()}`),this.log(`   前值: ${JSON.stringify(e.prevValue)}`),this.log(`   后值: ${JSON.stringify(e.nextValue)}`),e.stackTrace&&this.log(`   调用栈: ${e.stackTrace}`)}))}getUpdateHistory(){return[...this.updateHistory]}getSuspiciousPatterns(){return[...this.suspiciousPatterns]}clearHistory(){this.updateHistory=[],this.suspiciousPatterns=[],this.log("状态更新历史已清除")}onWarning(e){this.warningCallbacks.push(e)}removeWarning(e){const t=this.warningCallbacks.indexOf(e);t>-1&&this.warningCallbacks.splice(t,1)}generateReport(){const e=this.updateHistory.slice(-10),t=[];return this.suspiciousPatterns.length>0&&t.push("检测到可疑的状态更新模式，建议检查组件的useEffect依赖"),this.suspiciousPatterns.filter(e=>"rapid_updates"===e.type).length>0&&t.push("检测到快速连续更新，建议使用防抖或批量更新"),this.suspiciousPatterns.filter(e=>"circular_dependency"===e.type).length>0&&t.push("检测到循环依赖，建议重新设计状态结构"),{totalUpdates:this.updateHistory.length,suspiciousPatterns:this.suspiciousPatterns.length,recentUpdates:e,recommendations:t}}recordUpdate(e){this.updateHistory.push(e),this.updateHistory.length>this.options.maxHistorySize&&(this.updateHistory=this.updateHistory.slice(-this.options.maxHistorySize))}detectSuspiciousPatterns(){this.detectRapidUpdates(),this.detectCircularDependencies(),this.detectInfiniteLoopPattern()}detectRapidUpdates(){const e=Date.now(),t=e-this.options.rapidUpdateWindow,o=this.updateHistory.filter(e=>e.timestamp>=t);if(o.length>=this.options.rapidUpdateThreshold){const t=new Map;o.forEach(e=>{const o=t.get(e.statePath)||0;t.set(e.statePath,o+1)});for(const[o,r]of t)if(r>=this.options.rapidUpdateThreshold){const t={type:"rapid_updates",detectedAt:e,affectedPaths:[o],severity:r>20?"high":r>15?"medium":"low",description:`状态路径 ${o} 在 ${this.options.rapidUpdateWindow}ms 内更新了 ${r} 次`,updateCount:r};this.addSuspiciousPattern(t)}}}detectCircularDependencies(){if(this.updateHistory.length<this.options.circularDependencyDepth)return;const e=this.updateHistory.slice(-this.options.circularDependencyDepth).map(e=>e.statePath);for(let t=0;t<e.length-1;t++)for(let o=t+1;o<e.length;o++)if(e[t]===e[o]){const r=e.slice(t,o),i={type:"circular_dependency",detectedAt:Date.now(),affectedPaths:r,severity:"medium",description:`检测到循环依赖: ${r.join(" -> ")}`,updateCount:r.length};return void this.addSuspiciousPattern(i)}}detectInfiniteLoopPattern(){if(this.detectInfiniteLoop()){const e={type:"infinite_loop",detectedAt:Date.now(),affectedPaths:Array.from(new Set(this.updateHistory.slice(-10).map(e=>e.statePath))),severity:"high",description:"检测到潜在的无限循环模式",updateCount:this.updateHistory.length};this.addSuspiciousPattern(e)}}addSuspiciousPattern(e){this.suspiciousPatterns.some(t=>t.type===e.type&&t.affectedPaths.join(",")===e.affectedPaths.join(",")&&Date.now()-t.detectedAt<5e3)||(this.suspiciousPatterns.push(e),this.log(`检测到可疑模式: ${e.description}`),this.warningCallbacks.forEach(t=>{try{t(e)}catch(e){console.error("警告回调执行失败:",e)}}))}isValueEqual(e,t){if(e===t)return!0;if(null==e||null==t)return e===t;if(typeof e!=typeof t)return!1;if("object"==typeof e)try{return JSON.stringify(e)===JSON.stringify(t)}catch{return!1}return!1}cloneValue(e){if(null==e||"object"!=typeof e)return e;try{return JSON.parse(JSON.stringify(e))}catch{return"[无法序列化的对象]"}}getStackTrace(){try{throw new Error}catch(e){return e instanceof Error&&e.stack?e.stack.split("\n").slice(2,5).join("\n"):"无法获取调用栈"}}log(e){this.options.enableLogging&&console.log(`[StateValidator] ${e}`)}};class $o{constructor(e={}){this.logEntries=[],this.logLevelPriority={debug:0,info:1,warn:2,error:3},this.options={enableConsoleOutput:e.enableConsoleOutput??!0,enableStackTrace:e.enableStackTrace??!1,maxLogEntries:e.maxLogEntries??1e3,logLevel:e.logLevel??"debug",categories:e.categories??[],enableTimestamp:e.enableTimestamp??!0,enableComponentTracking:e.enableComponentTracking??!0}}static getInstance(e){return $o.instance||($o.instance=new $o(e)),$o.instance}debug(e,t,o,r){this.log("debug",e,t,o,r)}info(e,t,o,r){this.log("info",e,t,o,r)}warn(e,t,o,r){this.log("warn",e,t,o,r)}error(e,t,o,r){this.log("error",e,t,o,r)}logComponent(e,t,o,r="debug"){this.log(r,"component",`${e}: ${t}`,o,e)}logStateUpdate(e,t,o,r){const i={statePath:e,prevValue:this.sanitizeValue(t),nextValue:this.sanitizeValue(o),hasChanged:!this.isValueEqual(t,o)};this.log("debug","state",`状态更新: ${e}`,i,r)}logEffect(e,t,o,r){const i={effectName:t,dependencies:o.map(e=>this.sanitizeValue(e)),dependencyCount:o.length,action:r};this.log("debug","effect",`${e} useEffect: ${t}`,i,e)}logRender(e,t,o,r){const i={renderCount:t,props:o?this.sanitizeValue(o):void 0,reason:r};this.log("debug","render",`${e} 渲染 #${t}`,i,e)}logPerformance(e,t,o){const r={operation:e,duration:t,...o},i=t>100?"warn":"debug";this.log(i,"performance",`${e} 耗时 ${t}ms`,r)}logInfiniteLoopDetection(e,t){const o=e?"error":"debug",r=e?`检测到潜在无限循环: ${t.componentName||"Unknown"}`:"无限循环检测通过";this.log(o,"infinite-loop",r,t,t.componentName)}getLogEntries(e,t,o,r){let i=[...this.logEntries];if(e&&(i=i.filter(t=>t.category===e)),t){const e=this.logLevelPriority[t];i=i.filter(t=>this.logLevelPriority[t.level]>=e)}return o&&(i=i.filter(e=>e.componentName===o)),r&&r>0&&(i=i.slice(-r)),i}clearLogs(){this.logEntries=[],this.options.enableConsoleOutput&&console.log("[DebugLogger] 日志已清除")}exportLogs(e,t){const o=this.getLogEntries(e,t),r=[];return r.push("=== Debug Logger 导出日志 ==="),r.push(`导出时间: ${(new Date).toISOString()}`),r.push(`总条目数: ${o.length}`),r.push(""),o.forEach((e,t)=>{const o=new Date(e.timestamp).toISOString(),i=e.componentName?` [${e.componentName}]`:"";r.push(`${t+1}. [${e.level.toUpperCase()}] ${o}${i}`),r.push(`   类别: ${e.category}`),r.push(`   消息: ${e.message}`),e.data&&r.push(`   数据: ${JSON.stringify(e.data,null,2)}`),e.stackTrace&&r.push(`   调用栈: ${e.stackTrace}`),r.push("")}),r.join("\n")}generateStats(){const e={totalEntries:this.logEntries.length,entriesByLevel:{debug:0,info:0,warn:0,error:0},entriesByCategory:{},entriesByComponent:{},recentErrors:[],performanceIssues:[]};return this.logEntries.forEach(t=>{e.entriesByLevel[t.level]++,e.entriesByCategory[t.category]=(e.entriesByCategory[t.category]||0)+1,t.componentName&&(e.entriesByComponent[t.componentName]=(e.entriesByComponent[t.componentName]||0)+1),"error"===t.level&&e.recentErrors.length<10&&e.recentErrors.push(t),"performance"===t.category&&t.data?.duration>100&&e.performanceIssues.push(t)}),e}setOptions(e){this.options={...this.options,...e}}log(e,t,o,r,i){if(this.logLevelPriority[e]<this.logLevelPriority[this.options.logLevel])return;if(this.options.categories.length>0&&!this.options.categories.includes(t))return;const n={timestamp:Date.now(),level:e,category:t,message:o,data:r?this.sanitizeValue(r):void 0,stackTrace:this.options.enableStackTrace?this.getStackTrace():void 0,componentName:this.options.enableComponentTracking?i:void 0};this.logEntries.push(n),this.logEntries.length>this.options.maxLogEntries&&(this.logEntries=this.logEntries.slice(-this.options.maxLogEntries)),this.options.enableConsoleOutput&&this.outputToConsole(n)}outputToConsole(e){const t=this.options.enableTimestamp?`[${new Date(e.timestamp).toISOString()}] `:"",o=e.componentName?` [${e.componentName}]`:"",r=`${t}[${e.category.toUpperCase()}]${o} ${e.message}`;switch(e.level){case"debug":console.debug(r,e.data||"");break;case"info":console.info(r,e.data||"");break;case"warn":console.warn(r,e.data||"");break;case"error":console.error(r,e.data||""),e.stackTrace&&console.error("调用栈:",e.stackTrace)}}sanitizeValue(e){if(null==e)return e;if("function"==typeof e)return"[Function]";if("object"==typeof e)try{return JSON.parse(JSON.stringify(e,null,0))}catch{return"[无法序列化的对象]"}return e}isValueEqual(e,t){if(e===t)return!0;if(null==e||null==t)return e===t;if(typeof e!=typeof t)return!1;if("object"==typeof e)try{return JSON.stringify(e)===JSON.stringify(t)}catch{return!1}return!1}getStackTrace(){try{throw new Error}catch(e){return e instanceof Error&&e.stack?e.stack.split("\n").slice(3,8).join("\n"):"无法获取调用栈"}}destroy(){this.clearLogs(),$o.instance=null}}$o.instance=null;const vo=$o.getInstance();class wo{constructor(e=yo,t=bo,o=vo){this.initManager=e,this.stateValidator=t,this.debugLogger=o,this.stateValidator.onWarning(e=>{this.debugLogger.warn("state-validation",`检测到可疑状态更新模式: ${e.type}`,e)})}static getInstance(){return wo.instance||(wo.instance=new wo),wo.instance}async initializeAppOnce(e){this.debugLogger.info("app","开始应用初始化...");try{await this.initManager.initializeOnce(e),this.debugLogger.info("app","应用初始化完成")}catch(e){throw this.debugLogger.error("app","应用初始化失败",e),e}}validateStateUpdate(e,t,o,r){return this.debugLogger.logStateUpdate(e,t,o,r),this.stateValidator.validateStateUpdate(e,t,o,r)}logComponentRender(e,t,o,r){this.debugLogger.logRender(e,t,o,r)}logEffectExecution(e,t,o,r){this.debugLogger.logEffect(e,t,o,r)}detectInfiniteLoop(){const e=this.stateValidator.detectInfiniteLoop();return this.debugLogger.logInfiniteLoopDetection(e,{updateCount:this.stateValidator.getUpdateHistory().length}),e}generateDiagnosticReport(){return{initialization:this.initManager.getStats(),stateValidation:this.stateValidator.generateReport(),logging:this.debugLogger.generateStats()}}clearAllHistory(){this.stateValidator.clearHistory(),this.debugLogger.clearLogs(),this.debugLogger.info("toolkit","所有历史数据已清除")}resetAll(){this.initManager.reset(),this.stateValidator.clearHistory(),this.debugLogger.clearLogs(),this.debugLogger.info("toolkit","所有工具已重置")}destroy(){this.initManager.destroy(),this.debugLogger.destroy(),wo.instance=null}}wo.instance=null;const jo=wo.getInstance(),ko=(0,uo.vt)()((0,xo.lt)((e,t)=>({version:"1.0.0",platform:"unknown",isInitialized:!1,isInitializing:!1,initializationError:null,currentPage:"editor",isFirstTime:!0,sidebarCollapsed:!1,toolbarCollapsed:!1,propertiesPanelCollapsed:!1,activeTool:"select",isLoading:!1,canvasZoom:1,canvasX:0,canvasY:0,showGrid:!0,showRulers:!0,elements:{},selectedElements:[],selectedElement:null,currentProject:null,hasUnsavedChanges:!1,initializeApp:async()=>{const o=t();jo.debugLogger.info("app-store","开始应用初始化",{isInitialized:o.isInitialized},"AppStore");try{e({isInitializing:!0,initializationError:null});const t=localStorage.getItem("g-asset-forge-used"),o=!t;jo.debugLogger.info("app-store",`首次使用检测: ${o}`,{hasUsedBefore:!!t},"AppStore"),console.log("GAF App initialized");const r={rect1:{id:"rect1",type:"rectangle",name:"矩形 1",x:100,y:100,width:200,height:100,fill:"#3b82f6",stroke:"#e5e7eb",strokeWidth:1,borderRadius:4,opacity:1,visible:!0,locked:!1},text1:{id:"text1",type:"text",name:"文本框",x:150,y:250,width:100,height:30,fill:"#1f2937",opacity:1,visible:!0,locked:!1,text:"Sample Text",fontSize:14,fontFamily:"Arial",fontWeight:400,textAlign:"left"}};e({elements:r,isFirstTime:o,isInitialized:!0,isInitializing:!1}),o&&localStorage.setItem("g-asset-forge-used","true"),jo.debugLogger.info("app-store","应用初始化完成",{elementsCount:Object.keys(r).length},"AppStore")}catch(t){const o=t instanceof Error?t.message:"未知错误";throw e({isInitializing:!1,initializationError:o}),jo.debugLogger.error("app-store","应用初始化失败",{error:o},"AppStore"),console.error("Failed to initialize app:",t),t}},initializeAppOnce:async()=>{const e=t();e.isInitialized?jo.debugLogger.info("app-store","应用已初始化，跳过重复初始化",{isInitialized:e.isInitialized},"AppStore"):await jo.initializeAppOnce(async()=>{await t().initializeApp()})},batchUpdate:o=>{const r=t(),i={};let n=!1;for(const[e,t]of Object.entries(o)){const o=r[e];jo.validateStateUpdate(`appStore.${e}`,o,t,"AppStore")&&(i[e]=t,n=!0)}n?(jo.debugLogger.debug("app-store","批量状态更新",{updatedKeys:Object.keys(i),totalUpdates:Object.keys(i).length},"AppStore"),e(i)):jo.debugLogger.debug("app-store","批量更新被跳过，没有有效的状态变化",{requestedKeys:Object.keys(o)},"AppStore")},setAppVersion:o=>{const r=t();jo.validateStateUpdate("appStore.version",r.version,o,"AppStore")&&e({version:o})},setPlatform:o=>{const r=t();jo.validateStateUpdate("appStore.platform",r.platform,o,"AppStore")&&e({platform:o})},setCurrentPage:o=>{const r=t();jo.validateStateUpdate("appStore.currentPage",r.currentPage,o,"AppStore")&&e({currentPage:o})},setFirstTime:o=>{const r=t();jo.validateStateUpdate("appStore.isFirstTime",r.isFirstTime,o,"AppStore")&&e({isFirstTime:o})},setSidebarCollapsed:o=>{const r=t();jo.validateStateUpdate("appStore.sidebarCollapsed",r.sidebarCollapsed,o,"AppStore")&&e({sidebarCollapsed:o})},setToolbarCollapsed:o=>{const r=t();jo.validateStateUpdate("appStore.toolbarCollapsed",r.toolbarCollapsed,o,"AppStore")&&e({toolbarCollapsed:o})},setPropertiesPanelCollapsed:o=>{const r=t();jo.validateStateUpdate("appStore.propertiesPanelCollapsed",r.propertiesPanelCollapsed,o,"AppStore")&&e({propertiesPanelCollapsed:o})},setActiveTool:o=>{const r=t();jo.validateStateUpdate("appStore.activeTool",r.activeTool,o,"AppStore")&&e({activeTool:o})},setLoading:o=>{const r=t();jo.validateStateUpdate("appStore.isLoading",r.isLoading,o,"AppStore")&&e({isLoading:o})},setCanvasZoom:o=>{const r=t(),i=Math.max(.1,Math.min(10,o));jo.validateStateUpdate("appStore.canvasZoom",r.canvasZoom,i,"AppStore")&&e({canvasZoom:i})},setCanvasPosition:(o,r)=>{const i=t(),n={x:o,y:r},s={x:i.canvasX,y:i.canvasY};jo.validateStateUpdate("appStore.canvasPosition",s,n,"AppStore")&&e({canvasX:o,canvasY:r})},setShowGrid:o=>{const r=t();jo.validateStateUpdate("appStore.showGrid",r.showGrid,o,"AppStore")&&e({showGrid:o})},setShowRulers:o=>{const r=t();jo.validateStateUpdate("appStore.showRulers",r.showRulers,o,"AppStore")&&e({showRulers:o})},addElement:o=>{const r=t(),i={...r.elements,[o.id]:o};jo.validateStateUpdate("appStore.elements",r.elements,i,"AppStore")&&(jo.debugLogger.info("app-store",`添加元素: ${o.id}`,{elementType:o.type,elementName:o.name},"AppStore"),e({elements:i,hasUnsavedChanges:!0}))},updateElement:(o,r)=>{const i=t(),n=i.elements[o];if(!n)return void jo.debugLogger.warn("app-store",`尝试更新不存在的元素: ${o}`,{updates:r},"AppStore");const s={...n,...r},a={...i.elements,[o]:s};jo.validateStateUpdate(`appStore.elements.${o}`,n,s,"AppStore")&&(jo.debugLogger.debug("app-store",`更新元素: ${o}`,{updatedKeys:Object.keys(r)},"AppStore"),e({elements:a,hasUnsavedChanges:!0}))},deleteElement:o=>{const r=t(),i=r.elements[o];if(!i)return void jo.debugLogger.warn("app-store",`尝试删除不存在的元素: ${o}`,{},"AppStore");const n={...r.elements};delete n[o];const s=r.selectedElements.filter(e=>e!==o),a=r.selectedElement?.id===o?null:r.selectedElement;jo.validateStateUpdate("appStore.elements",r.elements,n,"AppStore")&&(jo.debugLogger.info("app-store",`删除元素: ${o}`,{elementType:i.type,elementName:i.name},"AppStore"),e({elements:n,selectedElements:s,selectedElement:a,hasUnsavedChanges:!0}))},selectElements:o=>{const r=t(),{elements:i}=r,n=o.filter(e=>i[e]);if(n.length!==o.length){const e=o.filter(e=>!i[e]);jo.debugLogger.warn("app-store","尝试选择不存在的元素",{invalidIds:e},"AppStore")}const s=1===n.length&&n[0]&&i[n[0]]||null;jo.validateStateUpdate("appStore.selectedElements",r.selectedElements,n,"AppStore")&&(jo.debugLogger.debug("app-store","选择元素",{selectedCount:n.length,elementIds:n},"AppStore"),e({selectedElements:n,selectedElement:s}))},clearSelection:()=>{const o=t(),r=[];jo.validateStateUpdate("appStore.selectedElements",o.selectedElements,r,"AppStore")&&(jo.debugLogger.debug("app-store","清除选择",{previousCount:o.selectedElements.length},"AppStore"),e({selectedElements:r,selectedElement:null}))},setCurrentProject:o=>{const r=t();jo.validateStateUpdate("appStore.currentProject",r.currentProject,o,"AppStore")&&(jo.debugLogger.info("app-store","设置当前项目",{hasProject:!!o},"AppStore"),e({currentProject:o,hasUnsavedChanges:!1}))},setHasUnsavedChanges:o=>{const r=t();jo.validateStateUpdate("appStore.hasUnsavedChanges",r.hasUnsavedChanges,o,"AppStore")&&(jo.debugLogger.debug("app-store","设置未保存更改状态",{hasChanges:o},"AppStore"),e({hasUnsavedChanges:o}))}}),{name:"gaf-app-store"})),zo=s.Ay.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: ${({theme:e})=>e.colors.background};
`,Ao=s.Ay.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: ${({theme:e})=>e.colors.background};
  color: ${({theme:e})=>e.colors.text};
  font-size: 16px;
`,So=s.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: ${({theme:e})=>e.colors.background};
  color: ${({theme:e})=>e.colors.error||"#ff6b6b"};
  text-align: center;
  padding: 20px;

  h2 {
    margin-bottom: 16px;
    font-size: 24px;
  }

  p {
    margin-bottom: 16px;
    font-size: 14px;
    opacity: 0.8;
  }
`,Co=s.Ay.button`
  padding: 8px 16px;
  background: ${({theme:e})=>e.colors.primary||"#3b82f6"};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: translateY(1px);
  }
`,Lo=()=>{const{isFirstTime:e}=ko(),[t,o]=(0,i.useState)(!0),[n,s]=(0,i.useState)(!1),{setWelcomeMode:a,restoreNormalMode:l}=(()=>{const e=(0,i.useRef)(null),t=(0,i.useCallback)(async()=>{try{jo.debugLogger.debug("window-control","设置欢迎模式窗口",{},"useWindowControl");const t=await window.electronAPI.window.getSize();t.success&&t.data&&(e.current=t.data),await window.electronAPI.window.setSize(600,450,!0),await window.electronAPI.window.setResizable(!1),await window.electronAPI.window.center(),jo.debugLogger.info("window-control","窗口已设置为欢迎模式: 600x450, 固定大小",{width:600,height:450},"useWindowControl")}catch(e){jo.debugLogger.error("window-control","设置欢迎模式失败",{error:e instanceof Error?e.message:String(e)},"useWindowControl")}},[]),o=(0,i.useCallback)(async()=>{try{jo.debugLogger.debug("window-control","恢复正常模式窗口",{},"useWindowControl"),await window.electronAPI.window.setResizable(!0),e.current?await window.electronAPI.window.setSize(e.current.width,e.current.height,!0):await window.electronAPI.window.setSize(1200,800,!0),await window.electronAPI.window.center(),jo.debugLogger.info("window-control","窗口已恢复正常模式",{width:e.current?.width||1200,height:e.current?.height||800},"useWindowControl")}catch(e){jo.debugLogger.error("window-control","恢复正常模式失败",{error:e instanceof Error?e.message:String(e)},"useWindowControl")}},[]);return(0,i.useMemo)(()=>({setWelcomeMode:t,restoreNormalMode:o}),[t,o])})(),{isInitialized:d,isInitializing:c,initializationError:h,hasError:p,manualInit:g}=function(e={}){const{enableAutoInit:t=!0,onInitialized:o,onError:r}=e,{isInitialized:n,isInitializing:s,initializationError:a,initializeAppOnce:l}=ko(),[d,c]=(0,i.useState)(!1);return(0,i.useEffect)(()=>{!t||d||n||s||(async()=>{try{c(!0),jo.debugLogger.info("app-init","开始自动初始化应用",{enableAutoInit:t},"useAppInitialization"),await l(),o&&o(),jo.debugLogger.info("app-init","应用自动初始化完成",{},"useAppInitialization")}catch(e){const t=e instanceof Error?e:new Error(String(e));jo.debugLogger.error("app-init","应用自动初始化失败",{error:t.message},"useAppInitialization"),r&&r(t)}})()},[t,d,n,s,l,o,r]),{isInitialized:n,isInitializing:s,initializationError:a,hasAttemptedInit:d,manualInit:async()=>{if(n||s)jo.debugLogger.warn("app-init","尝试手动初始化已初始化的应用",{isInitialized:n,isInitializing:s},"useAppInitialization");else try{jo.debugLogger.info("app-init","开始手动初始化应用",{},"useAppInitialization"),await l(),o&&o()}catch(e){const t=e instanceof Error?e:new Error(String(e));throw jo.debugLogger.error("app-init","应用手动初始化失败",{error:t.message},"useAppInitialization"),r&&r(t),t}},resetInitialization:()=>{c(!1),jo.debugLogger.info("app-init","重置初始化状态",{},"useAppInitialization")},canInitialize:!n&&!s,hasError:!!a}}({enableAutoInit:!0,onInitialized:(0,i.useCallback)(()=>{jo.debugLogger.info("app-container","应用初始化完成",{isFirstTime:e},"AppContainer")},[e]),onError:(0,i.useCallback)(e=>{jo.debugLogger.error("app-container","应用初始化失败",{error:e.message},"AppContainer")},[])}),m=(0,i.useCallback)(()=>{jo.debugLogger.info("app-container","欢迎页面完成",{},"AppContainer"),o(!1),l()},[l]),u=(0,i.useCallback)(async()=>{try{jo.debugLogger.info("app-container","重试应用初始化",{},"AppContainer"),await g()}catch(e){jo.debugLogger.error("app-container","重试初始化失败",{error:e instanceof Error?e.message:String(e)},"AppContainer")}},[g]);(0,i.useEffect)(()=>{d&&e&&!n?(jo.debugLogger.debug("app-container","设置首次使用的欢迎模式",{isFirstTime:e,hasSetWelcomeMode:n},"AppContainer"),a(),s(!0),o(!0)):d&&!e&&(jo.debugLogger.debug("app-container","非首次使用，直接进入主界面",{isFirstTime:e},"AppContainer"),o(!1))},[d,e,n,a]);const x=(0,i.useMemo)(()=>p?"error":c?"loading":d?t&&e?"welcome":"main":"loading",[p,c,d,t,e]);return function(e,t,o){const{componentName:r,enableLogging:n=!0,logProps:s=!1,logReason:a=!0,maxRenderWarning:l=20}={componentName:"AppContainer",enableLogging:!1,logProps:!0,maxRenderWarning:15},d=(0,i.useRef)(0),c=(0,i.useRef)(t),h=(0,i.useRef)([]);d.current+=1;const p=d.current,g=Date.now();h.current.push(g),h.current.length>10&&(h.current=h.current.slice(-10));const m=h.current.length>1?g-(h.current[h.current.length-2]||0):0,u=JSON.stringify(t)!==JSON.stringify(c.current);c.current=t,(0,i.useEffect)(()=>{if(n){const e={renderCount:p,renderInterval:m,propsChanged:u};s&&t&&(e.props=t),a&&o&&(e.reason=o),jo.debugLogger.logRender(r,p,e,o)}p>l&&jo.debugLogger.warn("render-counter",`${r} 渲染次数过多: ${p}`,{renderCount:p,maxWarning:l,averageInterval:h.current.length>1?(g-(h.current[0]||0))/(h.current.length-1):0},r),m>0&&m<16&&jo.debugLogger.warn("render-counter",`${r} 渲染频率过高: ${m}ms`,{renderInterval:m,renderCount:p},r)}),h.current.length>1&&(h.current[0],h.current.length)}(0,{renderState:x,isInitialized:d,isFirstTime:e,showWelcome:t},`render state: ${x}`),(0,r.jsxs)(z,{children:[(0,r.jsx)(A,{}),(0,r.jsx)(zo,{children:(()=>{switch(x){case"error":return(0,r.jsxs)(So,{children:[(0,r.jsx)("h2",{children:"应用初始化失败"}),(0,r.jsx)("p",{children:h}),(0,r.jsx)(Co,{onClick:u,children:"重试"})]});case"loading":return(0,r.jsx)(Ao,{children:"正在初始化应用..."});case"welcome":return(0,r.jsx)(mo,{onComplete:m});case"main":return(0,r.jsx)(so,{});default:return(0,r.jsx)(Ao,{children:"加载中..."})}})()})]})},Io=()=>(0,r.jsx)(Lo,{});class Eo extends i.Component{constructor(e){super(e),this.state={hasError:!1}}static getDerivedStateFromError(e){return{hasError:!0,error:e}}componentDidCatch(e,t){console.error("ErrorBoundary caught an error:",e,t),this.setState({error:e,errorInfo:t})}render(){return this.state.hasError?(0,r.jsx)("div",{style:{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",background:"#fff",fontFamily:"system-ui, -apple-system, sans-serif"},children:(0,r.jsxs)("div",{style:{textAlign:"center",maxWidth:"600px"},children:[(0,r.jsx)("h1",{style:{color:"#d32f2f",marginBottom:"16px",fontSize:"24px"},children:"应用程序出现错误"}),(0,r.jsx)("p",{style:{color:"#666",marginBottom:"20px",fontSize:"16px"},children:this.state.error?.message||"未知错误"}),(0,r.jsxs)("div",{style:{marginBottom:"20px"},children:[(0,r.jsx)("button",{style:{background:"#1976d2",color:"white",border:"none",padding:"8px 16px",borderRadius:"4px",cursor:"pointer",marginRight:"8px"},onClick:()=>window.location.reload(),children:"重新加载"}),(0,r.jsx)("button",{style:{background:"transparent",color:"#1976d2",border:"1px solid #1976d2",padding:"8px 16px",borderRadius:"4px",cursor:"pointer"},onClick:()=>{console.log("Error details:",this.state.error),console.log("Error info:",this.state.errorInfo)},children:"查看详情"})]}),(0,r.jsxs)("details",{style:{textAlign:"left"},children:[(0,r.jsx)("summary",{style:{cursor:"pointer",marginBottom:"10px"},children:"错误堆栈"}),(0,r.jsx)("pre",{style:{background:"#f5f5f5",padding:"10px",borderRadius:"4px",fontSize:"12px",overflow:"auto",maxHeight:"200px",border:"1px solid #ddd"},children:this.state.error?.stack})]})]})}):this.props.children}}const Po=Eo;void 0===o(9840)&&(globalThis.global=globalThis||window);const Ho=()=>{const e=document.getElementById("loading-screen");e&&(e.style.opacity="0",e.style.transition="opacity 0.3s ease-out",setTimeout(()=>{e.remove()},300))},To=document.getElementById("root");if(!To)throw new Error("Root container not found");const Ro=(0,n.H)(To);try{Ro.render((0,r.jsx)(i.StrictMode,{children:(0,r.jsx)(Po,{children:(0,r.jsxs)(z,{children:[(0,r.jsx)(A,{}),(0,r.jsx)(Io,{onReady:Ho})]})})})),console.log("React app rendered successfully")}catch(e){console.error("Failed to render React app:",e),document.body.innerHTML='\n    <div style="height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui;">\n      <div style="text-align: center; color: #d32f2f;">\n        <h1>渲染失败</h1>\n        <p>React 应用无法启动</p>\n        <button onclick="location.reload()" style="padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px;">\n          重新加载\n        </button>\n      </div>\n    </div>\n  '}}},i={};function n(e){var t=i[e];if(void 0!==t)return t.exports;var o=i[e]={exports:{}};return r[e](o,o.exports,n),o.exports}n.m=r,e=[],n.O=(t,o,r,i)=>{if(!o){var s=1/0;for(c=0;c<e.length;c++){for(var[o,r,i]=e[c],a=!0,l=0;l<o.length;l++)(!1&i||s>=i)&&Object.keys(n.O).every(e=>n.O[e](o[l]))?o.splice(l--,1):(a=!1,i<s&&(s=i));if(a){e.splice(c--,1);var d=r();void 0!==d&&(t=d)}}return t}i=i||0;for(var c=e.length;c>0&&e[c-1][2]>i;c--)e[c]=e[c-1];e[c]=[o,r,i]},n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},o=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(e,r){if(1&r&&(e=this(e)),8&r)return e;if("object"==typeof e&&e){if(4&r&&e.__esModule)return e;if(16&r&&"function"==typeof e.then)return e}var i=Object.create(null);n.r(i);var s={};t=t||[null,o({}),o([]),o(o)];for(var a=2&r&&e;("object"==typeof a||"function"==typeof a)&&!~t.indexOf(a);a=o(a))Object.getOwnPropertyNames(a).forEach(t=>s[t]=()=>e[t]);return s.default=()=>e,n.d(i,s),i},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.j=792,(()=>{var e={792:0};n.O.j=t=>0===e[t];var t=(t,o)=>{var r,i,[s,a,l]=o,d=0;if(s.some(t=>0!==e[t])){for(r in a)n.o(a,r)&&(n.m[r]=a[r]);if(l)var c=l(n)}for(t&&t(o);d<s.length;d++)i=s[d],n.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return n.O(c)},o=global.webpackChunkg_asset_forge=global.webpackChunkg_asset_forge||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))})(),n.nc=void 0;var s=n.O(void 0,[96],()=>n(5828));s=n.O(s)})();
//# sourceMappingURL=main.5778d586efdb9260da34.js.map