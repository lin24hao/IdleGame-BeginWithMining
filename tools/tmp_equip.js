// 临时：复现装备攻击/血量不生效问题
const fs=require('fs'),vm=require('vm');const base='g:/DownLoad/搜打撤/game/';
const makeEl=()=>({innerHTML:'',style:{},addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},classList:{toggle(){},add(){},remove(){}},getBoundingClientRect(){return{left:0,top:0,width:0,height:0,bottom:0};},appendChild(){},remove(){},dataset:{}});
global.document={body:makeEl(),documentElement:{},addEventListener(){},getElementById(){return makeEl();},createElement(){return makeEl();},querySelector(){return null;},querySelectorAll(){return [];},readyState:'complete'};
global.window={addEventListener(){},innerHeight:800,innerWidth:1200};
global.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
global.addEventListener=function(){};global.location={reload(){}};
global.setInterval=function(){return 1;};global.setTimeout=function(){return 1;};global.requestAnimationFrame=function(){};
global.getSequence=(base,pos)=>Math.round((base+(pos-1)/2)*pos);
global.SECONDS_PER_MINUTE=60;global.SECONDS_PER_HOUR=3600;global.SECONDS_PER_DAY=86400;
global.getDiminishing=(num)=>{let r=0,x=0.9;for(let i=0;i<(num||0);i++){r+=x*0.11;x*=0.9;}return r;};
global.getApproaching=(base,cap,num)=>(1-Math.pow(1-base/cap,num))*cap;
global.splicedLinear=(i1,i2,bp,v)=>Math.max(0,v-bp)*i2+Math.min(bp,v)*i1;
global.buildArray=(length)=>{const a=[];for(let i=0;i<(length||0);i++)a.push(i);return a;};
global.capitalize=(t)=>t.charAt(0).toUpperCase()+t.slice(1);
global.decapitalize=(t)=>t.charAt(0).toLowerCase()+t.slice(1);
global.buildNum=(number,suffix)=>{const s={K:1e3,M:1e6,B:1e9,T:1e12,Q:1e15,Qi:1e18,S:1e21,Sp:1e24,O:1e27,N:1e30};if(suffix===undefined)return number;return number*(s[suffix]||1);};
global.formatNum=(num)=>String(Math.floor(num));global.formatInt=(num)=>String(num);
global.logBase=(num,base)=>Math.log(num)/Math.log(base);
global.weightSelect=(array,rnd)=>{if(!array||!array.length)return -1;rnd=(rnd===undefined?Math.random():rnd);let total=0;for(const w of array)total+=w;let r=rnd*total;for(let i=0;i<array.length;i++){r-=array[i];if(r<=0)return i;}return array.length-1;};
global.chance=(prob,rng)=>(rng===undefined?Math.random():rng)<prob;
global.randomInt=(min,max,rng)=>{rng=(rng===undefined?Math.random():rng);return Math.floor(rng*(1+max-min)+min);};
global.randomRound=(num,rng)=>{const fl=Math.floor(num);return(global.chance(num-fl,rng)?fl+1:fl);};
global.GB_ICON={icon:(n)=>''};
const files=['js/modules/horde/ho_data.js','js/modules/horde/ho_mod.js','js/modules/horde/ho_store.js','js/modules/horde/ho_core.js','js/modules/horde/ho_text.js'];
let src='';for(const f of files){const p=base+'/'+f;src+='\n;/* --- '+f+' --- */\n'+fs.readFileSync(p,'utf8');}
src+=`
;(function(){
  const log=(...m)=>console.log(...m);
  HO_BOOT({ stat:null, unlock:null, currencyVals:null, upgradeLevels:null, consumable:null });
  const st=HO_RT.state;
  // 结算（等同视图 _settle）
  try{ HO_RT.act('updatePlayerCache'); HO_RT.act('updatePlayerStats'); }catch(e){log('settle err',e.message);}
  log('base mult hordeAttack:', HO_MULT.get('hordeAttack', 5), ' | mult hordeHealth:', HO_MULT.get('hordeHealth', 500));
  log('before: player.attack=', st.player && st.player.attack, 'player.health=', st.player && st.player.health);
  log('before: cachePlayerStats.attack=', st.cachePlayerStats && st.cachePlayerStats.attack, 'cache.health=', st.cachePlayerStats && st.cachePlayerStats.health);
  // 装备 dagger（found=true 已开局携带）
  const it = st.items['dagger'];
  log('dagger: level=', it && it.level, 'equipped=', it && it.equipped, 'stats=', it && JSON.stringify(it.stats(it.level, it.stacks||0)));
  try{ HO_RT.act('equipItem','dagger'); }catch(e){ log('equip err', e.message); }
  log('AFTER equip dagger-> mult hordeAttack:', HO_MULT.get('hordeAttack', 5), 'mult hordeHealth:', HO_MULT.get('hordeHealth',500));
  log('after: player.attack=', st.player && st.player.attack, 'player.health=', st.player && st.player.health);
  log('after: cachePlayerStats.attack=', st.cachePlayerStats && st.cachePlayerStats.attack, 'cache.health=', st.cachePlayerStats && st.cachePlayerStats.health);
  log('hordeAttack baseValues:', JSON.stringify(HO_MULT.items['hordeAttack'] && HO_MULT.items['hordeAttack'].baseValues));
  log('hordeHealth baseValues:', JSON.stringify(HO_MULT.items['hordeHealth'] && HO_MULT.items['hordeHealth'].baseValues));
})();
`;
vm.runInThisContext(src,{filename:'tmp_equip.js'});