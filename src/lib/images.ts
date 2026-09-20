import images from '../data/images.json';
import { url } from './site';

type Img = { src: string; width: number; height: number };

/** 移行済み画像（例: 'home/slider_01.jpg'）の src（BASE_PATH付き）と寸法を返す */
export function img(rel: string): Img {
  const found = (images as Record<string, Img>)[rel];
  if (!found) throw new Error(`画像が見つかりません: ${rel}`);
  return { ...found, src: url(found.src) };
}
