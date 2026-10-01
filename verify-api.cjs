// Read-only live API proof; bearer stays in memory and is never logged.
const fs=require('node:fs');const assert=require('node:assert/strict');const zlib=require('node:zlib');
(async()=>{
 const token=fs.readFileSync('/config/.job-worker/token','utf8').trim();
 const base='http://job-portal-browser:3030';
 async function call(path,body){const r=await fetch(base+path,{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(90000)});const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));assert.equal(data.status,'ok',JSON.stringify(data));assert.equal(data.authentication,'authenticated');return {http_status:r.status,response:data};}
 assert.equal((await fetch(base+'/health')).status,401);
 for(const [portal,url] of [['glints','https://glints.com/id/opportunities/jobs/explore?keyword=software%20engineer'],['jobstreet','https://id.jobstreet.com/software-engineer-jobs']]){
 const discover=await call('/v1/discover',{portal,url,limit:3});assert.ok(discover.response.jobs.length);
 let detail;for(const job of discover.response.jobs){try{detail=await call('/v1/detail',{portal,url:job.url});break;}catch(error){console.log(JSON.stringify({portal,detail_retry:true,message:error.message.slice(0,300)}));}}
 assert.ok(detail,'No complete authenticated detail');assert.ok(detail.response.text.length>500);assert.ok(detail.response.heading);
 // Remove arbitrary embedded JSON and redact contact data from vacancy text.
 delete detail.response.structured_data;
 const sanitize=s=>s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[redacted-email]').replace(/(?:\+62|\b08)[\d\s()-]{7,}/g,'[redacted-phone]');
 detail.response.text=sanitize(detail.response.text);detail.response.evidence.excerpt=sanitize(detail.response.evidence.excerpt);
 const evidence={portal,base_url:base,unauthenticated_health_status:401,discover,detail,sanitized:true};
 fs.writeFileSync('/config/.job-worker/browser-evidence-'+portal+'.json',JSON.stringify(evidence,null,2),{mode:0o600});
 console.log('EVIDENCE '+portal+' '+zlib.gzipSync(JSON.stringify(evidence)).toString('base64'));
 console.log(JSON.stringify({portal,discover_http:200,discover_status:discover.response.status,discover_authentication:discover.response.authentication,jobs:discover.response.jobs.length,detail_http:200,detail_status:detail.response.status,detail_authentication:detail.response.authentication,heading:detail.response.heading,url:detail.response.url,text_length:detail.response.text.length}));
 }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
