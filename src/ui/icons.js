const paths={
 terminal:'m5 6 6 6-6 6m9 0h5', home:'M3 10 12 3l9 7v10H3zm6 10v-7h6v7', book:'M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1v15',
 field:'M3 21V7h18v14M8 7V3h8v4M3 13h18M10 11v4h4v-4', crew:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8m8 0a4 4 0 0 1 0 8',
 user:'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2m8-19a4 4 0 1 0 0 8 4 4 0 0 0 0-8', check:'m5 12 4 4L19 6', arrow:'M5 12h14m-6-6 6 6-6 6', chevron:'m9 5 7 7-7 7', close:'m6 6 12 12M6 18 18 6',
 menu:'M4 6h16M4 12h16M4 18h16', clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', bolt:'m13 2-9 12h7l-1 8 10-13h-7z', target:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0m-6-2v4m-2-2h4',
 network:'M9 3h6v6H9zM2 16h6v6H2zm14 0h6v6h-6zM12 9v4M5 16v-3h14v3', wifi:'M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0m-4 4h.01', download:'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
 search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0', flag:'M4 22V3c5-3 10 3 16 0v10c-6 3-11-3-16 0', bulb:'M9 18h6m-6 3h6M8 15a7 7 0 1 1 8 0v1H8z',
 settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2', note:'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5', reset:'M3 10a9 9 0 1 1 1 8M3 3v7h7', play:'m7 3 15 9-15 9z', pause:'M7 4v16M17 4v16', shield:'m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z',
 chip:'M6 6h12v12H6zM9 1v5m6-5v5M9 18v5m6-5v5M1 9h5m-5 6h5m12-6h5m-5 6h5', star:'m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z', copy:'M9 9h12v12H9zM5 15H3V3h12v2', lock:'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4',
};
export function icon(name,cls=''){return `<svg class="icon ${cls}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]??paths.terminal}"/></svg>`;}
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
