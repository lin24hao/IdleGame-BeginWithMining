const fs = require("fs");

// === 1. 补 subtype 'max' 支持 ===
let core = fs.readFileSync("c:/Users/pc/Desktop/搜打撤/game/js/modules/general/general_core.js", "utf8");
const oldSubtype = `if (subtype === 'current') return item.value !== undefined ? item.value : (item.current !== undefined ? item.current : 0);
          return item.total !== undefined ? item.total : (item.value !== undefined ? item.value : 0);`;
const newSubtype = `if (subtype === 'current' || subtype === 'value') return item.value !== undefined ? item.value : 0;
          if (subtype === 'max') return item.max !== undefined ? item.max : 0;
          // default: total (累计)
          return item.total !== undefined ? item.total : (item.value !== undefined ? item.value : 0);`;
core = core.replace(oldSubtype, newSubtype);
console.log("1. subtype fix:", core.includes("subtype === 'max'") ? "OK" : "FAIL");
fs.writeFileSync("c:/Users/pc/Desktop/搜打撤/game/js/modules/general/general_core.js", core, "utf8");
console.log("   core size:", core.length);
