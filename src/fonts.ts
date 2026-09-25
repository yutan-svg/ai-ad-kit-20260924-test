// テロップに使うフォントを読み込み、読み込み完了までレンダーを待たせる。
// これを通さないと、書き出し時にシステムのフォントに落ちて見た目が変わる。
//
// 使うフォントは src/brand.ts の FONT / FONT_WEIGHTS / FONT_FILE で決める。
// Google Fonts にある名前ならそこから読み、FONT_FILE を指定したときは assets/ のファイルを読む。

import {getAvailableFonts} from '@remotion/google-fonts';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {FONT, FONT_FILE, FONT_WEIGHTS} from './brand';

export const CAPTION_FONT_FAMILY = FONT;

export const baseFont: React.CSSProperties = {
  fontFamily: `"${FONT}", "Hiragino Sans", "Yu Gothic", "Noto Sans CJK JP", sans-serif`,
  letterSpacing: 0,
};

const handle = delayRender(`フォントの読み込み: ${FONT}`);

const loadLocalFile = async () => {
  const face = new FontFace(FONT, `url(${staticFile(FONT_FILE)})`);
  await face.load();
  document.fonts.add(face);
};

const loadGoogleFont = async () => {
  const entry = getAvailableFonts().find((f) => f.fontFamily === FONT);
  if (!entry) {
    throw new Error(
      `Google Fonts に「${FONT}」がありません。名前を確かめるか、` +
        'フォントファイルを assets/fonts/ に置いて src/brand.ts の FONT_FILE に指定してください',
    );
  }
  const mod = await entry.load();
  const {waitUntilDone} = mod.loadFont('normal', {weights: FONT_WEIGHTS});
  await waitUntilDone();
};

(FONT_FILE ? loadLocalFile() : loadGoogleFont())
  .then(() => continueRender(handle))
  .catch((err) => cancelRender(`フォント「${FONT}」の読み込みに失敗: ${err}`));
