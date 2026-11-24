export const HALL_PHOTO_MAX_BYTES=8*1024*1024;
export const HALL_PHOTO_ACCEPT='image/jpeg,image/png,image/webp,image/avif,image/gif,image/tiff,.jpg,.jpeg,.png,.webp,.avif,.gif,.tif,.tiff';
const mimeTypes=new Set(['image/jpeg','image/jpg','image/pjpeg','image/png','image/webp','image/avif','image/gif','image/tiff','image/x-tiff']);
export function validateHallPhotos(files:FileList|File[],existingCount:number):File[]{
 const selected=Array.from(files);
 if(selected.length+existingCount>5)throw new Error('حداکثر ۵ عکس می‌توانید بارگذاری کنید.');
 for(const file of selected){
  if(!file.size)throw new Error(`فایل «${file.name}» خالی است؛ تصویر دیگری انتخاب کنید.`);
  if(file.size>=HALL_PHOTO_MAX_BYTES)throw new Error('حجم هر تصویر باید کمتر از ۸ مگابایت باشد.');
  if(/\.(heic|heif)$/i.test(file.name)||['image/heic','image/heif'].includes(file.type))throw new Error('برای بارگذاری عکس آیفون با فرمت HEIC، ابتدا آن را به JPG تبدیل کنید.');
  const knownExtension=/\.(jpe?g|png|webp|avif|gif|tiff?)$/i.test(file.name);
  if(!mimeTypes.has(file.type)&&!((!file.type||file.type==='application/octet-stream')&&knownExtension))throw new Error('تصویر JPG، PNG، WebP، AVIF، GIF یا TIFF انتخاب کنید.');
 }
 return selected;
}
