import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const asset=name=>fileURLToPath(new URL('../public/'+name,import.meta.url));

test('the production logo has true transparent alpha outside its opaque orange and navy artwork',async()=>{
  const {data,info}=await sharp(asset('khodrochare-symbol-transparent.webp')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(info.channels,4);
  for(const [x,y] of [[0,0],[info.width-1,0],[0,info.height-1],[info.width-1,info.height-1]])assert.equal(data[(y*info.width+x)*4+3],0);
  let transparent=0,opaque=0;
  for(let i=3;i<data.length;i+=4){if(data[i]===0)transparent++;if(data[i]>=250)opaque++;}
  assert.ok(transparent/(info.width*info.height)>.2,'surrounding background must be transparent');
  assert.ok(opaque/(info.width*info.height)>.4,'the logo itself must remain solid');
});

test('both carousel pictures are decodable optimized landscape assets',async()=>{
  for(const name of ['hall-buy','hall-inspection']){
    const image=sharp(asset(`slides/${name}.webp`)),metadata=await image.metadata();
    assert.equal(metadata.format,'webp');assert.ok(metadata.width>=1200);assert.ok(metadata.width>metadata.height);
    const {size}=await image.toBuffer({resolveWithObject:true}).then(r=>r.info);assert.ok(size<300000);
  }
});
