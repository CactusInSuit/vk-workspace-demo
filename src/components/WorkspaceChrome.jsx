import React from 'react';
import {MODULES} from '../lib/modules.js';

// Vectors reconstructed from the user-supplied WorkSpace screenshot.
// Kept separate from editor icons so the shell can match its own visual system.
export function WorkspaceGlyph({name,size=18,...props}){
 const paths={
  home:<><path d="m3 10 7-6 7 6v8a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1z"/><path d="M1.8 10.8 10 3.5l8.2 7.3"/></>,
  mail:<><rect x="2.1" y="4.3" width="15.8" height="12.2" rx="3"/><path d="m3 5.5 5.5 4.1a2.5 2.5 0 0 0 3 0L17 5.5"/></>,
  calendar:<><rect x="2.7" y="4" width="14.6" height="13.6" rx="2.3"/><path d="M6 2.2v4M14 2.2v4M3 8h14"/></>,
  messenger:<path d="M3 17.5 4.2 14a7 7 0 1 1 4.1 2.6Z"/>,
  calls:<><rect x="1.8" y="5" width="11.4" height="11" rx="2.8"/><path d="m13.2 8 4.7-2v10l-4.7-2"/></>,
  disk:<path d="M5.5 16.5a4 4 0 0 1-.2-8 5 5 0 0 1 9.6-1.2 4.6 4.6 0 0 1-.3 9.2Z"/>,
  docs:<><path d="M5.3 2.1h6.3l4.2 4.3v10.2a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8V4a1.8 1.8 0 0 1 1.8-1.9Z"/><path d="M11 2.5v3.2a1.4 1.4 0 0 0 1.4 1.4h3"/></>,
  board:<><path d="M8 4H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h6M11 4h3a2 2 0 0 1 2 2v3M6 8h4M6 11h2"/><path d="m11 13 4.8-4.8 2 2L13 15l-3 1zM14.7 9.3l2 2"/></>,
  projects:<><rect x="3.1" y="2.8" width="13.8" height="14.4" rx="3.2"/><path d="M6.3 6.2h.1M9 6.2h4.8M6.3 9.8h.1M9 9.8h4.8M6.3 13.4h.1M9 13.4h4.8"/></>,
  search:<><circle cx="8.5" cy="8.5" r="5"/><path d="m12.4 12.4 4 4"/></>,
  bell:<path d="M7.2 16.9a2.8 2.8 0 0 0 5.6 0M4 8a6 6 0 1 1 12 0c0 5.4 2.3 5.3 2.3 7 0 1.2-2.8 1.7-8.3 1.7s-8.3-.5-8.3-1.7C1.7 13.3 4 13.4 4 8Z"/>,
  help:<><circle cx="10" cy="10" r="7.5"/><path d="M7.9 7.7a2.2 2.2 0 0 1 4.3.3c0 1.6-2.2 1.5-2.2 3.6M10 14h.01"/></>,
  plus:<path d="M10 5.5v9M5.5 10h9"/>,
  lock:<><rect x="5" y="9" width="10" height="8" rx="1.8"/><path d="M7 9V6a3 3 0 0 1 6 0v3"/></>,
  download:<><path d="M10 2v12M5 9l5 5 5-5M3 17h14"/></>,
  page:<><path d="M5 1.5h7l5 5v10.2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2Z"/><path d="M11 2v4a1 1 0 0 0 1 1h4M6 12h7M6 15h4"/></>,
  tasklist:<><circle cx="3" cy="5" r="1.1" fill="currentColor"/><circle cx="3" cy="15" r="1.1" fill="currentColor"/><path d="M10 5h8M10 15h8"/></>,
 };
 return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]||paths.projects}</svg>;
}
export function WorkspaceMark(){return <svg className="workspace-mark" width="27" height="27" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="6" fill="#0085ff"/><path d="M13.1 10.4C9 13.3 4.7 11.8 4.7 7.7c0-3.9 4.6-4.3 6.9-.6 1 1.5 1.5 3.3 1.5 3.3Z" fill="white"/><path d="M17.6 13.1c-2.9-4.1-1.4-8.4 2.7-8.4 3.9 0 4.3 4.6.6 6.9-1.5 1-3.3 1.5-3.3 1.5Z" fill="white"/><path d="M14.9 17.6c4.1-2.9 8.4-1.4 8.4 2.7 0 3.9-4.6 4.3-6.9.6-1-1.5-1.5-3.3-1.5-3.3Z" fill="white"/><path d="M10.4 14.9c2.9 4.1 1.4 8.4-2.7 8.4-3.9 0-4.3-4.6-.6-6.9 1.5-1 3.3-1.5 3.3-1.5Z" fill="white"/></svg>;}

export function WorkspaceRail({moduleId,settings,onNavigate,onProfile,onDownload,onLauncher}){
 const modules=MODULES.filter(m=>m.rail!==false&&(m.id==='home'||settings.enabledModules.includes(m.id)));
 return <nav className="reference-rail" aria-label="Сервисы WorkSpace"><button className="reference-brand" aria-label="Сервисы WorkSpace" title="VK WorkSpace" onClick={onLauncher}><WorkspaceMark/></button><div className="reference-services">{modules.map(m=><button key={m.id} className={`reference-service ${moduleId===m.id?'selected':''}`} title={m.name} aria-label={m.name} onClick={()=>onNavigate(m.id)}><WorkspaceGlyph name={m.id}/><span>{m.name}</span>{m.id==='mail'&&<i className="reference-mail-count">1</i>}</button>)}</div><div className="reference-rail-bottom"><button className="reference-app-download" onClick={onDownload}><WorkspaceGlyph name="download" size={18}/><span>Приложение</span></button><button className="reference-profile" title="Настройки макета" aria-label="Настройки макета" onClick={onProfile}>{(settings.profile||'Н')[0]}</button></div></nav>;
}

export function WorkspaceTopbar({moduleId,tab,onTab,onSearch,onNotifications,onHelp}){
 const isProjects=moduleId==='projects'||moduleId==='home';const labels=isProjects?['Главная','Задачи','Страницы','Дашборды','Заявки']:[MODULES.find(m=>m.id===moduleId)?.name||'Главная'];
 return <header className="reference-topbar"><nav className="reference-tabs" aria-label={isProjects?'Навигация Проектов':'Навигация сервиса'}>{labels.map(label=><button key={label} className={(isProjects?tab===label:true)?'active':''} onClick={()=>isProjects&&onTab(label)}>{label}</button>)}</nav><div className="reference-topbar-actions"><button className="reference-find" onClick={onSearch}><WorkspaceGlyph name="search" size={12}/><span>Найти</span></button><button aria-label="Уведомления" title="Уведомления" onClick={onNotifications}><WorkspaceGlyph name="bell" size={15}/></button><button aria-label="Справка" title="Справка" onClick={onHelp}><WorkspaceGlyph name="help" size={14}/></button></div></header>;
}
