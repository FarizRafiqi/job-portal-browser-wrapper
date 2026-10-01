const {test}=require('node:test');
const assert=require('node:assert/strict');
test('default CDP discovery uses Chromium IPv4 loopback listener',async()=>{
 const original=global.fetch;let requested;
 global.fetch=async url=>{requested=url;throw new Error('stop before CDP handshake');};
 try{await assert.rejects(require('./browser.cjs').read({portal:'glints',kind:'discover',url:'https://glints.com/id/opportunities/jobs/explore'}),/stop before CDP handshake/);
 assert.equal(requested,'http://127.0.0.1:9222/json/version');
 }finally{global.fetch=original;}
});
