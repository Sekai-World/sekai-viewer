const fontList = `"Overpass","M PLUS 1","Prompt","Roboto","Helvetica","Arial",sans-serif`;
const fontFaceOverride = `
@font-face {
  font-family: "Overpass";
  unicode-range: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
}
@font-face {
  font-family: "M PLUS 1";
  unicode-range: U+25ee8, U+25f23, U+25f5c, U+25fd4, U+25fe0, U+25ffb, U+2600c, U+26017, U+26060, U+260ed, U+26222, U+2626a, U+26270, U+26286, U+2634c, U+26402, U+2667e, U+266b0, U+2671d, U+268dd, U+268ea, U+26951, U+2696f, U+26999, U+269dd, U+26a1e, U+26a58, U+26a8c, U+26ab7, U+26aff, U+26c29, U+26c73, U+26c9e, U+26cdd, U+26e40, U+26e65, U+26f94, U+26ff6-26ff8, U+270f4, U+2710d, U+27139, U+273da-273db, U+273fe, U+27410, U+27449, U+27614-27615, U+27631, U+27684, U+27693, U+2770e, U+27723, U+27752, U+278b2, U+27985, U+279b4, U+27a84, U+27bb3, U+27bbe, U+27bc7, U+27c3c, U+27cb8, U+27d73, U+27da0, U+27e10, U+27eaf, U+27fb7, U+2808a, U+280bb, U+28277, U+28282, U+282f3, U+283cd, U+2840c, U+28455, U+284dc, U+2856b, U+285c8-285c9, U+286d7, U+286fa, U+28946, U+28949, U+2896b, U+28987-28988, U+289ba-289bb, U+28a1e, U+28a29, U+28a43, U+28a71, U+28a99, U+28acd, U+28add, U+28ae4, U+28bc1, U+28bef, U+28cdd, U+28d10, U+28d71, U+28dfb, U+28e0f, U+28e17, U+28e1f, U+28e36, U+28e89, U+28eeb, U+28ef6, U+28f32, U+28ff8, U+292a0, U+292b1, U+29490, U+295cf, U+2967f, U+296f0, U+29719, U+29750, U+29810, U+298c6, U+29a72, U+29d4b, U+29ddb, U+29e15, U+29e3d, U+29e49, U+29e8a, U+29ec4, U+29edb, U+29ee9, U+29fce, U+29fd7, U+2a01a, U+2a02f, U+2a082, U+2a0f9, U+2a190, U+2a2b2, U+2a38c, U+2a437, U+2a5f1, U+2a602, U+2a61a, U+2a6b2, U+2a9e6, U+2b746, U+2b751, U+2b753, U+2b75a, U+2b75c, U+2b765, U+2b776-2b777, U+2b77c, U+2b782, U+2b789, U+2b78b, U+2b78e, U+2b794, U+2b7ac, U+2b7af, U+2b7bd, U+2b7c9, U+2b7cf, U+2b7d2, U+2b7d8, U+2b7f0, U+2b80d, U+2b817, U+2b81a, U+2d544, U+2e278, U+2e569, U+2e6ea, U+2f804, U+2f80f, U+2f815, U+2f818, U+2f81a, U+2f822, U+2f828, U+2f82c, U+2f833, U+2f83f, U+2f846, U+2f852, U+2f862, U+2f86d, U+2f873, U+2f877, U+2f884, U+2f899-2f89a, U+2f8a6, U+2f8ac, U+2f8b2, U+2f8b6, U+2f8d3, U+2f8db-2f8dc, U+2f8e1, U+2f8e5, U+2f8ea, U+2f8ed, U+2f8fc, U+2f903, U+2f90b, U+2f90f, U+2f91a, U+2f920-2f921, U+2f945, U+2f947, U+2f96c, U+2f995, U+2f9d0, U+2f9de-2f9df, U+2f9f4;
}
@font-face {
  font-family: "Prompt";
  unicode-range: U+0E01-0E5B, U+200C-200D, U+25CC;
`;
export { fontList, fontFaceOverride };
