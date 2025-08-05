(()=>{"use strict";var e,n,r,t,o,a={1564:(e,n,r)=>{r.d(n,{A:()=>s});var t=r(1601),o=r.n(t),a=r(6314),i=r.n(a)()(o());i.push([e.id,".canvas-toolbar {\n  display: flex;\n  align-items: center;\n  padding: 8px 16px;\n  background: #ffffff;\n  border-bottom: 1px solid #d9d9d9;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);\n  min-height: 48px;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n.canvas-toolbar .toolbar-section {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.canvas-toolbar .toolbar-section .section-label {\n  font-size: 12px;\n  color: #666;\n  font-weight: 500;\n  white-space: nowrap;\n}\n.canvas-toolbar .toolbar-section .zoom-controls {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.canvas-toolbar .toolbar-section .zoom-controls .ant-select .ant-select-selector {\n  border-radius: 4px;\n  font-size: 12px;\n}\n.canvas-toolbar .toolbar-section .zoom-controls .ant-slider {\n  margin: 0 !important;\n}\n.canvas-toolbar .toolbar-section .zoom-controls .ant-slider .ant-slider-rail {\n  background-color: #f0f0f0;\n}\n.canvas-toolbar .toolbar-section .zoom-controls .ant-slider .ant-slider-track {\n  background-color: #667eea;\n}\n.canvas-toolbar .toolbar-section .zoom-controls .ant-slider .ant-slider-handle {\n  border-color: #667eea;\n}\n.canvas-toolbar .toolbar-section .zoom-controls .ant-slider .ant-slider-handle:hover,\n.canvas-toolbar .toolbar-section .zoom-controls .ant-slider .ant-slider-handle:focus {\n  border-color: #5a6fd8;\n  box-shadow: 0 0 0 5px rgba(102, 126, 234, 0.12);\n}\n.canvas-toolbar .toolbar-section .canvas-size {\n  font-size: 12px;\n  color: #666;\n  font-family: 'Courier New', monospace;\n  background: #f5f5f5;\n  padding: 2px 6px;\n  border-radius: 3px;\n  white-space: nowrap;\n}\n.canvas-toolbar .toolbar-section .performance-metric {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 12px;\n  padding: 2px 6px;\n  border-radius: 3px;\n  font-family: 'Courier New', monospace;\n  white-space: nowrap;\n}\n.canvas-toolbar .toolbar-section .performance-metric.fps.success {\n  color: #52c41a;\n  background: rgba(82, 196, 26, 0.1);\n}\n.canvas-toolbar .toolbar-section .performance-metric.fps.warning {\n  color: #faad14;\n  background: rgba(250, 173, 20, 0.1);\n}\n.canvas-toolbar .toolbar-section .performance-metric.fps.error {\n  color: #ff4d4f;\n  background: rgba(255, 77, 79, 0.1);\n}\n.canvas-toolbar .toolbar-section .performance-metric.memory.success {\n  color: #52c41a;\n  background: rgba(82, 196, 26, 0.1);\n}\n.canvas-toolbar .toolbar-section .performance-metric.memory.warning {\n  color: #faad14;\n  background: rgba(250, 173, 20, 0.1);\n}\n.canvas-toolbar .toolbar-section .performance-metric.memory.error {\n  color: #ff4d4f;\n  background: rgba(255, 77, 79, 0.1);\n}\n.canvas-toolbar .toolbar-section .performance-metric.objects {\n  color: #666;\n  background: #f5f5f5;\n}\n.canvas-toolbar .toolbar-section .performance-metric .anticon {\n  font-size: 10px;\n}\n.canvas-toolbar .ant-divider-vertical {\n  height: 24px;\n  margin: 0 8px;\n  border-color: #e8e8e8;\n}\n.canvas-toolbar .ant-btn {\n  border-radius: 4px;\n}\n.canvas-toolbar .ant-btn:hover {\n  border-color: #667eea;\n  color: #667eea;\n}\n.canvas-toolbar .ant-btn:focus {\n  border-color: #667eea;\n  color: #667eea;\n}\n.canvas-toolbar .ant-btn.ant-btn-primary {\n  background-color: #667eea;\n  border-color: #667eea;\n}\n.canvas-toolbar .ant-btn.ant-btn-primary:hover {\n  background-color: #5a6fd8;\n  border-color: #5a6fd8;\n}\n.canvas-toolbar .ant-select .ant-select-selector {\n  border-radius: 4px;\n}\n.canvas-toolbar .ant-select .ant-select-selector:hover {\n  border-color: #667eea;\n}\n.canvas-toolbar .ant-select.ant-select-focused .ant-select-selector {\n  border-color: #667eea;\n  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);\n}\n@media (max-width: 1200px) {\n  .canvas-toolbar .toolbar-section .zoom-controls .ant-slider {\n    width: 80px;\n  }\n}\n@media (max-width: 768px) {\n  .canvas-toolbar {\n    flex-direction: column;\n    align-items: flex-start;\n    padding: 12px 16px;\n    gap: 12px;\n  }\n  .canvas-toolbar .toolbar-section {\n    width: 100%;\n    justify-content: space-between;\n  }\n  .canvas-toolbar .toolbar-section .section-label {\n    min-width: 60px;\n  }\n  .canvas-toolbar .toolbar-section .zoom-controls {\n    flex: 1;\n    justify-content: flex-end;\n  }\n  .canvas-toolbar .toolbar-section .zoom-controls .ant-slider {\n    width: 100px;\n  }\n  .canvas-toolbar .ant-divider-vertical {\n    display: none;\n  }\n}\n@media (prefers-contrast: high) {\n  .canvas-toolbar {\n    border-bottom-color: #000;\n  }\n  .canvas-toolbar .performance-metric {\n    border: 1px solid currentColor;\n  }\n}\n.dark-theme .canvas-toolbar {\n  background: #1f1f1f;\n  border-bottom-color: #404040;\n  color: #fff;\n}\n.dark-theme .canvas-toolbar .section-label {\n  color: #ccc;\n}\n.dark-theme .canvas-toolbar .canvas-size {\n  background: #333;\n  color: #ccc;\n}\n.dark-theme .canvas-toolbar .performance-metric.objects {\n  background: #333;\n  color: #ccc;\n}\n",""]);const s=i},2675:(e,n,r)=>{r.d(n,{L:()=>o,E:()=>a});class t{constructor(){this.events=new Map}on(e,n){return this.events.has(e)||this.events.set(e,[]),this.events.get(e).push(n),this}once(e,n){const r=(...t)=>{this.removeListener(e,r),n(...t)};return this.on(e,r)}emit(e,...n){const r=this.events.get(e);return!(!r||0===r.length||(r.forEach(r=>{try{r(...n)}catch(n){console.error(`Error in event listener for "${String(e)}":`,n)}}),0))}removeListener(e,n){const r=this.events.get(e);if(r){const e=r.indexOf(n);-1!==e&&r.splice(e,1)}return this}off(e,n){return this.removeListener(e,n)}removeAllListeners(e){return e?this.events.delete(e):this.events.clear(),this}listenerCount(e){const n=this.events.get(e);return n?n.length:0}eventNames(){return Array.from(this.events.keys())}listeners(e){const n=this.events.get(e);return n?[...n]:[]}}var o;!function(e){e.SUIKA="suika",e.H5_EDITOR="h5-editor",e.FABRIC="fabric"}(o||(o={}));class a extends t{constructor(){super(),this.currentEngine=null,this.container=null,this.config=null}async switchEngine(e,n,r){this.currentEngine&&this.currentEngine.destroy();const t=await this.loadEngine(e);await t.initialize(n,r),this.currentEngine=t,this.container=n,this.config=r,this.emit("engineSwitched",{type:e})}async loadEngine(e){switch(e){case o.SUIKA:const{SuikaCanvasEngine:n}=await r.e(746).then(r.bind(r,5746));return new n;case o.H5_EDITOR:const{H5EditorCanvasEngine:t}=await r.e(553).then(r.bind(r,6553));return new t;case o.FABRIC:throw new Error("Fabric.js engine is temporarily disabled");default:throw new Error(`Unsupported canvas engine: ${e}`)}}getCurrentEngine(){return this.currentEngine}getEngineType(){return this.currentEngine?.type||null}getState(){return this.currentEngine?.getState()||null}setState(e){this.currentEngine?.setState(e)}addObject(e){this.currentEngine?.addObject(e)}removeObject(e){this.currentEngine?.removeObject(e)}updateObject(e,n){this.currentEngine?.updateObject(e,n)}selectObjects(e){this.currentEngine?.selectObjects(e)}clearSelection(){this.currentEngine?.clearSelection()}zoom(e){this.currentEngine?.zoom(e)}pan(e,n){this.currentEngine?.pan(e,n)}render(){this.currentEngine?.render()}exportImage(e="png",n=1){return this.currentEngine?.exportImage(e,n)||null}destroy(){this.currentEngine&&(this.currentEngine.destroy(),this.currentEngine=null),this.container=null,this.config=null}}},5004:(e,n,r)=>{r.d(n,{A:()=>s});var t=r(1601),o=r.n(t),a=r(6314),i=r.n(a)()(o());i.push([e.id,".canvas-container {\n  width: 100%;\n  height: 100%;\n  position: relative;\n  background: #f5f5f5;\n  border: 1px solid #d9d9d9;\n  border-radius: 6px;\n  overflow: hidden;\n}\n.canvas-container.loading {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  background: #f5f5f5;\n}\n.canvas-container.error {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  background: #fff2f0;\n}\n.canvas-container .canvas-wrapper {\n  width: 100%;\n  height: 100%;\n  position: relative;\n  overflow: hidden;\n}\n.canvas-container .canvas-wrapper canvas {\n  display: block;\n  border: none;\n  outline: none;\n}\n.canvas-container .canvas-loading {\n  text-align: center;\n  color: #666;\n}\n.canvas-container .canvas-loading .loading-spinner {\n  width: 40px;\n  height: 40px;\n  border: 3px solid #f3f3f3;\n  border-top: 3px solid #667eea;\n  border-radius: 50%;\n  animation: spin 1s linear infinite;\n  margin: 0 auto 16px;\n}\n.canvas-container .canvas-loading p {\n  margin: 0;\n  font-size: 14px;\n}\n.canvas-container .canvas-error {\n  text-align: center;\n  color: #ff4d4f;\n}\n.canvas-container .canvas-error h3 {\n  color: #ff4d4f;\n  margin-bottom: 8px;\n}\n.canvas-container .canvas-error p {\n  color: #666;\n  margin-bottom: 16px;\n}\n.canvas-container .canvas-error .retry-button {\n  background: #667eea;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n}\n.canvas-container .canvas-error .retry-button:hover {\n  background: #5a6fd8;\n}\n.canvas-container .canvas-performance-info {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  background: rgba(0, 0, 0, 0.7);\n  color: white;\n  padding: 8px 12px;\n  border-radius: 4px;\n  font-size: 12px;\n  font-family: 'Courier New', monospace;\n  display: flex;\n  gap: 16px;\n  z-index: 1000;\n}\n.canvas-container .canvas-performance-info .performance-item {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.canvas-container .canvas-performance-info .performance-item .label {\n  opacity: 0.8;\n}\n.canvas-container .canvas-performance-info .performance-item .value {\n  font-weight: bold;\n}\n.canvas-container .canvas-performance-info .performance-item .value.good {\n  color: #52c41a;\n}\n.canvas-container .canvas-performance-info .performance-item .value.caution {\n  color: #faad14;\n}\n.canvas-container .canvas-performance-info .performance-item .value.warning {\n  color: #ff4d4f;\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n@media (max-width: 768px) {\n  .canvas-container .canvas-performance-info {\n    position: static;\n    margin-bottom: 8px;\n    background: rgba(0, 0, 0, 0.05);\n    color: #666;\n    justify-content: center;\n  }\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .canvas-container .canvas-wrapper canvas {\n    image-rendering: -webkit-optimize-contrast;\n    image-rendering: crisp-edges;\n    image-rendering: pixelated;\n  }\n}\n",""]);const s=i},5878:(e,n,r)=>{var t=r(4848),o=r(6540),a=r(5338),i=r(2770),s=r(5448),c=r(1621),l=r(7134);(0,c.vt)()((0,l.lt)(e=>({version:"1.0.0",platform:"unknown",sidebarCollapsed:!1,currentTool:null,isLoading:!1,currentProject:null,hasUnsavedChanges:!1,initializeApp:async()=>{e({isLoading:!0});try{console.log("App initialized")}catch(e){throw console.error("Failed to initialize app:",e),e}finally{e({isLoading:!1})}},setAppVersion:n=>e({version:n}),setPlatform:n=>e({platform:n}),setSidebarCollapsed:n=>e({sidebarCollapsed:n}),setCurrentTool:n=>e({currentTool:n}),setLoading:n=>e({isLoading:n}),setCurrentProject:n=>{e({currentProject:n,hasUnsavedChanges:!1})},setHasUnsavedChanges:n=>e({hasUnsavedChanges:n})}),{name:"app-store"}));const d={MOBILE_PORTRAIT:{width:1080,height:1920,name:"手机竖屏 (1080x1920)"},MOBILE_LANDSCAPE:{width:1920,height:1080,name:"手机横屏 (1920x1080)"},TABLET_PORTRAIT:{width:768,height:1024,name:"平板竖屏 (768x1024)"},TABLET_LANDSCAPE:{width:1024,height:768,name:"平板横屏 (1024x768)"},DESKTOP:{width:1920,height:1080,name:"桌面 (1920x1080)"},SQUARE:{width:1080,height:1080,name:"正方形 (1080x1080)"},HD:{width:1280,height:720,name:"HD (1280x720)"},ICON_SMALL:{width:64,height:64,name:"小图标 (64x64)"},ICON_MEDIUM:{width:128,height:128,name:"中图标 (128x128)"},ICON_LARGE:{width:256,height:256,name:"大图标 (256x256)"}};(0,c.vt)()((0,l.lt)((e,n)=>({canvas:null,canvasContainer:null,width:1920,height:1080,zoom:1,backgroundColor:"#ffffff",panX:0,panY:0,fps:60,memoryUsage:0,objectCount:0,presets:d,initializeCanvas:async()=>{try{console.log("Canvas store initialized successfully"),e({fps:60,memoryUsage:0,objectCount:0,zoom:1,panX:0,panY:0})}catch(e){console.error("Failed to initialize canvas store:",e)}},setCanvas:n=>{e({canvas:n})},setCanvasContainer:n=>{e({canvasContainer:n})},setCanvasSize:(r,t)=>{const{canvas:o}=n();o&&(o.setDimensions({width:r,height:t}),o.renderAll()),e({width:r,height:t})},setZoom:r=>{const{canvas:t}=n(),o=Math.max(.1,Math.min(5,r));t&&(t.setZoom(o),t.renderAll()),e({zoom:o})},setBackgroundColor:r=>{const{canvas:t}=n();t&&t.setBackgroundColor(r,()=>{t.renderAll()}),e({backgroundColor:r})},setPan:(r,t)=>{const{canvas:o}=n();o&&(o.relativePan(new any(r-n().panX,t-n().panY)),o.renderAll()),e({panX:r,panY:t})},fitToScreen:()=>{const{canvas:r,canvasContainer:t,width:o,height:a}=n();if(!r||!t)return;const i=t.getBoundingClientRect(),s=(i.width-40)/o,c=(i.height-40)/a,l=Math.min(s,c,1);r.setZoom(l),r.absolutePan(new any((i.width-o*l)/2,(i.height-a*l)/2)),r.renderAll(),e({zoom:l,panX:0,panY:0})},resetView:()=>{const{canvas:r}=n();r&&(r.setZoom(1),r.absolutePan(new any(0,0)),r.renderAll()),e({zoom:1,panX:0,panY:0})},updatePerformanceMetrics:(n,r,t=0)=>{e({fps:n,memoryUsage:r,objectCount:t})},destroyCanvas:()=>{const{canvas:r}=n();r&&r.dispose(),e({canvas:null,canvasContainer:null,panX:0,panY:0,zoom:1})},applyPreset:e=>{const r=d[e];r&&n().setCanvasSize(r.width,r.height)},getPresetList:()=>Object.entries(d).map(([e,n])=>({key:e,name:n.name,width:n.width,height:n.height}))}),{name:"canvas-store"}));var h=r(6075),p=r(9904);r(2702),r(6552),r(6157),r(1201),r(5813),r(278),r(3903),r(1952);const{Header:m}=s.A,{Text:g}=h.A;r(6921),r(5031),r(3350),r(5824),r(1372),r(778),r(1417),r(8170),r(8602);const{Sider:f}=s.A;r(3532),r(7260),r(581);var u=r(5072),b=r.n(u),x=r(7825),y=r.n(x),v=r(7659),$=r.n(v),w=r(5056),k=r.n(w),A=r(540),j=r.n(A),z=r(1113),S=r.n(z),C=r(5004),E={};E.styleTagTransform=S(),E.setAttributes=k(),E.insert=$().bind(null,"head"),E.domAPI=y(),E.insertStyleElement=j(),b()(C.A,E),C.A&&C.A.locals&&C.A.locals;var O=r(5391),H=(r(6211),r(6531),r(7826),r(9445),r(763),r(234),r(88),r(1564)),I={};I.styleTagTransform=S(),I.setAttributes=k(),I.insert=$().bind(null,"head"),I.domAPI=y(),I.insertStyleElement=j(),b()(H.A,I),H.A&&H.A.locals&&H.A.locals;const{Option:T}=O.A;r(5614),r(9766),r(126),r(4e3);const{Option:P}=O.A,{Text:M}=h.A,{Title:R}=h.A,{Content:L,Sider:_}=s.A;r(7983);const{Footer:F}=s.A,{Text:B}=h.A,{Content:N}=s.A;var U=r(1250);const Y={colors:{primary:"#667eea",secondary:"#764ba2",accent:"#f093fb",success:"#10b981",warning:"#f59e0b",error:"#ef4444",info:"#3b82f6",background:"#ffffff",surface:"#f8fafc",overlay:"rgba(0, 0, 0, 0.5)",text:{primary:"#1e293b",secondary:"#64748b",disabled:"#94a3b8",inverse:"#ffffff"},border:{default:"#e2e8f0",focus:"#667eea",hover:"#cbd5e1"},shadow:{small:"0 1px 2px 0 rgba(0, 0, 0, 0.05)",medium:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",large:"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"}},typography:{fontFamily:{primary:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',mono:'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'},fontSize:{xs:"0.75rem",sm:"0.875rem",base:"1rem",lg:"1.125rem",xl:"1.25rem","2xl":"1.5rem","3xl":"1.875rem"},fontWeight:{normal:400,medium:500,semibold:600,bold:700},lineHeight:{tight:1.25,normal:1.5,relaxed:1.75}},spacing:{xs:"0.25rem",sm:"0.5rem",md:"1rem",lg:"1.5rem",xl:"2rem","2xl":"3rem","3xl":"4rem"},borderRadius:{none:"0",sm:"0.25rem",md:"0.375rem",lg:"0.5rem",full:"9999px"},zIndex:{dropdown:1e3,modal:1050,popover:1030,tooltip:1070},animation:{duration:{fast:"150ms",normal:"300ms",slow:"500ms"},easing:{ease:"cubic-bezier(0.4, 0, 0.2, 1)",easeIn:"cubic-bezier(0.4, 0, 1, 1)",easeOut:"cubic-bezier(0, 0, 0.2, 1)",easeInOut:"cubic-bezier(0.4, 0, 0.2, 1)"}}},D={...Y,colors:{...Y.colors,background:"#0f172a",surface:"#1e293b",overlay:"rgba(0, 0, 0, 0.8)",text:{primary:"#f1f5f9",secondary:"#cbd5e1",disabled:"#64748b",inverse:"#1e293b"},border:{default:"#334155",focus:"#667eea",hover:"#475569"},shadow:{small:"0 1px 2px 0 rgba(0, 0, 0, 0.3)",medium:"0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",large:"0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"}}},W=(0,o.createContext)(void 0),X=({children:e,defaultMode:n="light"})=>{const[r,a]=(0,o.useState)(()=>"undefined"!=typeof window&&localStorage.getItem("theme-mode")||n),i="light"===r?Y:D;(0,o.useEffect)(()=>{"undefined"!=typeof window&&localStorage.setItem("theme-mode",r)},[r]),(0,o.useEffect)(()=>{if("undefined"!=typeof document){const e=document.documentElement;e.style.setProperty("--color-primary",i.colors.primary),e.style.setProperty("--color-background",i.colors.background),e.style.setProperty("--color-surface",i.colors.surface),e.style.setProperty("--color-text-primary",i.colors.text.primary),e.style.setProperty("--color-text-secondary",i.colors.text.secondary),e.style.setProperty("--color-border-default",i.colors.border.default),document.body.style.backgroundColor=i.colors.background,document.body.style.color=i.colors.text.primary}},[i]);const s={theme:i,mode:r,toggleTheme:()=>{a(e=>"light"===e?"dark":"light")},setTheme:e=>{a(e)}};return(0,t.jsx)(W.Provider,{value:s,children:(0,t.jsx)(U.NP,{theme:i,children:e})})},Z=U.DU`
  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${({theme:e})=>e.typography.fontFamily.primary};
    font-size: ${({theme:e})=>e.typography.fontSize.base};
    font-weight: ${({theme:e})=>e.typography.fontWeight.normal};
    line-height: ${({theme:e})=>e.typography.lineHeight.normal};
    color: ${({theme:e})=>e.colors.text.primary};
    background-color: ${({theme:e})=>e.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({theme:e})=>e.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({theme:e})=>e.colors.border.default};
    border-radius: ${({theme:e})=>e.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({theme:e})=>e.colors.border.hover};
  }

  /* 选择文本样式 */
  ::selection {
    background: ${({theme:e})=>e.colors.primary}30;
    color: ${({theme:e})=>e.colors.text.primary};
  }

  /* 焦点样式重置 */
  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
  }

  /* 链接样式 */
  a {
    color: ${({theme:e})=>e.colors.primary};
    text-decoration: none;
    transition: color ${({theme:e})=>e.animation.duration.fast} ${({theme:e})=>e.animation.easing.ease};
  }

  a:hover {
    color: ${({theme:e})=>e.colors.primary}dd;
  }

  /* 标题样式 */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${({theme:e})=>e.typography.fontWeight.semibold};
    line-height: ${({theme:e})=>e.typography.lineHeight.tight};
    color: ${({theme:e})=>e.colors.text.primary};
  }

  h1 {
    font-size: ${({theme:e})=>e.typography.fontSize["3xl"]};
  }

  h2 {
    font-size: ${({theme:e})=>e.typography.fontSize["2xl"]};
  }

  h3 {
    font-size: ${({theme:e})=>e.typography.fontSize.xl};
  }

  h4 {
    font-size: ${({theme:e})=>e.typography.fontSize.lg};
  }

  h5 {
    font-size: ${({theme:e})=>e.typography.fontSize.base};
  }

  h6 {
    font-size: ${({theme:e})=>e.typography.fontSize.sm};
  }

  /* 段落样式 */
  p {
    margin: 0;
    color: ${({theme:e})=>e.colors.text.primary};
  }

  /* 列表样式 */
  ul, ol {
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
  }

  /* 表单元素样式重置 */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* 按钮样式重置 */
  button {
    font-family: inherit;
    font-size: inherit;
    border: none;
    background: none;
    cursor: pointer;
  }

  /* 图片样式 */
  img {
    max-width: 100%;
    height: auto;
  }

  /* 代码样式 */
  code, pre {
    font-family: ${({theme:e})=>e.typography.fontFamily.mono};
    font-size: ${({theme:e})=>e.typography.fontSize.sm};
  }

  code {
    padding: 2px 4px;
    background: ${({theme:e})=>e.colors.surface};
    border-radius: ${({theme:e})=>e.borderRadius.sm};
    color: ${({theme:e})=>e.colors.text.primary};
  }

  pre {
    padding: ${({theme:e})=>e.spacing.md};
    background: ${({theme:e})=>e.colors.surface};
    border-radius: ${({theme:e})=>e.borderRadius.md};
    overflow-x: auto;
    color: ${({theme:e})=>e.colors.text.primary};
  }

  /* 分割线样式 */
  hr {
    border: none;
    height: 1px;
    background: ${({theme:e})=>e.colors.border.default};
    margin: ${({theme:e})=>e.spacing.lg} 0;
  }

  /* 表格样式 */
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: ${({theme:e})=>e.spacing.sm};
    text-align: left;
    border-bottom: 1px solid ${({theme:e})=>e.colors.border.default};
  }

  th {
    font-weight: ${({theme:e})=>e.typography.fontWeight.semibold};
    color: ${({theme:e})=>e.colors.text.primary};
    background: ${({theme:e})=>e.colors.surface};
  }

  /* 工具提示动画 */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-10px);
      opacity: 0;
    }
  }

  /* 禁用用户选择的工具类 */
  .no-select {
    user-select: none;
  }

  /* 可拖拽元素样式 */
  .draggable {
    cursor: grab;
  }

  .draggable:active {
    cursor: grabbing;
  }

  /* 加载状态样式 */
  .loading {
    pointer-events: none;
    opacity: 0.6;
  }
`;var K=r(7643);const G=(0,U.Ay)(K.P.div)`
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
  
  ${({$variant:e})=>(e=>{switch(e){case"primary":return U.AH`
        background: ${({theme:e})=>e.colors.primary};
        color: ${({theme:e})=>e.colors.text.inverse};
        border: 1px solid ${({theme:e})=>e.colors.primary};
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.primary}dd;
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;case"secondary":return U.AH`
        background: ${({theme:e})=>e.colors.surface};
        color: ${({theme:e})=>e.colors.text.primary};
        border: 1px solid ${({theme:e})=>e.colors.border.default};
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.border.hover};
          border-color: ${({theme:e})=>e.colors.border.hover};
        }
      `;case"outline":return U.AH`
        background: transparent;
        color: ${({theme:e})=>e.colors.primary};
        border: 1px solid ${({theme:e})=>e.colors.primary};
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.primary}10;
        }
      `;case"ghost":return U.AH`
        background: transparent;
        color: ${({theme:e})=>e.colors.text.primary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.surface};
        }
      `;case"danger":return U.AH`
        background: ${({theme:e})=>e.colors.error};
        color: ${({theme:e})=>e.colors.text.inverse};
        border: 1px solid ${({theme:e})=>e.colors.error};
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.error}dd;
        }
      `;default:return U.AH``}})(e)}
  ${({$size:e})=>(e=>{switch(e){case"sm":return U.AH`
        height: 32px;
        padding: 0 ${({theme:e})=>e.spacing.sm};
        font-size: ${({theme:e})=>e.typography.fontSize.sm};
      `;case"md":return U.AH`
        height: 40px;
        padding: 0 ${({theme:e})=>e.spacing.md};
        font-size: ${({theme:e})=>e.typography.fontSize.base};
      `;case"lg":return U.AH`
        height: 48px;
        padding: 0 ${({theme:e})=>e.spacing.lg};
        font-size: ${({theme:e})=>e.typography.fontSize.lg};
      `;default:return U.AH``}})(e)}
  
  ${({$fullWidth:e})=>e&&U.AH`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${({theme:e})=>e.colors.border.focus};
    outline-offset: 2px;
  }
`,q=U.Ay.div`
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
`,V=U.Ay.span`
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({$position:e})=>"right"===e&&U.AH`
    order: 1;
  `}
`,Q=({variant:e="primary",size:n="md",loading:r=!1,icon:o,iconPosition:a="left",fullWidth:i=!1,disabled:s,children:c,...l})=>(0,t.jsxs)(G,{as:"button",$variant:e,$size:n,$fullWidth:i,disabled:s||r,whileTap:{scale:s||r?1:.98},...l,children:[r&&(0,t.jsx)(q,{}),!r&&o&&(0,t.jsx)(V,{$position:a,children:o}),c]}),J=U.Ay.div`
  display: flex;
  flex-direction: column;
  gap: ${({theme:e})=>e.spacing.xs};
  
  ${({$fullWidth:e})=>e&&U.AH`
    width: 100%;
  `}
`,ee=U.Ay.label`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  font-weight: ${({theme:e})=>e.typography.fontWeight.medium};
  color: ${({theme:e})=>e.colors.text.primary};
`,ne=U.Ay.div`
  position: relative;
  display: flex;
  align-items: center;
`,re=U.Ay.input`
  width: 100%;
  border-radius: ${({theme:e})=>e.borderRadius.md};
  font-family: ${({theme:e})=>e.typography.fontFamily.primary};
  color: ${({theme:e})=>e.colors.text.primary};
  transition: all ${({theme:e})=>e.animation.duration.fast} ${({theme:e})=>e.animation.easing.ease};
  
  ${({$size:e})=>(e=>{switch(e){case"sm":return U.AH`
        height: 32px;
        padding: 0 ${({theme:e})=>e.spacing.sm};
        font-size: ${({theme:e})=>e.typography.fontSize.sm};
      `;case"md":return U.AH`
        height: 40px;
        padding: 0 ${({theme:e})=>e.spacing.md};
        font-size: ${({theme:e})=>e.typography.fontSize.base};
      `;case"lg":return U.AH`
        height: 48px;
        padding: 0 ${({theme:e})=>e.spacing.lg};
        font-size: ${({theme:e})=>e.typography.fontSize.lg};
      `;default:return U.AH``}})(e)}
  ${({$variant:e})=>"filled"===e?U.AH`
        background: ${({theme:e})=>e.colors.surface};
        border: 1px solid transparent;
        
        &:focus {
          background: ${({theme:e})=>e.colors.background};
          border-color: ${({theme:e})=>e.colors.border.focus};
        }
      `:U.AH`
        background: ${({theme:e})=>e.colors.background};
        border: 1px solid ${({theme:e})=>e.colors.border.default};
        
        &:hover:not(:disabled) {
          border-color: ${({theme:e})=>e.colors.border.hover};
        }
        
        &:focus {
          border-color: ${({theme:e})=>e.colors.border.focus};
        }
      `}
  
  ${({$hasLeftIcon:e,theme:n})=>e&&U.AH`
    padding-left: calc(${n.spacing.lg} + 20px);
  `}
  
  ${({$hasRightIcon:e,theme:n})=>e&&U.AH`
    padding-right: calc(${n.spacing.lg} + 20px);
  `}
  
  ${({$error:e,theme:n})=>e&&U.AH`
    border-color: ${n.colors.error};
    
    &:focus {
      border-color: ${n.colors.error};
      box-shadow: 0 0 0 3px ${n.colors.error}20;
    }
  `}
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({theme:e})=>e.colors.border.focus}20;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({theme:e})=>e.colors.surface};
  }
  
  &::placeholder {
    color: ${({theme:e})=>e.colors.text.disabled};
  }
`,te=U.Ay.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({theme:e})=>e.colors.text.secondary};
  pointer-events: none;
  
  ${({$position:e,theme:n})=>"left"===e?U.AH`
    left: ${n.spacing.md};
  `:U.AH`
    right: ${n.spacing.md};
  `}
`,oe=U.Ay.div`
  font-size: ${({theme:e})=>e.typography.fontSize.xs};
  color: ${({$error:e,theme:n})=>e?n.colors.error:n.colors.text.secondary};
`,ae=((0,o.forwardRef)(({size:e="md",variant:n="default",error:r=!1,helperText:o,label:a,leftIcon:i,rightIcon:s,fullWidth:c=!1,...l},d)=>(0,t.jsxs)(J,{$fullWidth:c,children:[a&&(0,t.jsx)(ee,{children:a}),(0,t.jsxs)(ne,{children:[i&&(0,t.jsx)(te,{$position:"left",children:i}),(0,t.jsx)(re,{ref:d,$size:e,$variant:n,$error:r,$hasLeftIcon:!!i,$hasRightIcon:!!s,...l}),s&&(0,t.jsx)(te,{$position:"right",children:s})]}),o&&(0,t.jsx)(oe,{$error:r,children:o})]})),(0,U.Ay)(K.P.div)`
  border-radius: ${({theme:e})=>e.borderRadius.lg};
  transition: all ${({theme:e})=>e.animation.duration.normal} ${({theme:e})=>e.animation.easing.ease};
  
  ${({$variant:e})=>(e=>{switch(e){case"outlined":return U.AH`
        background: ${({theme:e})=>e.colors.background};
        border: 1px solid ${({theme:e})=>e.colors.border.default};
        box-shadow: none;
      `;case"elevated":return U.AH`
        background: ${({theme:e})=>e.colors.background};
        border: none;
        box-shadow: ${({theme:e})=>e.colors.shadow.large};
      `;default:return U.AH`
        background: ${({theme:e})=>e.colors.surface};
        border: 1px solid ${({theme:e})=>e.colors.border.default};
        box-shadow: ${({theme:e})=>e.colors.shadow.small};
      `}})(e)}
  ${({$padding:e})=>(e=>{switch(e){case"none":return U.AH`
        padding: 0;
      `;case"sm":return U.AH`
        padding: ${({theme:e})=>e.spacing.sm};
      `;case"md":default:return U.AH`
        padding: ${({theme:e})=>e.spacing.md};
      `;case"lg":return U.AH`
        padding: ${({theme:e})=>e.spacing.lg};
      `}})(e)}
  
  ${({$hoverable:e,theme:n})=>e&&U.AH`
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${n.colors.shadow.large};
    }
  `}
  
  ${({$clickable:e})=>e&&U.AH`
    cursor: pointer;
    user-select: none;
    
    &:active {
      transform: translateY(0);
    }
  `}
`),ie=({variant:e="default",padding:n="md",hoverable:r=!1,clickable:o=!1,children:a,className:i,onClick:s})=>(0,t.jsx)(ae,{$variant:e,$padding:n,$hoverable:r,$clickable:o,className:i,onClick:s,whileTap:o?{scale:.98}:void 0,children:a}),se=U.Ay.div`
  margin-bottom: ${({theme:e})=>e.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`,ce=U.Ay.h3`
  margin: 0;
  font-size: ${({theme:e})=>e.typography.fontSize.lg};
  font-weight: ${({theme:e})=>e.typography.fontWeight.semibold};
  color: ${({theme:e})=>e.colors.text.primary};
  line-height: ${({theme:e})=>e.typography.lineHeight.tight};
`,le=(U.Ay.p`
  margin: ${({theme:e})=>e.spacing.xs} 0 0 0;
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  color: ${({theme:e})=>e.colors.text.secondary};
  line-height: ${({theme:e})=>e.typography.lineHeight.normal};
`,U.Ay.div`
  margin-bottom: ${({theme:e})=>e.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`);U.Ay.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.sm};
  margin-top: ${({theme:e})=>e.spacing.md};
  
  &:first-child {
    margin-top: 0;
  }
`;var de=r(4577);const he=U.i7`
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,pe=U.i7`
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`,me=U.i7`
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,ge=U.i7`
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;(0,U.Ay)(de.UC)`
  border-radius: ${({theme:e})=>e.borderRadius.md};
  padding: ${({theme:e})=>e.spacing.xs} ${({theme:e})=>e.spacing.sm};
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  line-height: 1;
  color: ${({theme:e})=>e.colors.text.inverse};
  background-color: ${({theme:e})=>e.colors.text.primary};
  box-shadow: ${({theme:e})=>e.colors.shadow.medium};
  user-select: none;
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  z-index: ${({theme:e})=>e.zIndex.tooltip};
  
  &[data-state='delayed-open'][data-side='top'] {
    animation-name: ${me};
  }
  &[data-state='delayed-open'][data-side='right'] {
    animation-name: ${ge};
  }
  &[data-state='delayed-open'][data-side='bottom'] {
    animation-name: ${he};
  }
  &[data-state='delayed-open'][data-side='left'] {
    animation-name: ${pe};
  }
`,(0,U.Ay)(de.i3)`
  fill: ${({theme:e})=>e.colors.text.primary};
`,(0,U.Ay)(K.P.div)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  border-radius: ${({theme:e})=>e.borderRadius.md};
  cursor: pointer;
  transition: all ${({theme:e})=>e.animation.duration.fast} ${({theme:e})=>e.animation.easing.ease};
  
  ${({$variant:e})=>(e=>{switch(e){case"primary":return U.AH`
        background: ${({theme:e})=>e.colors.primary};
        color: ${({theme:e})=>e.colors.text.inverse};
        border: 1px solid ${({theme:e})=>e.colors.primary};
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.primary}dd;
        }
      `;case"ghost":return U.AH`
        background: transparent;
        color: ${({theme:e})=>e.colors.text.secondary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.surface};
          color: ${({theme:e})=>e.colors.text.primary};
        }
      `;case"danger":return U.AH`
        background: transparent;
        color: ${({theme:e})=>e.colors.error};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.error}10;
        }
      `;default:return U.AH`
        background: ${({theme:e})=>e.colors.surface};
        color: ${({theme:e})=>e.colors.text.primary};
        border: 1px solid ${({theme:e})=>e.colors.border.default};
        
        &:hover:not(:disabled) {
          background: ${({theme:e})=>e.colors.border.hover};
          border-color: ${({theme:e})=>e.colors.border.hover};
        }
      `}})(e)}
  ${({$size:e})=>(e=>{switch(e){case"sm":return U.AH`
        width: 32px;
        height: 32px;
        
        svg {
          width: 16px;
          height: 16px;
        }
      `;case"md":return U.AH`
        width: 40px;
        height: 40px;
        
        svg {
          width: 20px;
          height: 20px;
        }
      `;case"lg":return U.AH`
        width: 48px;
        height: 48px;
        
        svg {
          width: 24px;
          height: 24px;
        }
      `;default:return U.AH``}})(e)}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${({theme:e})=>e.colors.border.focus};
    outline-offset: 2px;
  }
  
  svg {
    flex-shrink: 0;
  }
`,U.Ay.div`
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
`;var fe=r(2675);const ue={"mobile-portrait":{width:750,height:1334},"mobile-landscape":{width:1334,height:750},"mobile-square":{width:1080,height:1080},"desktop-hd":{width:1920,height:1080},"desktop-4k":{width:3840,height:2160},"ui-button":{width:200,height:60},"ui-icon":{width:64,height:64},"ui-banner":{width:800,height:200},"character-portrait":{width:512,height:512},"character-full":{width:512,height:1024},"scene-background":{width:1920,height:1080},"scene-tile":{width:256,height:256}};class be{static clampZoom(e){return Math.max(this.MIN_ZOOM,Math.min(this.MAX_ZOOM,e))}static getZoomToFit(e,n,r=50){const t=n.width-2*r,o=n.height-2*r,a=t/e.width,i=o/e.height;return this.clampZoom(Math.min(a,i))}static getZoomLevels(){return[.25,.5,.75,1,1.25,1.5,2,3,4,5]}}be.MIN_ZOOM=.1,be.MAX_ZOOM=10,be.ZOOM_STEP=.1,new Map;const xe=U.Ay.div`
  padding: ${({theme:e})=>e.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`,ye=U.Ay.div`
  margin-bottom: ${({theme:e})=>e.spacing.xl};
`,ve=U.Ay.div`
  width: 800px;
  height: 600px;
  border: 2px solid ${({theme:e})=>e.colors.border.default};
  border-radius: ${({theme:e})=>e.borderRadius.lg};
  margin: ${({theme:e})=>e.spacing.md} 0;
  position: relative;
  overflow: hidden;
`,$e=U.Ay.div`
  display: flex;
  gap: ${({theme:e})=>e.spacing.md};
  flex-wrap: wrap;
  margin-bottom: ${({theme:e})=>e.spacing.lg};
`,we=U.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({theme:e})=>e.spacing.md};
  margin-top: ${({theme:e})=>e.spacing.md};
`;var ke=r(1568);class Ae extends o.Component{constructor(e){super(e),this.state={hasError:!1}}static getDerivedStateFromError(e){return{hasError:!0,error:e}}componentDidCatch(e,n){console.error("ErrorBoundary caught an error:",e,n),this.setState({error:e,errorInfo:n})}render(){return this.state.hasError?(0,t.jsx)("div",{style:{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"},children:(0,t.jsx)(ke.Ay,{status:"error",title:"应用程序出现错误",subTitle:this.state.error?.message||"未知错误",extra:[(0,t.jsx)(p.Ay,{type:"primary",onClick:()=>window.location.reload(),children:"重新加载"},"reload"),(0,t.jsx)(p.Ay,{onClick:()=>{console.log("Error details:",this.state.error),console.log("Error info:",this.state.errorInfo)},children:"查看详情"},"details")],children:(0,t.jsxs)("div",{style:{textAlign:"left",maxWidth:"600px"},children:[(0,t.jsx)("h4",{children:"错误详情："}),(0,t.jsx)("pre",{style:{background:"#f5f5f5",padding:"10px",borderRadius:"4px",fontSize:"12px",overflow:"auto",maxHeight:"200px"},children:this.state.error?.stack})]})})}):this.props.children}}const je=Ae;var ze=r(7025),Se={};Se.styleTagTransform=S(),Se.setAttributes=k(),Se.insert=$().bind(null,"head"),Se.domAPI=y(),Se.insertStyleElement=j(),b()(ze.A,Se),ze.A&&ze.A.locals&&ze.A.locals,void 0===r(9840)&&(window.global=globalThis||window||void 0,globalThis.global=globalThis||window);const Ce=document.getElementById("root");if(!Ce)throw new Error("Root container not found");(0,a.H)(Ce).render((0,t.jsx)(o.StrictMode,{children:(0,t.jsx)(je,{children:(0,t.jsx)(i.Ay,{theme:{token:{colorPrimary:"#667eea",colorSuccess:"#52c41a",colorWarning:"#faad14",colorError:"#f5222d",colorInfo:"#1890ff",borderRadius:6,wireframe:!1},components:{Layout:{headerBg:"#001529",siderBg:"#001529"},Menu:{darkItemBg:"#001529",darkSubMenuItemBg:"#000c17"}}},children:(0,t.jsx)(()=>{const[e,n]=(0,o.useState)(null),[r,a]=(0,o.useState)(!1),i=(0,o.useRef)(null),s=(0,o.useRef)(null),c=async e=>{if(s.current){i.current||(i.current=new fe.E,i.current.on("engineSwitched",e=>{const{type:r}=e;n(r),a(!0),console.log(`Switched to ${r} engine`)}));try{await i.current.switchEngine(e,s.current,{size:{width:800,height:600},background:"#ffffff",dpi:1,enableGrid:!0,enableRuler:!0})}catch(e){}}};return(0,t.jsxs)(X,{defaultMode:"light",children:[(0,t.jsx)(Z,{}),(0,t.jsxs)(xe,{children:[(0,t.jsxs)(ye,{children:[(0,t.jsx)("h1",{children:"G-Asset Forge 架构测试"}),(0,t.jsx)("p",{children:"测试重构后的多引擎画布架构和核心系统"})]}),(0,t.jsx)(ye,{children:(0,t.jsxs)(ie,{children:[(0,t.jsx)(se,{children:(0,t.jsx)(ce,{children:"引擎切换测试"})}),(0,t.jsxs)(le,{children:[(0,t.jsxs)($e,{children:[(0,t.jsx)(Q,{variant:e===fe.L.SUIKA?"primary":"secondary",onClick:()=>c(fe.L.SUIKA),children:"Suika 引擎"}),(0,t.jsx)(Q,{variant:e===fe.L.H5_EDITOR?"primary":"secondary",onClick:()=>c(fe.L.H5_EDITOR),children:"H5-Editor 引擎"}),(0,t.jsx)(Q,{variant:e===fe.L.FABRIC?"primary":"secondary",onClick:()=>c(fe.L.FABRIC),children:"Fabric.js 引擎"})]}),(0,t.jsx)(ve,{ref:s,children:!r&&(0,t.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#666"},children:"请选择一个引擎来初始化画布"})}),r&&(0,t.jsxs)($e,{children:[(0,t.jsx)(Q,{onClick:()=>{if(!i.current)return;const e={id:`object_${Date.now()}`,type:"rectangle",position:{x:400*Math.random(),y:300*Math.random()},size:{width:100,height:80},rotation:0,opacity:1,visible:!0,locked:!1,zIndex:0};i.current.addObject(e)},children:"添加测试对象"}),(0,t.jsx)(Q,{onClick:()=>{if(!i.current)return;const e=i.current.getState();e&&i.current.zoom(1.2*e.zoom)},children:"放大"}),(0,t.jsx)(Q,{onClick:()=>{if(!i.current)return;const e=i.current.getState();e&&i.current.zoom(e.zoom/1.2)},children:"缩小"}),(0,t.jsx)(Q,{onClick:()=>{if(!i.current)return;const n=i.current.exportImage("png",1);if(n){const r=document.createElement("a");r.download=`canvas-export-${e}.png`,r.href=n,r.click()}},children:"导出图片"})]}),e&&(0,t.jsxs)("p",{children:["当前引擎: ",(0,t.jsx)("strong",{children:e})]})]})]})}),(0,t.jsx)(ye,{children:(0,t.jsxs)(ie,{children:[(0,t.jsx)(se,{children:(0,t.jsx)(ce,{children:"游戏素材尺寸预设"})}),(0,t.jsx)(le,{children:(0,t.jsx)(we,{children:Object.entries(ue).map(([e,n])=>(0,t.jsx)(ie,{variant:"outlined",padding:"sm",children:(0,t.jsxs)(le,{children:[(0,t.jsx)("h4",{children:e.replace(/-/g," ").toUpperCase()}),(0,t.jsxs)("p",{children:[n.width," × ",n.height]})]})},e))})})]})}),(0,t.jsx)(ye,{children:(0,t.jsxs)(ie,{children:[(0,t.jsx)(se,{children:(0,t.jsx)(ce,{children:"架构特性"})}),(0,t.jsx)(le,{children:(0,t.jsxs)("ul",{children:[(0,t.jsx)("li",{children:"✅ 统一的画布管理器接口"}),(0,t.jsx)("li",{children:"✅ 多引擎支持（Suika、H5-Editor、Fabric.js）"}),(0,t.jsx)("li",{children:"✅ 模块化的核心系统（画布、工具、历史、素材）"}),(0,t.jsx)("li",{children:"✅ TypeScript路径映射和别名配置"}),(0,t.jsx)("li",{children:"✅ 现代化的UI组件系统"}),(0,t.jsx)("li",{children:"✅ 游戏素材尺寸预设"}),(0,t.jsx)("li",{children:"✅ 性能工具和坐标转换工具"})]})})]})})]})]})},{})})})}))},7025:(e,n,r)=>{r.d(n,{A:()=>s});var t=r(1601),o=r.n(t),a=r(6314),i=r.n(a)()(o());i.push([e.id,"* {\n  box-sizing: border-box;\n}\nhtml,\nbody {\n  margin: 0;\n  padding: 0;\n  height: 100%;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  overflow: hidden;\n}\n#root {\n  height: 100vh;\n  width: 100vw;\n}\n::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n::-webkit-scrollbar-track {\n  background: #f1f1f1;\n  border-radius: 4px;\n}\n::-webkit-scrollbar-thumb {\n  background: #c1c1c1;\n  border-radius: 4px;\n}\n::-webkit-scrollbar-thumb:hover {\n  background: #a8a8a8;\n}\n.ant-layout {\n  background: #ffffff;\n}\n.ant-layout-header {\n  padding: 0 16px;\n  line-height: 64px;\n  height: 64px;\n}\n.ant-layout-sider .ant-menu {\n  border-right: none;\n}\n.ant-layout-sider .ant-menu-item {\n  margin: 4px 8px;\n  border-radius: 6px;\n}\n.ant-layout-sider .ant-menu-item:hover {\n  background-color: rgba(255, 255, 255, 0.1);\n}\n.ant-layout-sider .ant-menu-item.ant-menu-item-selected {\n  background-color: #1890ff;\n}\n.ant-layout-sider .ant-menu-item.ant-menu-item-selected::after {\n  display: none;\n}\n.ant-layout-sider .ant-menu-item-group-title {\n  padding: 8px 16px;\n  font-size: 12px;\n  color: rgba(255, 255, 255, 0.65);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.ant-layout-footer {\n  padding: 8px 16px;\n  line-height: normal;\n}\n.canvas-container {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n.canvas-container canvas {\n  cursor: crosshair;\n}\n.canvas-container canvas.selection-mode {\n  cursor: default;\n}\n.canvas-container canvas.text-mode {\n  cursor: text;\n}\n.canvas-container canvas.move-mode {\n  cursor: move;\n}\n.canvas-container canvas.resize-mode {\n  cursor: nw-resize;\n}\n.properties-panel .ant-card .ant-card-body {\n  padding: 16px;\n}\n.properties-panel .ant-form-item {\n  margin-bottom: 16px;\n}\n.properties-panel .ant-form-item:last-child {\n  margin-bottom: 0;\n}\n.properties-panel .ant-form-item-label {\n  padding-bottom: 4px;\n}\n.properties-panel .ant-form-item-label label {\n  font-size: 12px;\n  font-weight: 500;\n  color: #666;\n}\n.toolbar {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 16px;\n  background: #fafafa;\n  border-bottom: 1px solid #d9d9d9;\n}\n.toolbar .toolbar-group {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.toolbar .toolbar-group:not(:last-child) {\n  margin-right: 16px;\n  padding-right: 16px;\n  border-right: 1px solid #d9d9d9;\n}\n.toolbar .ant-btn {\n  border: none;\n  box-shadow: none;\n}\n.toolbar .ant-btn:hover {\n  background-color: #e6f7ff;\n  color: #1890ff;\n}\n.toolbar .ant-btn.active {\n  background-color: #1890ff;\n  color: white;\n}\n.status-bar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 4px 16px;\n  background: #fafafa;\n  border-top: 1px solid #d9d9d9;\n  font-size: 12px;\n}\n.status-bar .status-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.loading-overlay {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(255, 255, 255, 0.8);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  z-index: 1000;\n}\n.full-width {\n  width: 100%;\n}\n.full-height {\n  height: 100%;\n}\n.flex-center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.text-center {\n  text-align: center;\n}\n.no-select {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.fade-in {\n  animation: fadeIn 0.3s ease-in-out;\n}\n.slide-in-right {\n  animation: slideInRight 0.3s ease-in-out;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes slideInRight {\n  from {\n    transform: translateX(100%);\n  }\n  to {\n    transform: translateX(0);\n  }\n}\n@media (max-width: 768px) {\n  .ant-layout-sider {\n    width: 200px !important;\n    min-width: 200px !important;\n    max-width: 200px !important;\n  }\n  .properties-panel {\n    width: 250px;\n  }\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  canvas {\n    image-rendering: -webkit-optimize-contrast;\n    /* Edge 79+ support */\n    image-rendering: -moz-crisp-edges;\n    /* Firefox support */\n    image-rendering: -webkit-crisp-edges;\n    /* WebKit/Blink support */\n    image-rendering: crisp-edges;\n    /* Standard property */\n    image-rendering: pixelated;\n    /* Fallback for older browsers */\n  }\n}\n",""]);const s=i}},i={};function s(e){var n=i[e];if(void 0!==n)return n.exports;var r=i[e]={id:e,exports:{}};return a[e](r,r.exports,s),r.exports}s.m=a,e=[],s.O=(n,r,t,o)=>{if(!r){var a=1/0;for(d=0;d<e.length;d++){for(var[r,t,o]=e[d],i=!0,c=0;c<r.length;c++)(!1&o||a>=o)&&Object.keys(s.O).every(e=>s.O[e](r[c]))?r.splice(c--,1):(i=!1,o<a&&(a=o));if(i){e.splice(d--,1);var l=t();void 0!==l&&(n=l)}}return n}o=o||0;for(var d=e.length;d>0&&e[d-1][2]>o;d--)e[d]=e[d-1];e[d]=[r,t,o]},s.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return s.d(n,{a:n}),n},r=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,s.t=function(e,t){if(1&t&&(e=this(e)),8&t)return e;if("object"==typeof e&&e){if(4&t&&e.__esModule)return e;if(16&t&&"function"==typeof e.then)return e}var o=Object.create(null);s.r(o);var a={};n=n||[null,r({}),r([]),r(r)];for(var i=2&t&&e;("object"==typeof i||"function"==typeof i)&&!~n.indexOf(i);i=r(i))Object.getOwnPropertyNames(i).forEach(n=>a[n]=()=>e[n]);return a.default=()=>e,s.d(o,a),o},s.d=(e,n)=>{for(var r in n)s.o(n,r)&&!s.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:n[r]})},s.f={},s.e=e=>Promise.all(Object.keys(s.f).reduce((n,r)=>(s.f[r](e,n),n),[])),s.u=e=>e+"."+{553:"0fbbf6e7e19089c5d2b7",746:"42b1db513e505ed6ddcb"}[e]+".chunk.js",s.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),t={},o="g-asset-forge:",s.l=(e,n,r,a)=>{if(t[e])t[e].push(n);else{var i,c;if(void 0!==r)for(var l=document.getElementsByTagName("script"),d=0;d<l.length;d++){var h=l[d];if(h.getAttribute("src")==e||h.getAttribute("data-webpack")==o+r){i=h;break}}i||(c=!0,(i=document.createElement("script")).charset="utf-8",i.timeout=120,s.nc&&i.setAttribute("nonce",s.nc),i.setAttribute("data-webpack",o+r),i.src=e),t[e]=[n];var p=(n,r)=>{i.onerror=i.onload=null,clearTimeout(m);var o=t[e];if(delete t[e],i.parentNode&&i.parentNode.removeChild(i),o&&o.forEach(e=>e(r)),n)return n(r)},m=setTimeout(p.bind(null,void 0,{type:"timeout",target:i}),12e4);i.onerror=p.bind(null,i.onerror),i.onload=p.bind(null,i.onload),c&&document.head.appendChild(i)}},s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.p="./",(()=>{var e={792:0};s.f.j=(n,r)=>{var t=s.o(e,n)?e[n]:void 0;if(0!==t)if(t)r.push(t[2]);else{var o=new Promise((r,o)=>t=e[n]=[r,o]);r.push(t[2]=o);var a=s.p+s.u(n),i=new Error;s.l(a,r=>{if(s.o(e,n)&&(0!==(t=e[n])&&(e[n]=void 0),t)){var o=r&&("load"===r.type?"missing":r.type),a=r&&r.target&&r.target.src;i.message="Loading chunk "+n+" failed.\n("+o+": "+a+")",i.name="ChunkLoadError",i.type=o,i.request=a,t[1](i)}},"chunk-"+n,n)}},s.O.j=n=>0===e[n];var n=(n,r)=>{var t,o,[a,i,c]=r,l=0;if(a.some(n=>0!==e[n])){for(t in i)s.o(i,t)&&(s.m[t]=i[t]);if(c)var d=c(s)}for(n&&n(r);l<a.length;l++)o=a[l],s.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return s.O(d)},r=global.webpackChunkg_asset_forge=global.webpackChunkg_asset_forge||[];r.forEach(n.bind(null,0)),r.push=n.bind(null,r.push.bind(r))})(),s.nc=void 0;var c=s.O(void 0,[96],()=>s(5878));c=s.O(c)})();