global.window={VP:{scenes:{},branchText:{},people:{},mainOrder:[],sideMissions:[],romances:{},endings:{},lore:[],loreTabs:[],careers:{}}};
const fs=require('fs');const R=require("path").resolve(__dirname,"..");
for(const f of ['chapter1','campaign','city'])eval(fs.readFileSync(R+'/content/scenes/'+f+'.js','utf8'));
fs.writeFileSync(R+"/content/scenes/_scenes.json",JSON.stringify(window.VP.scenes));
