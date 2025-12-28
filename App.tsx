import React, { useState, useEffect, useRef } from 'react';
import { CurriculumNode, LessonState, ChatMessage, HistoryItem, DrillType, DrillSettings, DrillQuestion, Difficulty, Product, Unit } from './types';
import { generateLesson, generateChatResponse } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';

// --- Icons ---

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);
const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>
);
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);
const ShopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const CalculatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>
);
const MissionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const PenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);
const EraserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const CrownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 18 1-9 6 3 6-3 1 9H5Z"/><path d="M12 9V5"/></svg>
);

// --- Constants ---

const DRILL_LP_RATES: Record<DrillType, number> = {
    add: 10, sub: 10, mul: 10, div: 10,
    exp: 20, root: 20
};

const COUNT_MULTIPLIERS: Record<number, number> = {
    10: 1, 25: 3, 50: 7
};

const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
    easy: 0.75,
    normal: 1.0,
    hard: 1.5
};

const PRODUCTS: Product[] = [
    {
        id: 'math-grade1-vol1',
        title: 'はじめての算数 上',
        description: '小学校一年生の算数の内容をわかりやすく解説する参考書です。',
        price: 100,
        category: '小学1年生',
        units: [
            { id: '1-1', title: 'たしざん' },
            { id: '1-2', title: 'ひきざん' },
            { id: '1-3', title: 'かたちあそび (りったい)' },
            { id: '1-4', title: 'とけい' },
            { id: '1-5', title: 'どちらが おおい' },
            { id: '1-6', title: '100までの かず' },
            { id: '1-7', title: 'かたちづくり (へいめん)' },
            { id: '1-8', title: 'どんな しきに なるかな' },
            { id: '1-9', title: 'おなじ かずずつ わけよう' },
        ]
    },
    {
        id: 'math-grade2-vol1',
        title: 'はじめての算数 下',
        description: '小学校二年生の算数の内容をわかりやすく解説する参考書です。',
        price: 100,
        category: '小学2年生',
        units: [
            { id: '2-1', title: '表とグラフ' },
            { id: '2-2', title: '時こくと時間' },
            { id: '2-3', title: 'たし算のひっ算' },
            { id: '2-4', title: 'ひき算のひっ算' },
            { id: '2-5', title: '長さ（cm、mm）' },
            { id: '2-6', title: '1000までの数' },
            { id: '2-7', title: 'かさ（L、dL、mL）' },
            { id: '2-8', title: 'たし算とひき算（図を使って考える問題）' },
            { id: '2-9', title: 'かけ算（九九）' },
            { id: '2-10', title: '三角形と四角形' },
            { id: '2-11', title: '10000までの数' },
            { id: '2-12', title: '長い長さ（m）' },
            { id: '2-13', title: '分数（基礎）' },
            { id: '2-14', title: 'はこの形' },
        ]
    },
    {
        id: 'math-grade3-vol1',
        title: '楽しい算数 上',
        description: '小学校三年生の算数の内容を楽しく解説する参考書です。',
        price: 500,
        category: '小学3年生',
        units: [
            { id: '3-1', title: '九九の表と図' },
            { id: '3-2', title: '時こくと時間（時間の計算）' },
            { id: '3-3', title: 'わり算（はじめてのわり算）' },
            { id: '3-4', title: 'たし算とひき算の筆算（3けた・4けた）' },
            { id: '3-5', title: '長いものの長さ（km、まきじゃく）' },
            { id: '3-6', title: 'あまりのあるわり算' },
            { id: '3-7', title: '一万をこえる数（大きな数）' },
            { id: '3-8', title: 'かけ算の筆算 (1)（何十をかける計算）' },
            { id: '3-9', title: '円と球' },
            { id: '3-10', title: '小数（0.1の位）' },
            { id: '3-11', title: '重さ（g、kg、はかり）' },
            { id: '3-12', title: '分数（分母が同じ加減）' },
            { id: '3-13', title: '□を使った式' },
            { id: '3-14', title: 'かけ算の筆算 (2)（2けた×2けた）' },
            { id: '3-15', title: '三角形（二等辺三角形・正三角形・角）' },
            { id: '3-16', title: '棒グラフと表' },
            { id: '3-17', title: 'そろばん' },
        ]
    },
    {
        id: 'math-grade4-vol1',
        title: '楽しい算数 下',
        description: '小学校四年生の算数の内容を深く解説する参考書です。',
        price: 500,
        category: '小学4年生',
        units: [
            { id: '4-1', title: '大きな数（億、兆）' },
            { id: '4-2', title: 'グラフ（折れ線グラフ）' },
            { id: '4-3', title: 'わり算の筆算 (1)（2けた÷1けた）' },
            { id: '4-4', title: '角（分度器の使い方）' },
            { id: '4-5', title: 'わり算の筆算 (2)（2けた÷2けた、3けた÷2けた）' },
            { id: '4-6', title: '垂直・平行と四角形（台形・平行四辺形・ひし形）' },
            { id: '4-7', title: 'そろばん' },
            { id: '4-8', title: '小数（小数の仕組み、たし算・ひき算）' },
            { id: '4-9', title: '式と計算の順序（カッコのある計算など）' },
            { id: '4-10', title: '面積（平方センチメートル、平方メートル、アール、ヘクタール）' },
            { id: '4-11', title: '小数の乗法・除法（小数×整数、小数÷整数）' },
            { id: '4-12', title: '変わり方（表を使って関係を調べる）' },
            { id: '4-13', title: '分数（真分数、仮分数、帯分数）' },
            { id: '4-14', title: '直方体と立方体（展開図、位置の表し方）' },
        ]
    },
    {
        id: 'math-grade5-vol1',
        title: '面白い算数 上',
        description: '小学校五年生の算数。語彙が難しくなり、抽象的な思考が求められます。',
        price: 750,
        category: '小学5年生',
        units: [
            { id: '5-1', title: '整数と小数の仕組み' },
            { id: '5-2', title: '体積（直方体・立方体・複雑な形）' },
            { id: '5-3', title: '比例（変わり方）' },
            { id: '5-4', title: '小数のかけ算（小数×小数）' },
            { id: '5-5', title: '小数のわり算（小数÷小数）' },
            { id: '5-6', title: '合同な図形' },
            { id: '5-7', title: '図形の角（三角形・四角形の内角の和）' },
            { id: '5-8', title: '偶数と奇数、倍数と約数' },
            { id: '5-9', title: '分数（通分・約分、異分母のたし算・ひき算）' },
            { id: '5-10', title: '平均' },
            { id: '5-11', title: '単位量あたりの大きさ（密度・速さの基礎）' },
            { id: '5-12', title: '図形の面積（平行四辺形・三角形・台形・ひし形）' },
            { id: '5-13', title: '正多角形と円周（円周率）' },
            { id: '5-14', title: '百分率とグラフ（％、帯グラフ・円グラフ）' },
            { id: '5-15', title: '角柱と円柱' },
        ]
    },
    {
        id: 'math-grade6-vol1',
        title: '面白い算数 下',
        description: '小学校六年生の算数。中学校への架け橋となる重要な単元を学びます。',
        price: 750,
        category: '小学6年生',
        units: [
            { id: '6-1', title: '対称な図形（線対称・点対称）' },
            { id: '6-2', title: '文字と式（xやyを使った式）' },
            { id: '6-3', title: '分数のかけ算' },
            { id: '6-4', title: '分数のわり算' },
            { id: '6-5', title: '比（比の等しさ、比の値）' },
            { id: '6-6', title: '拡大図と縮図' },
            { id: '6-7', title: '円の面積' },
            { id: '6-8', title: '角柱と円柱の体積' },
            { id: '6-9', title: 'およその面積と体積' },
            { id: '6-10', title: '並べ方と組み合わせ（場合の数）' },
            { id: '6-11', title: 'データの活用（平均値、中央値、最頻値、ドットプロット）' },
            { id: '6-12', title: '算数のまとめ（小学校6年間の総復習）' },
        ]
    },
    {
        id: 'math-elem-review',
        title: '小学校 重要単元13選',
        description: '小学校の算数で特につまずきやすい重要な13単元を厳選。6年生の総復習に最適です。',
        price: 800,
        category: '小学6年生（総復習）',
        units: [
            { id: 'R-1', title: 'くり上がり・くり下がりの計算（1年）' },
            { id: 'R-2', title: 'かけ算九九（2年）' },
            { id: 'R-3', title: '時こくと時間（2・3年）' },
            { id: 'R-4', title: 'わり算の基礎とあまり（3年）' },
            { id: 'R-5', title: '小数・分数の仕組み（3年）' },
            { id: 'R-6', title: '2けたでわるわり算の筆算（4年）' },
            { id: 'R-7', title: '面積の公式と単位（4・5年）' },
            { id: 'R-8', title: '分数の通分・約分と四則計算（5・6年）' },
            { id: 'R-9', title: '単位量あたりの大きさ（5年）' },
            { id: 'R-10', title: '割合（％、歩合）（5年）' },
            { id: 'R-11', title: '速さ（6年）' },
            { id: 'R-12', title: '比（6年）' },
            { id: 'R-13', title: '文字と式（x の使用）（6年）' },
        ]
    },
    {
        id: 'math-jhs-grade1',
        title: '中学数学 上',
        description: '中学校一年生の数学。算数から数学へ。正の数・負の数や方程式など、新しい概念が一気に登場します。',
        price: 1000,
        category: '中学1年生',
        units: [
            { id: 'J1-1', title: '正の数・負の数（マイナスの概念、絶対値、四則計算）' },
            { id: 'J1-2', title: '文字の式（式の表し方、代入、文字式の計算）' },
            { id: 'J1-3', title: '一元一次方程式（方程式の解き方、利用・文章題）' },
            { id: 'J1-4', title: '変化と対応（比例・反比例）（座標、グラフ、式の求め方）' },
            { id: 'J1-5', title: '平面図形（直線と角、図形の移動、作図、円と扇形）' },
            { id: 'J1-6', title: '空間図形（直線や平面の位置関係、立体の表面積・体積）' },
            { id: 'J1-7', title: 'データの活用（近似値、誤差、度数分布、相対度数、累積度数）' },
        ]
    },
    {
        id: 'math-jhs-grade2',
        title: '中学数学 中',
        description: '中学校二年生の数学。連立方程式や証明問題など、論理的な思考力がより一層求められます。',
        price: 1250,
        category: '中学2年生',
        units: [
            { id: 'J2-1', title: '式の計算（単項式と多項式、文字式の加法・減法、乗法・除法、文字式の利用）' },
            { id: 'J2-2', title: '連立二元一次方程式（連立方程式）（解き方、代入法・加減法、連立方程式の利用）' },
            { id: 'J2-3', title: '一次関数（変化の割合、グラフ、一次関数の式の求め方、二元一次方程式とグラフ）' },
            { id: 'J2-4', title: '図形の性質（平行と合同）（平行線と角、多角形の角、三角形の合同条件、証明の進め方）' },
            { id: 'J2-5', title: '図形の性質（三角形と四角形）（二等辺三角形、直角三角形、平行四辺形の性質・条件）' },
            { id: 'J2-6', title: 'データの活用（確率）（場合の数、確率の求め方）' },
            { id: 'J2-7', title: 'データの活用（箱ひげ図）（四分位数、箱ひげ図の書き方と読み取り）' },
        ]
    },
    {
        id: 'math-jhs-grade3',
        title: '中学数学 下',
        description: '中学校三年生の数学。因数分解、平方根、二次関数など、高校入試に向けた高度な内容を学びます。',
        price: 1500,
        category: '中学3年生',
        units: [
            { id: 'J3-1', title: '式の展開と因数分解（展開公式、共通因数、因数分解の活用）' },
            { id: 'J3-2', title: '平方根（ルートの概念、根号を含む式の計算、有理化）' },
            { id: 'J3-3', title: '二次方程式（因数分解や解の公式による解法、方程式の利用）' },
            { id: 'J3-4', title: '関数 y=ax^2（二次関数）（グラフの性質、変化の割合、平均の速さ）' },
            { id: 'J3-5', title: '図形の性質と相似（相似条件、縮尺、平行線と線分の比）' },
            { id: 'J3-6', title: '円の性質（円周角の定理）（円周角と中心角、定理の逆）' },
            { id: 'J3-7', title: '三平方の定理（ピタゴラスの定理）（直角三角形の辺の計算、平面・空間図形への応用）' },
            { id: 'J3-8', title: '標本調査（全数調査と標本調査、推定）' },
        ]
    },
    {
        id: 'math-jhs-important11',
        title: '中学数学 重要単元11選',
        description: '中学数学の3年間で特に重要な11単元を厳選。高校入試対策や総復習に最適です。',
        price: 1750,
        category: '中学数学（総復習）',
        units: [
            { id: 'J-Imp-1', title: '正の数・負の数（全ての計算の基礎）' },
            { id: 'J-Imp-2', title: '文字の式・式の計算（数学の言語）' },
            { id: 'J-Imp-3', title: '一次方程式・連立方程式・二次方程式（問題を解く主要な道具）' },
            { id: 'J-Imp-4', title: '一次関数（関数の考え方の中心）' },
            { id: 'J-Imp-5', title: '関数 y=ax^2（高校数学の二次関数へ直結）' },
            { id: 'J-Imp-6', title: '三角形の合同と証明（論理的思考の訓練）' },
            { id: 'J-Imp-7', title: '展開と因数分解（計算を簡略化する必須技術）' },
            { id: 'J-Imp-8', title: '平方根（無理数の理解）' },
            { id: 'J-Imp-9', title: '図形の相似（図形問題の最頻出単元）' },
            { id: 'J-Imp-10', title: '三平方の定理（長さを求める最強の定理）' },
            { id: 'J-Imp-11', title: '確率・箱ひげ図（近年入試で配点が増加中）' },
        ]
    },
    {
        id: 'math-hs-1a-set',
        title: '高校数学 I・A セット',
        description: '高校数学の基礎となる数学Iと数学Aのセット。数と式、図形、データ分析、確率など幅広い分野を学びます。',
        price: 1500,
        category: '高校数学',
        units: [
            { id: 'HS1-1', title: '【数I】数と式' },
            { id: 'HS1-2', title: '【数I】図形と計量' },
            { id: 'HS1-3', title: '【数I】二次関数' },
            { id: 'HS1-4', title: '【数I】データの分析' },
            { id: 'HSA-1', title: '【数A】図形の性質' },
            { id: 'HSA-2', title: '【数A】場合の数と確率' },
            { id: 'HSA-3', title: '【数A】数学と人間の活動' },
        ]
    },
    {
        id: 'math-hs-2b-set',
        title: '高校数学 II・B セット',
        description: '数学I・Aを発展させた内容。微積分、ベクトル、数列など、理系・文系問わず重要な概念が登場します。',
        price: 1750,
        category: '高校数学',
        units: [
            { id: 'HS2-1', title: '【数II】数と式・複素数と方程式' },
            { id: 'HS2-2', title: '【数II】図形と方程式' },
            { id: 'HS2-3', title: '【数II】指数関数・対数関数' },
            { id: 'HS2-4', title: '【数II】三角関数' },
            { id: 'HS2-5', title: '【数II】微分・積分の考え' },
            { id: 'HSB-1', title: '【数B】数列' },
            { id: 'HSB-2', title: '【数B】統計的な推測' },
            { id: 'HSB-3', title: '【数B】数学と社会生活' },
        ]
    },
    {
        id: 'math-hs-3c-set',
        title: '高校数学 III・C セット',
        description: '理系数学の集大成。極限、高度な微積分、複素数平面など、大学数学へ繋がる高度な理論を学びます。',
        price: 2000,
        category: '高校数学',
        units: [
            { id: 'HS3-1', title: '【数III】極限' },
            { id: 'HS3-2', title: '【数III】微分法' },
            { id: 'HS3-3', title: '【数III】積分法' },
            { id: 'HSC-1', title: '【数C】ベクトル' },
            { id: 'HSC-2', title: '【数C】平面上の曲線と複素数平面' },
            { id: 'HSC-3', title: '【数C】数学的な表現の工夫' },
        ]
    }
];

// --- Helper Functions ---

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
};

const generateQuestions = (settings: DrillSettings): DrillQuestion[] => {
    const questions: DrillQuestion[] = [];
    const types = settings.types;
    const { difficulty } = settings;
    
    // Define ranges based on difficulty
    // Easy: 1 digit (1-9)
    // Normal: 2-3 digits (10-999)
    // Hard: 4+ digits (1000-9999)
    
    for (let i = 0; i < settings.count; i++) {
        const type = types[i % types.length];
        let qText = "";
        let ans = 0;

        switch (type) {
            case 'add': {
                let min, max;
                if (difficulty === 'easy') { min=1; max=9; }
                else if (difficulty === 'normal') { min=10; max=999; }
                else { min=1000; max=9999; }

                const a = getRandomInt(min, max);
                const b = getRandomInt(min, max);
                qText = `${a} + ${b}`;
                ans = a + b;
                break;
            }
            case 'sub': {
                let min, max;
                if (difficulty === 'easy') { min=1; max=9; }
                else if (difficulty === 'normal') { min=10; max=999; }
                else { min=1000; max=9999; }

                const a = getRandomInt(min, max);
                const b = getRandomInt(min < 10 ? 1 : 10, a); 
                qText = `${a} - ${b}`;
                ans = a - b;
                break;
            }
            case 'mul': {
                let a, b;
                if (difficulty === 'easy') { 
                    a = getRandomInt(1, 9); 
                    b = getRandomInt(1, 9); 
                } else if (difficulty === 'normal') {
                    // 2-3 digits approx for result, or input
                    // Normal is usually 2x2 or 3x1
                    a = getRandomInt(10, 99);
                    b = getRandomInt(10, 99);
                } else {
                    // Hard: 4+ digits involved
                    a = getRandomInt(100, 999);
                    b = getRandomInt(10, 999);
                }
                qText = `${a} × ${b}`;
                ans = a * b;
                break;
            }
            case 'div': {
                // Generate B and Result, calculate A = B * Result
                let b, result;
                if (difficulty === 'easy') {
                    b = getRandomInt(2, 9);
                    result = getRandomInt(2, 9);
                } else if (difficulty === 'normal') {
                    b = getRandomInt(2, 20);
                    result = getRandomInt(10, 50);
                } else {
                    b = getRandomInt(10, 99);
                    result = getRandomInt(100, 999);
                }
                const a = b * result;
                qText = `${a} ÷ ${b}`;
                ans = result;
                break;
            }
            case 'exp': {
                let base, exp;
                if (difficulty === 'easy') {
                    base = getRandomInt(2, 9);
                    exp = 2; // Squares
                } else if (difficulty === 'normal') {
                    base = getRandomInt(2, 9);
                    exp = getRandomInt(3, 4);
                } else {
                    base = getRandomInt(10, 20);
                    exp = getRandomInt(3, 5);
                }
                qText = `${base}^${exp}`;
                ans = Math.pow(base, exp);
                break;
            }
            case 'root': {
                // Similar to Exp
                let base, exp;
                 if (difficulty === 'easy') {
                    base = getRandomInt(2, 9);
                    exp = 2; // Square root
                } else if (difficulty === 'normal') {
                    base = getRandomInt(2, 9);
                    exp = 3; // Cube root
                } else {
                    base = getRandomInt(2, 9);
                    exp = 4;
                }
                const num = Math.pow(base, exp);
                qText = exp === 2 ? `√${num}` : (exp === 3 ? `∛${num}` : `⁴√${num}`);
                ans = base;
                break;
            }
        }
        questions.push({ id: i, question: qText, answer: ans });
    }
    return questions.sort(() => Math.random() - 0.5);
};

// --- Components ---

// Drawing Canvas Component
const MemoPad = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            // Set actual size in memory (scaled to account for pixel density if needed, but keeping simple here)
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            const context = canvas.getContext('2d');
            if (context) {
                context.strokeStyle = '#3b82f6'; // Accent color
                context.lineWidth = 2;
                context.lineCap = 'round';
                setCtx(context);
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        ctx?.beginPath();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctx || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    return (
        <div className="relative w-full h-40 md:h-64 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden touch-none">
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
            />
            <div className="absolute top-2 right-2 flex gap-2">
                 <div className="p-1 bg-white/80 dark:bg-slate-800/80 rounded shadow text-slate-400 pointer-events-none">
                    <PenIcon />
                 </div>
                 <button onClick={clearCanvas} className="p-1 bg-white dark:bg-slate-800 rounded shadow hover:text-red-500 transition-colors z-10">
                    <EraserIcon />
                 </button>
            </div>
            <div className="absolute bottom-2 left-3 text-xs text-slate-300 pointer-events-none select-none">メモ帳</div>
        </div>
    );
};

export default function App() {
  // Global App State
  const [activeTab, setActiveTab] = useState<'home' | 'training' | 'bookshelf' | 'shop' | 'settings'>('home');
  const [showInfo, setShowInfo] = useState(false);
  const [showMission, setShowMission] = useState(false);
  
  // Persistent State (LocalStorage)
  const [lp, setLp] = useState<number>(() => {
    try {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem('mathcore_lp');
            const parsed = item ? parseInt(item, 10) : 0;
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    } catch { return 0; }
  });
  
  const [totalTime, setTotalTime] = useState<number>(() => {
    try {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem('mathcore_time');
            const parsed = item ? parseInt(item, 10) : 0;
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    } catch { return 0; }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem('mathcore_history');
            return item ? JSON.parse(item) : [];
        }
        return [];
    } catch { return []; }
  });

  const [ownedLicenses, setOwnedLicenses] = useState<string[]>(() => {
    try {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem('mathcore_licenses');
            return item ? JSON.parse(item) : [];
        }
        return [];
    } catch { return []; }
  });

  const [completedUnits, setCompletedUnits] = useState<string[]>(() => {
      try {
          if (typeof window !== 'undefined') {
              const item = localStorage.getItem('mathcore_completed_units');
              return item ? JSON.parse(item) : [];
          }
          return [];
      } catch { return []; }
  });

  // Home Tab State
  const [lessonState, setLessonState] = useState<LessonState>({
    topic: "",
    category: "",
    content: "",
    isLoading: false,
    error: null,
    isCompleted: false,
  });
  
  // Drill State
  const [drillSettings, setDrillSettings] = useState<DrillSettings>({
      types: ['add', 'sub', 'mul', 'div'],
      count: 10,
      difficulty: 'normal'
  });
  const [drillStatus, setDrillStatus] = useState<'idle' | 'active' | 'result'>('idle');
  const [drillQuestions, setDrillQuestions] = useState<DrillQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [drillInput, setDrillInput] = useState("");
  const [drillScore, setDrillScore] = useState(0);
  const [earnedDrillLP, setEarnedDrillLP] = useState(0);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // --- Modal States ---
  const [purchaseModalProduct, setPurchaseModalProduct] = useState<Product | null>(null);
  const [notificationModal, setNotificationModal] = useState<{title: string, message: string} | null>(null);
  const [confirmModal, setConfirmModal] = useState<{title: string, message: string, onConfirm: () => void} | null>(null);

  // Save Data with robust error handling
  useEffect(() => {
      try { localStorage.setItem('mathcore_lp', lp.toString()); } catch (e) { console.error('Failed to save LP:', e); }
  }, [lp]);
  useEffect(() => {
      try { localStorage.setItem('mathcore_time', totalTime.toString()); } catch (e) { console.error('Failed to save time:', e); }
  }, [totalTime]);
  useEffect(() => {
      try { localStorage.setItem('mathcore_history', JSON.stringify(history)); } catch (e) { console.error('Failed to save history:', e); }
  }, [history]);
  useEffect(() => {
      try { localStorage.setItem('mathcore_licenses', JSON.stringify(ownedLicenses)); } catch (e) { console.error('Failed to save licenses:', e); }
  }, [ownedLicenses]);
  useEffect(() => {
      try { localStorage.setItem('mathcore_completed_units', JSON.stringify(completedUnits)); } catch (e) { console.error('Failed to save completed units:', e); }
  }, [completedUnits]);

  // Timer
  useEffect(() => {
    let interval: any;
    const isLessonActive = lessonState.topic && !lessonState.isLoading;
    const isDrillActive = drillStatus === 'active';

    if (isLessonActive || isDrillActive) {
        interval = setInterval(() => setTotalTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [lessonState.topic, lessonState.isLoading, drillStatus]);

  // --- Handlers: Shop (New Logic with Modals) ---

  const initiatePurchase = (product: Product) => {
      if (ownedLicenses.includes(product.id)) {
          return;
      }
      if (Number(lp) < Number(product.price)) {
          setNotificationModal({
              title: "LPが足りません",
              message: `あと ${product.price - lp} LP 必要です。\n計算特訓でLPを貯めましょう。`
          });
          return;
      }
      setPurchaseModalProduct(product);
  };

  const confirmPurchase = () => {
      if (!purchaseModalProduct) return;
      
      const product = purchaseModalProduct;
      // Execute purchase
      setLp(prev => prev - product.price);
      setOwnedLicenses(prev => [...prev, product.id]);
      
      // Close confirm modal
      setPurchaseModalProduct(null);
      
      // Open success modal
      setNotificationModal({
          title: "購入完了",
          message: `「${product.title}」を購入しました！\nホーム画面の本棚に追加されました。`
      });
  };

  // --- Handlers: Lesson ---
  
  const startLesson = async (unit: Unit, product: Product) => {
    setLessonState({
      bookId: product.id,
      unitId: unit.id,
      topic: unit.title,
      category: product.category,
      content: "",
      isLoading: true,
      error: null,
      isCompleted: completedUnits.includes(unit.id),
    });

    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      topic: unit.title,
      category: product.category,
      timestamp: Date.now()
    };
    setHistory(prev => [newHistoryItem, ...prev].slice(0, 50)); 

    try {
      const content = await generateLesson(unit.title, product.category);
      setLessonState(prev => ({ ...prev, content, isLoading: false }));
    } catch (err) {
      setLessonState(prev => ({ ...prev, error: "エラーが発生しました", isLoading: false }));
    }
  };

  const completeLesson = () => {
      if (lessonState.isCompleted) return;
      
      const unitReward = 100;
      let totalReward = unitReward;
      let messages = [`講義完了！ ${unitReward} LPを獲得しました！`];

      // Mark unit as completed
      const newCompletedUnits = [...completedUnits];
      if (lessonState.unitId && !completedUnits.includes(lessonState.unitId)) {
          newCompletedUnits.push(lessonState.unitId);
          setCompletedUnits(newCompletedUnits);

          // Check for Book Completion
          if (lessonState.bookId) {
              const book = PRODUCTS.find(p => p.id === lessonState.bookId);
              if (book) {
                  const bookUnitIds = book.units.map(u => u.id);
                  const isBookComplete = bookUnitIds.every(id => newCompletedUnits.includes(id));
                  
                  if (isBookComplete) {
                      const bonus = 500;
                      totalReward += bonus;
                      messages.push(`\n🎉 おめでとうございます！\n「${book.title}」を全単元読了しました！\nボーナス ${bonus} LPを獲得！`);
                  }
              }
          }
      }

      setLp(prev => prev + totalReward);
      setLessonState(prev => ({ ...prev, isCompleted: true }));
      setNotificationModal({
          title: "学習完了",
          message: messages.join("")
      });
  };

  const handleBackToHome = () => {
      setLessonState({
        topic: "",
        category: "",
        content: "",
        isLoading: false,
        error: null,
        isCompleted: false
      });
  };

  // --- Handlers: Chat ---
  
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMessage: ChatMessage = { role: 'user', text: chatInput, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);
    const context = chatHistory.map(m => ({ role: m.role, text: m.text }));
    if (lessonState.content) {
        context.unshift({ role: 'model', text: `Context: ${lessonState.content.substring(0, 500)}...` });
    }
    const responseText = await generateChatResponse(context, userMessage.text);
    setChatHistory(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    setIsChatLoading(false);
  };

  // --- Handlers: Drill ---

  const toggleDrillType = (type: DrillType) => {
      setDrillSettings(prev => {
          const newTypes = prev.types.includes(type) 
              ? prev.types.filter(t => t !== type)
              : [...prev.types, type];
          if (newTypes.length === 0) return prev;
          return { ...prev, types: newTypes };
      });
  };

  const startDrill = () => {
      const questions = generateQuestions(drillSettings);
      setDrillQuestions(questions);
      setCurrentQuestionIndex(0);
      setDrillInput("");
      setDrillScore(0);
      setDrillStatus('active');
  };

  const submitDrillAnswer = (e: React.FormEvent) => {
      e.preventDefault();
      const currentQ = drillQuestions[currentQuestionIndex];
      const isCorrect = parseInt(drillInput) === currentQ.answer;
      
      const updatedQuestions = [...drillQuestions];
      updatedQuestions[currentQuestionIndex] = { ...currentQ, userAnswer: drillInput, isCorrect };
      setDrillQuestions(updatedQuestions);

      if (isCorrect) setDrillScore(prev => prev + 1);

      if (currentQuestionIndex < drillQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setDrillInput("");
      } else {
          finishDrill(updatedQuestions, isCorrect ? drillScore + 1 : drillScore);
      }
  };

  const finishDrill = (results: DrillQuestion[], finalScore: number) => {
      let baseSum = 0;
      drillSettings.types.forEach(t => {
          baseSum += DRILL_LP_RATES[t];
      });
      
      const countMultiplier = COUNT_MULTIPLIERS[drillSettings.count];
      const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[drillSettings.difficulty];
      
      const maxPossibleLP = baseSum * countMultiplier * difficultyMultiplier;
      const earned = Math.floor(maxPossibleLP * (finalScore / drillSettings.count));

      setEarnedDrillLP(earned);
      setLp(prev => prev + earned);
      setDrillStatus('result');
  };

  const handleQuitDrill = () => {
    // Explicitly using a modal for quitting, ensuring drillStatus is reset upon confirmation
    setConfirmModal({
        title: "特訓を中断",
        message: "特訓を中断しますか？\n(スコアと獲得LPは破棄されます)",
        onConfirm: () => {
            setDrillStatus('idle');
            setDrillScore(0);
            setDrillInput("");
            setCurrentQuestionIndex(0);
            setConfirmModal(null);
        }
    });
  };

  const resetData = () => {
      setConfirmModal({
          title: "データリセット",
          message: "すべての学習データをリセットしますか？この操作は取り消せません。",
          onConfirm: () => {
              setLp(0);
              setTotalTime(0);
              setHistory([]);
              setOwnedLicenses([]);
              setCompletedUnits([]);
              localStorage.clear();
              window.location.reload();
          }
      });
  };

  const getCategoryColor = (category: string, isDark: boolean = false) => {
      if (category.includes("1年生")) return isDark ? "dark:bg-orange-900 dark:text-orange-200" : "bg-orange-100 text-orange-600";
      if (category.includes("2年生")) return isDark ? "dark:bg-green-900 dark:text-green-200" : "bg-green-100 text-green-600";
      if (category.includes("3年生")) return isDark ? "dark:bg-blue-900 dark:text-blue-200" : "bg-blue-100 text-blue-600";
      if (category.includes("4年生")) return isDark ? "dark:bg-purple-900 dark:text-purple-200" : "bg-purple-100 text-purple-600";
      if (category.includes("5年生")) return isDark ? "dark:bg-red-900 dark:text-red-200" : "bg-red-100 text-red-600";
      if (category.includes("6年生")) return isDark ? "dark:bg-indigo-900 dark:text-indigo-200" : "bg-indigo-100 text-indigo-600";
      if (category.includes("中学")) return isDark ? "dark:bg-teal-900 dark:text-teal-200" : "bg-teal-100 text-teal-600";
      if (category.includes("高校")) return isDark ? "dark:bg-sky-900 dark:text-sky-200" : "bg-sky-100 text-sky-600";
      return isDark ? "dark:bg-slate-700 dark:text-slate-300" : "bg-slate-100 text-slate-500";
  };

  const getCategoryGradient = (category: string) => {
      if (category.includes("1年生")) return "from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("2年生")) return "from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("3年生")) return "from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("4年生")) return "from-purple-50 to-fuchsia-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("5年生")) return "from-red-50 to-rose-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("6年生")) return "from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("中学")) return "from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("高校")) return "from-sky-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800";
      return "from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-800";
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* 1. Global Top Header */}
      <header className="h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-50 shadow-sm relative shrink-0">
        <div className="flex items-center gap-3">
             <button 
                onClick={() => setShowMission(true)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                title="Mission"
             >
                 <MissionIcon />
             </button>
             <div className="font-bold text-lg flex items-center gap-2">
                <span className="text-accent"><SparklesIcon /></span>
                <span className="hidden sm:inline">Σxplore Math</span>
             </div>
        </div>
        
        {/* LP Display */}
        <div className="flex items-center justify-center flex-1">
            <div className="bg-slate-100 dark:bg-slate-800 px-6 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-inner">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">LP</span>
                <span className="font-mono font-bold text-accent text-lg">{lp.toLocaleString()}</span>
            </div>
        </div>

        {/* Info Button */}
        <button 
            onClick={() => setShowInfo(true)}
            className="p-2 text-slate-500 hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
            <InfoIcon />
        </button>
      </header>

      {/* 2. Global Navigation Tabs */}
      <nav className="flex items-center justify-center bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <TabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<HomeIcon />} label="ホーム" />
        <TabButton active={activeTab === 'training'} onClick={() => setActiveTab('training')} icon={<CalculatorIcon />} label="計算特訓" />
        <TabButton active={activeTab === 'bookshelf'} onClick={() => setActiveTab('bookshelf')} icon={<BookIcon />} label="本棚" />
        <TabButton active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={<ShopIcon />} label="ショップ" />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon />} label="設定" />
      </nav>

      {/* 3. Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
             <div className="h-full w-full overflow-hidden flex flex-col">
                {/* View 1: Dashboard (Default) */}
                {!lessonState.topic && (
                    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                         <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                             ダッシュボード
                         </h2>

                        {/* Total Time Card */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex items-center gap-5">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                                <ClockIcon />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">総学習時間</div>
                                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                                    {formatTime(totalTime)}
                                </div>
                            </div>
                        </div>
                        
                        {/* OWNED BOOKS */}
                        {ownedLicenses.length > 0 ? (
                            <div className="space-y-8 mb-10">
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                        <BookIcon /> 学習中の参考書
                                    </h3>
                                </div>
                                
                                {/* Filter and map products based on owned licenses */}
                                {PRODUCTS.filter(p => ownedLicenses.includes(p.id)).map(book => (
                                    <div key={book.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className={`p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r ${getCategoryGradient(book.category)}`}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getCategoryColor(book.category)} ${getCategoryColor(book.category, true)}`}>
                                                        {book.category}
                                                    </span>
                                                    <h4 className="text-xl font-bold mt-2 text-slate-800 dark:text-slate-100">{book.title}</h4>
                                                    <p className="text-sm text-slate-500 mt-1">{book.description}</p>
                                                </div>
                                                <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-orange-400">
                                                    <StarIcon />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">目次</h5>
                                            <div className="space-y-2">
                                                {book.units.map(unit => {
                                                    const isDone = completedUnits.includes(unit.id);
                                                    return (
                                                        <button 
                                                            key={unit.id}
                                                            onClick={() => startLesson(unit, book)}
                                                            className="w-full p-3 flex items-center justify-between rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`
                                                                    w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors
                                                                    ${isDone ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-accent group-hover:text-white'}
                                                                `}>
                                                                    {isDone ? <CheckIcon /> : unit.id.split('-')[1]}
                                                                </span>
                                                                <span className={`font-medium transition-colors ${isDone ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-700 dark:text-slate-300 group-hover:text-accent'}`}>
                                                                    {unit.title}
                                                                </span>
                                                            </div>
                                                            <ChevronRight />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             /* Shop Prompt if no books owned */
                            <div className="p-8 mb-8 bg-slate-100 dark:bg-slate-800/50 rounded-2xl text-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                                <div className="inline-flex p-4 bg-white dark:bg-slate-800 rounded-full mb-4 shadow-sm">
                                    <ShopIcon />
                                </div>
                                <h3 className="text-lg font-bold mb-2">まだ参考書を持っていません</h3>
                                <p className="text-slate-500 mb-6 text-sm">ショップでライセンスを購入して学習を始めましょう。</p>
                                <button 
                                    onClick={() => setActiveTab('shop')}
                                    className="px-6 py-3 bg-accent text-white font-bold rounded-xl shadow hover:bg-blue-600 transition-colors"
                                >
                                    ショップへ移動
                                </button>
                            </div>
                        )}

                        {/* History List */}
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <BookIcon /> 学習履歴
                        </h3>
                        <div className="space-y-3 mb-8">
                            {history.length === 0 ? (
                                <div className="text-center py-12 px-6 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                    <div className="mb-2 text-3xl opacity-30">📭</div>
                                    <p>学習履歴はまだありません</p>
                                    <p className="text-xs mt-2 opacity-70">計算特訓や参考書での学習記録がここに表示されます</p>
                                </div>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{item.topic}</div>
                                            <div className="text-xs text-slate-500 mt-1">{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </div>
                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 font-medium">
                                            {item.category}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* View 2: Lesson Content (If manually loaded, kept for future compatibility) */}
                {lessonState.topic && (
                    <div className="flex-1 flex flex-col h-full relative bg-white dark:bg-slate-950">
                        {/* Lesson Header */}
                        <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur">
                            <button onClick={handleBackToHome} className="mr-4 text-sm font-bold text-accent hover:underline">
                                ← 戻る
                            </button>
                            <h1 className="font-bold truncate text-slate-800 dark:text-slate-200">{lessonState.topic}</h1>
                        </header>

                        <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 max-w-4xl mx-auto w-full">
                            {lessonState.isLoading ? (
                                <div className="animate-pulse space-y-4 py-10">
                                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-8"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                                    <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded mt-8"></div>
                                    <div className="text-center text-slate-400 mt-4 text-sm animate-bounce">Generating lesson content...</div>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {lessonState.error ? (
                                        <div className="text-red-500 bg-red-50 p-4 rounded">{lessonState.error}</div>
                                    ) : (
                                        <>
                                            <MarkdownRenderer content={lessonState.content} />
                                            
                                            <div className="flex justify-center pt-8 border-t border-slate-100 dark:border-slate-800">
                                                <button 
                                                    onClick={completeLesson}
                                                    disabled={lessonState.isCompleted}
                                                    className={`
                                                        px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center gap-2
                                                        ${lessonState.isCompleted 
                                                            ? 'bg-green-500 text-white cursor-default' 
                                                            : 'bg-accent hover:bg-blue-600 text-white hover:shadow-xl'}
                                                    `}
                                                >
                                                    {lessonState.isCompleted ? (
                                                        <> <CheckIcon /> 獲得済み (100 LP) </>
                                                    ) : (
                                                        <> 読了して 100 LP を獲得 </>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {/* Chat Section */}
                                    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                                        <h3 className="text-lg font-bold mb-4">AIチューターに質問</h3>
                                        <div className="space-y-4 mb-4">
                                            {chatHistory.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                        <MarkdownRenderer content={msg.text} />
                                                    </div>
                                                </div>
                                            ))}
                                            {isChatLoading && <div className="text-slate-400 text-sm">入力中...</div>}
                                        </div>
                                        <form onSubmit={handleChatSubmit} className="relative">
                                            <input 
                                                value={chatInput} 
                                                onChange={e => setChatInput(e.target.value)}
                                                className="w-full p-3 pr-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                                                placeholder="ここに入力..."
                                                disabled={isChatLoading}
                                            />
                                            <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 top-2 p-1.5 bg-accent text-white rounded-lg">
                                                <SendIcon />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                )}
             </div>
          )}

          {/* TRAINING TAB */}
          {activeTab === 'training' && (
              <div className="h-full overflow-y-auto p-4 max-w-2xl mx-auto flex flex-col justify-center min-h-full">
                  {drillStatus === 'idle' && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
                          <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                              <CalculatorIcon /> 計算特訓
                          </h2>
                          
                          <div className="mb-8">
                              <h3 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">難易度</h3>
                              <div className="flex gap-2">
                                  {(['easy', 'normal', 'hard'] as Difficulty[]).map(diff => (
                                      <button 
                                        key={diff}
                                        onClick={() => setDrillSettings(prev => ({ ...prev, difficulty: diff }))}
                                        className={`
                                            flex-1 py-3 rounded-xl border text-center font-medium transition-all
                                            ${drillSettings.difficulty === diff
                                                ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'}
                                        `}
                                      >
                                          {diff === 'easy' && '簡単 (0.75x)'}
                                          {diff === 'normal' && '普通 (1.0x)'}
                                          {diff === 'hard' && '難しい (1.5x)'}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <div className="mb-8">
                              <h3 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">出題範囲</h3>
                              <div className="grid grid-cols-2 gap-3">
                                  {(['add', 'sub', 'mul', 'div', 'exp', 'root'] as DrillType[]).map(type => (
                                      <button 
                                        key={type}
                                        onClick={() => toggleDrillType(type)}
                                        className={`
                                            p-3 rounded-xl border text-sm font-medium transition-all flex justify-between items-center
                                            ${drillSettings.types.includes(type) 
                                                ? 'border-accent bg-accent/5 text-accent shadow-sm' 
                                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                        `}
                                      >
                                          <span>
                                              {type === 'add' && 'たし算'}
                                              {type === 'sub' && 'ひき算'}
                                              {type === 'mul' && 'かけ算'}
                                              {type === 'div' && 'わり算'}
                                              {type === 'exp' && '冪乗 (xⁿ)'}
                                              {type === 'root' && 'n乗根 (ⁿ√x)'}
                                          </span>
                                          <span className="text-xs opacity-70">
                                              {DRILL_LP_RATES[type]} LP
                                          </span>
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <div className="mb-8">
                              <h3 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">問題数 (倍率)</h3>
                              <div className="flex gap-2">
                                  {([10, 25, 50] as const).map(count => (
                                      <button 
                                        key={count}
                                        onClick={() => setDrillSettings(prev => ({ ...prev, count }))}
                                        className={`
                                            flex-1 py-3 rounded-xl border text-center font-medium transition-all
                                            ${drillSettings.count === count
                                                ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'}
                                        `}
                                      >
                                          {count}問 <span className="text-xs opacity-70">({COUNT_MULTIPLIERS[count]}倍)</span>
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <button 
                            onClick={startDrill}
                            className="w-full py-4 bg-accent hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                          >
                              スタート
                          </button>
                      </div>
                  )}

                  {drillStatus === 'active' && (
                      <div className="flex flex-col h-full max-h-[800px]">
                          <div className="flex justify-between items-center mb-4 px-2">
                              <button onClick={handleQuitDrill} className="text-xs text-slate-400 hover:text-red-500 font-bold px-2 py-1 rounded border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors">
                                  中断する
                              </button>
                              <span className="text-sm font-mono text-slate-500">Q.{currentQuestionIndex + 1} / {drillQuestions.length}</span>
                              <span className="text-sm font-bold text-accent">Score: {drillScore}</span>
                          </div>

                          <div className="flex-1 flex flex-col gap-4">
                              {/* Question Card */}
                              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-8 flex items-center justify-center min-h-[160px] border border-slate-200 dark:border-slate-800">
                                  <span className="text-4xl md:text-5xl font-mono font-bold tracking-wider">
                                      {drillQuestions[currentQuestionIndex].question} = ?
                                  </span>
                              </div>

                              {/* Memo Pad */}
                              <MemoPad />

                              {/* Input Area */}
                              <form onSubmit={submitDrillAnswer} className="mt-auto">
                                  <div className="flex gap-2">
                                      <input 
                                        type="number" 
                                        inputMode="decimal"
                                        autoFocus
                                        value={drillInput}
                                        onChange={e => setDrillInput(e.target.value)}
                                        className="flex-1 p-4 rounded-xl text-2xl font-mono text-center border border-slate-300 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-accent outline-none"
                                        placeholder="答えを入力"
                                      />
                                      <button 
                                        type="submit" 
                                        disabled={!drillInput}
                                        className="px-6 bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl disabled:opacity-50"
                                      >
                                          次へ
                                      </button>
                                  </div>
                              </form>
                          </div>
                      </div>
                  )}

                  {drillStatus === 'result' && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-800">
                          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                              <CheckIcon />
                          </div>
                          <h2 className="text-2xl font-bold mb-2">特訓完了！</h2>
                          <div className="text-6xl font-black text-accent mb-2">+{earnedDrillLP} <span className="text-xl text-slate-500">LP</span></div>
                          <p className="text-slate-500 mb-8">
                              正解数: {drillScore} / {drillQuestions.length}
                          </p>
                          <button 
                            onClick={() => setDrillStatus('idle')}
                            className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
                          >
                              メニューに戻る
                          </button>
                      </div>
                  )}
              </div>
          )}

          {/* BOOKSHELF TAB */}
          {activeTab === 'bookshelf' && (
             <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <BookIcon /> 本棚
                </h2>
                
                {ownedLicenses.length > 0 ? (
                    <div className="space-y-6 mb-20">
                        {PRODUCTS.filter(p => ownedLicenses.includes(p.id)).map(book => {
                            const totalUnits = book.units.length;
                            const completedCount = book.units.filter(u => completedUnits.includes(u.id)).length;
                            const progress = Math.round((completedCount / totalUnits) * 100);
                            const isFullyComplete = progress === 100;

                            return (
                                <div key={book.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="p-6 flex items-start gap-4">
                                        <div className={`
                                            w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-sm text-white shrink-0
                                            bg-gradient-to-br ${getCategoryGradient(book.category)}
                                        `}>
                                            <BookIcon />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{book.title}</h3>
                                                {isFullyComplete && (
                                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                        <CrownIcon /> Complete
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mb-3">{book.category}</p>
                                            
                                            {/* Progress Bar */}
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden">
                                                <div 
                                                    className="bg-accent h-2.5 rounded-full transition-all duration-500" 
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>進捗: {progress}% ({completedCount}/{totalUnits})</span>
                                                <span>{isFullyComplete ? "全単元読了済み" : "学習中"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Quick Actions (Accordion style could be better, but simple list for now) */}
                                    <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50">
                                        <div className="text-xs font-bold text-slate-400 mb-2 uppercase">学習を続ける</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {book.units.slice(0, 4).map(unit => {
                                                 const isDone = completedUnits.includes(unit.id);
                                                 return (
                                                    <button 
                                                        key={unit.id}
                                                        onClick={() => startLesson(unit, book)}
                                                        className={`
                                                            text-left text-xs p-2 rounded border flex items-center justify-between
                                                            ${isDone 
                                                                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-accent hover:text-accent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}
                                                        `}
                                                    >
                                                        <span className="truncate flex-1">{unit.title}</span>
                                                        {isDone && <CheckIcon />}
                                                    </button>
                                                 );
                                            })}
                                            {book.units.length > 4 && (
                                                <button 
                                                    onClick={() => {
                                                        // Navigate to home tab and open this book (simulated by finding it in dashboard logic or just simple alert for now as deep linking isn't fully built)
                                                        // Better: Just switch tab to Home. The user can find it. 
                                                        // Ideally, we'd scroll to it, but simple tab switch is okay.
                                                        setActiveTab('home');
                                                    }}
                                                    className="text-xs p-2 rounded border border-dashed border-slate-300 text-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-center"
                                                >
                                                    すべての単元を見る ({book.units.length - 4}+)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 px-6">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <BookIcon />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">本棚は空です</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                            ショップで参考書を購入すると、ここに表示されます。
                        </p>
                        <button 
                            onClick={() => setActiveTab('shop')}
                            className="px-8 py-3 bg-accent hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-colors"
                        >
                            ショップへ行く
                        </button>
                    </div>
                )}
             </div>
          )}
          
          {/* SHOP TAB */}
          {activeTab === 'shop' && (
              <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                      <ShopIcon /> ショップ
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                      {PRODUCTS.map(product => {
                          const isOwned = ownedLicenses.includes(product.id);
                          const canAfford = lp >= product.price;

                          return (
                              <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                                  <div className={`p-6 bg-gradient-to-br ${getCategoryGradient(product.category)} border-b border-slate-100 dark:border-slate-800`}>
                                       <span className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm ${getCategoryColor(product.category)} ${getCategoryColor(product.category, true)}`}>
                                           {product.category}
                                       </span>
                                       <h3 className="text-xl font-bold mt-3 text-slate-900 dark:text-slate-100">{product.title}</h3>
                                  </div>
                                  <div className="p-6 flex-1 flex flex-col">
                                      <p className="text-slate-500 text-sm mb-6 flex-1 leading-relaxed">
                                          {product.description}
                                      </p>
                                      
                                      <div className="flex items-center justify-between mt-auto">
                                          <div className={`font-bold text-2xl font-mono ${canAfford || isOwned ? 'text-accent' : 'text-red-400'}`}>
                                              {product.price} <span className="text-sm text-slate-400 font-sans">LP</span>
                                          </div>
                                          {isOwned ? (
                                              <button disabled className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold rounded-xl cursor-default flex items-center gap-2">
                                                  <CheckIcon /> 購入済み
                                              </button>
                                          ) : (
                                              <button 
                                                onClick={() => initiatePurchase(product)}
                                                className={`
                                                    px-6 py-2.5 font-bold rounded-xl shadow-lg transition-all transform active:scale-95
                                                    ${canAfford 
                                                        ? 'bg-accent hover:bg-blue-600 text-white shadow-blue-500/30' 
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'}
                                                `}
                                              >
                                                  {canAfford ? "購入する" : "LP不足"}
                                              </button>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}
          
          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto p-6 md:p-12">
                  <h2 className="text-2xl font-bold mb-8">設定</h2>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                          <h3 className="font-semibold">データ管理</h3>
                      </div>
                      <div className="p-6">
                          <p className="text-sm text-slate-500 mb-4">
                              学習履歴、獲得したLP、総学習時間、購入したライセンスを含むすべてのローカルデータを削除します。この操作は元に戻せません。
                          </p>
                          <button 
                            onClick={resetData}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors text-sm font-medium"
                          >
                              <TrashIcon />
                              データをリセット
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* Info Modal */}
      {showInfo && (
          <Modal onClose={() => setShowInfo(false)}>
              <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4"><InfoIcon /></div>
                  <h3 className="text-xl font-bold mb-2">Σxplore Mathについて</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-4">
                      ショップでデジタル参考書・問題集ライセンスを購入し、楽しく数学を学ぼう
                  </p>
                  <p className="text-xs text-slate-400">
                      Powered by Google Gemini
                  </p>
              </div>
          </Modal>
      )}

      {/* Mission Modal */}
      {showMission && (
          <Modal onClose={() => setShowMission(false)}>
              <div className="flex flex-col items-center text-center">
                   <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                       <MissionIcon />
                   </div>
                   <h3 className="text-xl font-bold mb-4">ミッション</h3>
                   <div className="w-full space-y-3 mb-6">
                       <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-left opacity-50">
                           <div className="flex justify-between items-center mb-1">
                               <span className="font-bold text-sm">デイリーミッション</span>
                               <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-500">Coming Soon</span>
                           </div>
                           <p className="text-xs text-slate-500">計算特訓を1回完了する</p>
                       </div>
                       <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-left opacity-50">
                           <div className="flex justify-between items-center mb-1">
                               <span className="font-bold text-sm">ウィークリーミッション</span>
                               <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-500">Coming Soon</span>
                           </div>
                           <p className="text-xs text-slate-500">5000 LPを獲得する</p>
                       </div>
                   </div>
                   <button 
                    onClick={() => setShowMission(false)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                   >
                       閉じる
                   </button>
              </div>
          </Modal>
      )}
      
      {/* Purchase Confirmation Modal */}
      {purchaseModalProduct && (
          <Modal onClose={() => setPurchaseModalProduct(null)}>
              <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <ShopIcon />
                  </div>
                  <h3 className="text-xl font-bold mb-2">購入の確認</h3>
                  <p className="text-sm text-slate-500 mb-6">
                      以下の参考書を購入しますか？
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6 text-left border border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-bold text-slate-400 mb-1">{purchaseModalProduct.category}</div>
                      <div className="font-bold text-lg mb-2">{purchaseModalProduct.title}</div>
                      <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-700 pt-2">
                          <span className="text-sm text-slate-500">価格</span>
                          <span className="font-bold text-xl text-accent">{purchaseModalProduct.price} <span className="text-sm text-slate-400">LP</span></span>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button 
                        onClick={() => setPurchaseModalProduct(null)}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                      >
                          キャンセル
                      </button>
                      <button 
                        onClick={confirmPurchase}
                        className="flex-1 py-3 bg-accent hover:bg-blue-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                      >
                          購入する
                      </button>
                  </div>
              </div>
          </Modal>
      )}

      {/* Confirmation Modal (Generic) */}
      {confirmModal && (
          <Modal onClose={() => setConfirmModal(null)}>
              <div className="text-center">
                   <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                       <InfoIcon />
                   </div>
                   <h3 className="text-xl font-bold mb-4">{confirmModal.title}</h3>
                   <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-6 whitespace-pre-wrap">
                       {confirmModal.message}
                   </p>
                   <div className="flex gap-3">
                       <button 
                        onClick={() => setConfirmModal(null)}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                       >
                           キャンセル
                       </button>
                       <button 
                        onClick={confirmModal.onConfirm}
                        className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg"
                       >
                           実行する
                       </button>
                   </div>
              </div>
          </Modal>
      )}

      {/* Generic Notification Modal (Success/Alert) */}
      {notificationModal && (
          <Modal onClose={() => setNotificationModal(null)}>
              <div className="text-center">
                   <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                       {notificationModal.title.includes("完了") ? <CheckIcon /> : <InfoIcon />}
                   </div>
                   <h3 className="text-xl font-bold mb-4">{notificationModal.title}</h3>
                   <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-6 whitespace-pre-wrap">
                       {notificationModal.message}
                   </p>
                   <button 
                    onClick={() => setNotificationModal(null)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                   >
                       OK
                   </button>
              </div>
          </Modal>
      )}

    </div>
  );
}

// --- Helper Components ---

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`
            flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors relative
            ${active ? 'text-accent' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}
        `}
    >
        <span className={`${active ? 'scale-110' : ''} transition-transform duration-200`}>{icon}</span>
        <span className="text-[10px] font-bold">{label}</span>
        {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent mx-4 rounded-t-full"></span>}
    </button>
);

const PlaceholderTab = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-sm text-slate-300 dark:text-slate-600">
            <div className="scale-150">{icon}</div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">{title}</h2>
        <p className="text-slate-500 max-w-xs">{desc}</p>
    </div>
);

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative border border-slate-200 dark:border-slate-800">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              {children}
        </div>
    </div>
);