# Re-download public site icons; never used as a crawler or price connector.
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen,Request
from urllib.parse import urljoin
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
SITES=['torob.com','yadakcar.com','mryadaki.com','yadakpart.com','etemadyadak.com','partsmall.ir']
cached={r['domain']:r for r in json.loads((ROOT/'docs'/'MARKET-SOURCE-ICONS.json').read_text()) if r.get('path')}
def download(domain):
 if domain in cached and (ROOT/'public'/cached[domain]['path'].lstrip('/')).exists():return cached[domain]
 base='https://'+domain
 candidates=[]
 try:
  html=urlopen(Request(base,headers={'User-Agent':'Mozilla/5.0'}),timeout=12).read(1500000).decode('utf-8',errors='ignore')
  for tag in re.findall(r'<link\b[^>]*>',html,re.I):
   if re.search(r"rel=[\"'][^\"']*icon[^\"']*[\"']",tag,re.I):
    match=re.search(r"href=[\"']([^\"']+)",tag,re.I)
    if match:candidates.append(urljoin(base,match.group(1)))
 except Exception:pass
 for href in candidates+[base+'/favicon.ico','https://www.google.com/s2/favicons?domain='+domain+'&sz=64']:
  try:
   response=urlopen(Request(href,headers={'User-Agent':'Mozilla/5.0'}),timeout=8);mime=response.headers.get('Content-Type','').split(';')[0];data=response.read(300000)
   if not mime.startswith('image/') or not data or len(data)>=300000:continue
   ext={'image/svg+xml':'.svg','image/png':'.png','image/webp':'.webp','image/jpeg':'.jpg'}.get(mime,'.ico')
   target=ROOT/'public'/'market-sources'/(domain.split('.')[0]+ext);target.parent.mkdir(exist_ok=True);target.write_bytes(data)
   return {'domain':domain,'path':'/market-sources/'+target.name,'source':href}
  except Exception:pass
 return {'domain':domain,'error':'icon unavailable'}
rows=list(ThreadPoolExecutor(max_workers=6).map(download,SITES))
(ROOT/'docs'/'MARKET-SOURCE-ICONS.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
print(json.dumps(rows))
