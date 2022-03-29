const fontList = `"Overpass","Prompt","Noto Sans JP","Roboto","Helvetica","Arial",sans-serif`;
const fontFaceOverride = `
@font-face {  
  font-family: "Overpass";
  src: url(https://fonts.gstatic.com/s/overpass/v10/qFdH35WCmI96Ajtm81GlU9s.woff2) format('woff2');
  unicode-range: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
}
@font-face {
  font-family: "Prompt";
  src: url(https://fonts.gstatic.com/s/prompt/v9/-W_8XJnvUD7dzB2Cy_gIfWMuQ5Q.woff2) format('woff2');
  unicode-range: U+0E01-0E5B, U+200C-200D, U+25CC;
}

`;
export { fontList, fontFaceOverride };
