const fs=require('fs'),vm=require('vm');const ctx={window:{},console};vm.createContext(ctx);
for(const f of ['js/template.js','js/template-kt.js','js/karya.js'])vm.runInContext(fs.readFileSync(f,'utf8').replace(/^(var|let|const) /gm,'var '),ctx);
const g=ctx.TPL.filter(t=>/^contoh\//.test(t.main)).map(t=>({id:t.id,path:t.main.slice(7),n:t.judul,kat:t.kat,mapel:t.mapel,jenjang:t.jenjang,topik:t.topik,img:'vid/template/'+t.id+'-edu.jpg'}));
const a=ctx.KARYA.filter(k=>/^contoh\//.test(k.link||'')).map(k=>({id:k.id,path:k.link.slice(7),n:k.n,kat:'app',mapel:k.mapel,jenjang:k.jen,topik:k.d,img:'img/karya/'+k.id+'.jpg'}));
console.log(JSON.stringify({kat:ctx.TPL_KAT,items:g.concat(a)}));
