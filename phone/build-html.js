// يبني ملف HTML واحد للهاتف (ES5 لأندرويد القديم): node build-html.js <babel-standalone-path> <out>
const fs = require("fs"), path = require("path"), B = require(process.argv[2]);
const R = p => fs.readFileSync(path.join(__dirname, p), "utf8");
const poly = `if(!Array.prototype.fill)Array.prototype.fill=function(v,s,e){var n=this.length;s=s|0;e=e===undefined?n:e;for(var i=s;i<e;i++)this[i]=v;return this};
if(!Array.from)Array.from=function(o,f){var n=o.length>>>0,a=new Array(n);for(var i=0;i<n;i++)a[i]=f?f(o[i],i):o[i];return a};
if(!Object.assign)Object.assign=function(t){for(var i=1;i<arguments.length;i++){var s=arguments[i];if(s)for(var k in s)if(Object.prototype.hasOwnProperty.call(s,k))t[k]=s[k]}return t};
if(!Array.prototype.find)Array.prototype.find=function(f){for(var i=0;i<this.length;i++)if(f(this[i],i))return this[i]};
if(!Array.prototype.includes)Array.prototype.includes=function(x){return this.indexOf(x)>=0};
if(!Math.imul)Math.imul=function(a,b){var ah=a>>>16&65535,al=a&65535,bh=b>>>16&65535,bl=b&65535;return al*bl+((ah*bl+al*bh)<<16>>>0)|0};`;
const js = [R("../content.js"), R("../engine.js"), R("app.js")].join("\n;\n");
const es5 = B.transform(js, { presets: [["env", { targets: "chrome 30", loose: true }]], sourceType: "script" }).code;
const out = R("page.html").replace("/*CSS*/", () => R("app.css")).replace("/*JS*/", () => poly + "\n" + es5.replace(/<\/script/g, "<\\/script"));
fs.writeFileSync(process.argv[3], out);
console.log("wrote", process.argv[3], out.length, "bytes");
